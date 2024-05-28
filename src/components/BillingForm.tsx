"use client"

import {getUserSubscriptionPlan} from "@/lib/stripe";
import {useToast} from "@/components/ui/use-toast";
import {trpc} from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {format} from "date-fns";

interface Props {
    subscriptionPlan: Awaited<
        ReturnType<typeof getUserSubscriptionPlan>
    >
}

const BillingForm: React.FC<Props> = ({ subscriptionPlan}) => {
    const {toast} = useToast()

    const {mutate: createStripeSubscription, isLoading} = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            if(url) window.location.href = url

            if(!url) {
                toast({
                    title: "Something went wrong",
                    description: "Please try again in moment",
                    variant: "destructive"
                })
            }
        }
    })

    return (
        <MaxWidthWrapper className="max-w-5xl">
            <form action="" className="mt-12" onSubmit={e => {
                e.preventDefault()
                createStripeSubscription()
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        {subscriptionPlan.name ?
                            (
                                <CardDescription>
                                    您目前屬於 <strong>專業</strong>計劃。
                                </CardDescription>
                            ) : (
                                <CardDescription>
                                    您目前使用的是免費方案。
                                </CardDescription>
                            )
                        }
                    </CardHeader>
                    <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                        <Button type="submit">
                            {isLoading ? (
                                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
                            ) : null}
                            {subscriptionPlan.isSubscribed
                                ? '管理訂閱'
                                : '升級到專業版'}
                        </Button>

                        {subscriptionPlan.isSubscribed ? (
                            <p className="rounded-full text-xs font-medium">
                                {subscriptionPlan.isCanceled
                                ? "Your plan will be cancelled on "
                                : "Your plane renews on "}
                                {format(
                                    subscriptionPlan.stripeCurrentPeriodEnd!,
                                    "dd.MM.yyyy"
                                )}
                            </p>
                        ) : null}
                    </CardFooter>
                </Card>
            </form>
        </MaxWidthWrapper>
    )
}

export default BillingForm
