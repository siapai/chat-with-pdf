import {NextRequest} from "next/server";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {SendMessageValidator} from "@/lib/validators/SendMessageValidator";
import {db} from "@/db";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {openai} from "@/lib/openai";
import {OpenAIStream, StreamingTextResponse} from "ai";
import {QdrantVectorStore} from "langchain/vectorstores/qdrant";
import {client as qdrant} from "@/lib/qdrant";

export const POST = async (req: NextRequest) => {
    // ep for asking question

    const body = await req.json()
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    const {id: userId } = user

    if (!userId) return new Response('Unauthorized',  {status: 401 })

    const {fileId, message} =
        SendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    })

    if(!file) return new Response('Not found',  {status: 404 })

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })

    // 1: vectorized message
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    })

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        client: qdrant,
        collectionName: process.env.QDRANT_COLLECTION_NAME,
    })


    const filter = {
        must: [
            {
                key: "metadata.fileId",
                match: {
                    value: fileId
                }
            }
        ]
    }


    const results = await vectorStore.similaritySearch(message, 4,  filter)


    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 6
    })

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "assistant" as const,
        content: msg.text
    }))



    const response = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0,
        stream: true,
        messages: [
            {
                role: 'system',
                content:
                'Use the following pieces of context only (or previous conversation if needed) to answer the users question in markdown format.',
            },
            {
                role: 'user',
                content: `Use the following pieces of context only (or previous conversation if needed) to answer the users question in markdown format.\nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedPrevMessages.map((message) => {
                                if (message.role === 'user') return `User: ${message.content}\n`
                                return `Assistant: ${message.content}\n`
                            })}
                
                \n----------------\n
                
                CONTEXT:
                ${results.map((r) => r.pageContent).join('\n\n')}
                
                USER INPUT: ${message}`,
            },
        ],
    })

    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId
                }
            })
        }
    })

    return new StreamingTextResponse(stream)
}
