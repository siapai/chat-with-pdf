import { createUploadthing, type FileRouter } from "uploadthing/next";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {db} from "@/db";
import {PDFLoader} from "langchain/document_loaders/fs/pdf";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {QdrantVectorStore} from "langchain/vectorstores/qdrant";

import {client as qdrant } from "@/lib/qdrant"
import {getUserSubscriptionPlan} from "@/lib/stripe";
import {PLANS} from "@/config/stripe";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

const f = createUploadthing();

const middleware = async () => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    if(!user || !user.id)  {
        throw new Error("Unauthorized")
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    return { userId: user.id, subscriptionPlan };
}

const onUploadComplete = async ({ metadata, file } : {
    metadata: Awaited<ReturnType<typeof middleware>>
    file : {
        key: string
        name: string
        url: string
    }
}) => {

    const isFileExist = await db.file.findFirst({
        where: {
            key: file.key
        }
    })

    if(isFileExist) return

    const createdFile = await db.file.create({
        data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            uploadStatus: "PROCESSING"
        }
    })

    try {
        const response = await fetch(file.url)
        const blob = await response.blob()

        const loader = new PDFLoader(blob)


        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        const { subscriptionPlan } = metadata
        const { isSubscribed} = subscriptionPlan

        const isProExceeded = pagesAmt > PLANS.find(plan => plan.name === "Pro")!.pagesPerPdf
        const isFreeExceeded = pagesAmt > PLANS.find(plan => plan.name === "Free")!.pagesPerPdf

        const isInvalid = (isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)

        if(isInvalid) {
            await db.file.update({
                data: {
                    uploadStatus: "FAILED"
                },
                where: {
                    id: createdFile.id
                }
            })
        } else {
            // vectorized and index entire document

            // const pineconeIndex = pinecone.Index("chat-doc")



            const embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY
            })

            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
            const docOutput = await splitter.splitDocuments(pageLevelDocs)

            const docWithMetadata = docOutput.map(doc => {
                return {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        fileId: createdFile.id
                    },
                }
            })

            // await qdrant.deleteCollection(process.env.QDRANT_COLLECTION_NAME!)
            // await qdrant.createCollection(process.env.QDRANT_COLLECTION_NAME!, { vectors: {
            //         size: 1536,
            //         distance: "Cosine"
            // }})


            await QdrantVectorStore.fromDocuments(
                docWithMetadata,
                embeddings,
                {
                    client: qdrant,
                    collectionName: process.env.QDRANT_COLLECTION_NAME,
                }
            )




             // await PineconeStore.fromDocuments(
            //     pageLevelDocs,
            //     embeddings,
            //     {
            //         pineconeIndex,
            //         namespace: createdFile.id
            //     }
            // )

            await db.file.update({
                data: {
                    uploadStatus: "SUCCESS",
                },
                where: {
                    id: createdFile.id
                }
            })
        }



    } catch (err) {
        console.log("ERR", err)
        await db.file.update({
            data: {
                uploadStatus: "FAILED",
            },
            where: {
                id: createdFile.id
            }
        })
    }
}
export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: "8MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: "32MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
