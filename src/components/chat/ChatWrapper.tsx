"use client"
import Messages from "@/components/chat/Messages";
import ChatInput from "@/components/chat/ChatInput";
import {trpc} from "@/app/_trpc/client";
import {ChevronLeft, Loader2, XCircle} from "lucide-react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {ChatContextProvider} from "@/components/chat/ChatContext";

interface Props {
    fileId: string
}

const ChatWrapper: React.FC<Props> = ({ fileId }) => {
    const {data, isLoading} = trpc.getFileUploadStatus.useQuery({
        fileId
    }, {
        refetchInterval: (data) =>
            data?.status === "SUCCESS" ||
            data?.status === "FAILED"
                ? false : 500
    })

    if(isLoading) {
        return (
            <div className="relative sm:mt-8 min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                    <h3 className="font-semibold text-xl">載入中...</h3>
                    <p className="text-zinc-500 text-sm">
                        我們正在準備您的 PDF。
                    </p>
                </div>
            </div>
        )
    }

    if(data?.status === "PROCESSING") {
        return (
            <div className="relative sm:mt-8 min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                    <h3 className="font-semibold text-xl">處理 PDF...</h3>
                    <p className="text-zinc-500 text-sm">
                        這不會花很長時間。
                    </p>
                </div>
            </div>
        )
    }

    if(data?.status === "FAILED") {
        return (
            <div className="relative sm:mt-8 min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <h3 className="font-semibold text-xl">PDF 中的頁面太多。</h3>
                    <p className="text-zinc-500 text-sm">
                        你的 <span className="font-medium">免費</span> 方案支援每個 PDF 最多 25 頁。
                    </p>
                    <Link href={'/dashboard'} className={buttonVariants({ variant: 'secondary'})}>
                        <ChevronLeft className="h-3 w-3 mr-1.5"></ChevronLeft> Back
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <ChatContextProvider fileId={fileId} >
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-between flex flex-col mb-28">
                    <Messages fileId={fileId} />
                </div>

                <ChatInput  />
            </div>
        </ChatContextProvider>
    )
}

export default ChatWrapper
