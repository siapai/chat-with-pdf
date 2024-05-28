import {getUserSubscriptionPlan} from "@/lib/stripe";
import BillingForm from "@/components/BillingForm";
import ClientOnly from "@/components/ClientOnly";

const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return (
        <BillingForm subscriptionPlan={subscriptionPlan} />

    )
}

export default Page
