"use client"
import {useRouter, useSearchParams} from "next/navigation";
import {trpc} from "@/app/_trpc/client";
import {Loader2} from "lucide-react";
import {useEffect} from "react";


const Page: React.FC = () => {


    const router = useRouter()

    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const auth = trpc.authCallback.useQuery(undefined, {
        // onSuccess: ({success}) => {
        //     if(success) {
        //         router.push(origin ? `/${origin}` : '/dashboard')
        //     }
        // },
        // onError: (err) => {
        //     console.log("ERR", err)
        //     if(err.data?.code) {
        //         if(err.data?.code === 'UNAUTHORIZED') {
        //             router.push('/sign-in')
        //         }
        //     }
        // },
        retry: true,
        retryDelay: 1000,
    })

    useEffect(() => {
        console.log("Auth Error", auth.error)

    }, [auth.error]);

    useEffect(() => {

        if(auth.data?.success) {
            router.push(origin ? `/${origin}` : '/dashboard')
        }

        if(!auth.data?.success) {
            router.push('/sign-in')
        }
    }, [auth.data,  origin, router]);


    return (
        <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                <h3 className="font-semibold text-xl">Setting up your account...</h3>
                <p>You will be redirected automatically</p>
            </div>
        </div>
    )
}

export default Page
