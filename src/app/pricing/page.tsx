import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {PLANS} from "@/config/stripe";
import {cn} from "@/lib/utils";
import {ArrowRight, Check, HelpCircle, Minus} from "lucide-react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import UpgradeButton from "@/components/UpgradeButton";

const Page = async () => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    const pricingItems = [
        {
            plan: '免費',
            slug: 'free',
            tagline: '適用於小型副業項目。',
            quota: 5,
            features: [
                {
                    text: '每月包括5個PDF文件',
                    footnote: '每個PDF文件最多25頁',
                },
                {
                    text: '8MB文件大小限制',
                    footnote: '適用於移動設備的界面',
                },
                {
                    text: '適用於移動設備的界面',
                },
                {
                    text: '更高質量的回應',
                    footnote: '采用更好的算法回應，提高內容質量',
                    negative: true,
                },
                {
                    text: '優先支持',
                    negative: true,
                },
            ],
        },
        {
            plan: '專業版',
            slug: 'pro',
            tagline: '適用於更大型項目，擁有更高需求。',
            quota: PLANS.find((p) => p.slug === 'pro')!.quota,
            features: [
                {
                    text: '每個PDF文件最多250頁',
                    footnote: '每個PDF文件的最大頁數。',
                },
                {
                    text: '32MB文件大小限制',
                    footnote: '單個PDF文件的最大文件大小。',
                },
                {
                    text: '適用於移動設備的界面',
                },
                {
                    text: '更高質量的回應',
                    footnote: '采用更好的算法回應，提高內容質量',
                },
                {
                    text: '優先支持',
                },
            ],
        }
    ]
    return (
        <>
            <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
                <div className="mx-auto mb-10 sm:max-w-lg">
                    <h1 className="text-6xl font-bold sm:text-7xl">
                        價格
                    </h1>
                    <p className="mt-5 text-gray-600 sm:text-lg">
                        無論您只是想試用我們的服務，還是需要更多，我們都為您提供了選擇。
                    </p>
                </div>

                <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <TooltipProvider>
                        {pricingItems.map(({ plan, slug, tagline, quota, features,}) => {
                            const price = PLANS.find(p => p.slug === slug.toLowerCase())?.price.amount || 0
                            return (
                                <div key={slug}
                                    className={cn(
                                        "relative rounded-2xl bg-white shadow-lg", {
                                            "border-2 border-green-600 shadow-green-200": slug === 'pro',
                                            "border border-gray-200": slug !== 'pro'
                                        }
                                    )}
                                >
                                    {
                                        slug === 'pro' && (
                                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-green-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                                                現在升級
                                            </div>
                                        )
                                    }
                                    <div className="p-5">
                                        <h3 className="my-3 text-center font-display text-3xl font-bold">
                                            {plan}
                                        </h3>
                                        <p className="text-gray-500">{tagline}</p>
                                        <p className="my-5 font-display text-6xl font-semibold">$ {price}</p>
                                        <p className="text-gray-500">每月</p>
                                    </div>

                                    <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center space-x-1">
                                            <p>{quota.toLocaleString()} 包含 PDF/月</p>
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger className="cursor-default ml-1.5">
                                                    <HelpCircle className="h-4 w-4 text-zinc-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    您每月可以上傳多少個 PDF
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <ul className="my-10 space-y-5 px-8">
                                        {features.map(({text, footnote, negative}) => (
                                            <li key={text} className="flex space-x-5">
                                                <div className="flex-shrink-0">
                                                    {negative ? (
                                                        <Minus className="h-6 w-6 text-gray-300" />
                                                    ) : (
                                                        <Check className="h-6 w-6 text-green-500" />
                                                    )}
                                                </div>
                                                {footnote ? (
                                                    <div className="flex items-center space-x-1">
                                                        <p className={cn("text-gray-400", {
                                                            "text-gray-600": !negative
                                                        })}>
                                                            {text}
                                                        </p>
                                                        <Tooltip delayDuration={300}>
                                                            <TooltipTrigger className="cursor-default ml-1.5">
                                                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {footnote}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                ) : (
                                                    <p className={cn("text-gray-400", {
                                                        "text-gray-600": !negative
                                                    })}>
                                                        {text}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t border-gray-200" />
                                    <div className="p-5">
                                        {slug === "free" ? (
                                            <Link href={ user ? "/dashboard" : "/sign-in"} className={buttonVariants({
                                                className: "w-full",
                                                variant: "secondary"
                                            })}>
                                                {user ? "現在升級" : "註冊"}
                                                <ArrowRight className="h-5 w-5 ml-1.5" />
                                            </Link>
                                        ) : user ? (
                                            <UpgradeButton />
                                        ) : (
                                            <Link href={"/sign-in"} className={buttonVariants({
                                                className: "w-full"
                                            })}>
                                                {user ? "現在升級" : "註冊"}
                                                <ArrowRight className="h-5 w-5 ml-1.5" />
                                            </Link>
                                        ) }
                                    </div>
                                </div>
                            )
                        })}
                    </TooltipProvider>
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
