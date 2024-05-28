import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import {getKindeServerSession, LoginLink, RegisterLink} from "@kinde-oss/kinde-auth-nextjs/server";
import UserAccountNav from "@/components/UserAccountNav";
import MobileNav from "@/components/MobileNav";

const Navbar: React.FC = async () => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link href="/" className="flex z-40 font-semibold">
                        <span className="text-green-800 font-bold">asq.</span>
                    </Link>
                    <MobileNav isAuth={!!user} />
                    <div className="hidden items-center space-x-4 sm:flex">
                        {!user ?
                            (
                                <>
                                    <Link href={"/pricing"}
                                          className={buttonVariants({
                                              variant: "ghost",
                                              size: "sm"
                                          })}>
                                        價錢
                                    </Link>
                                    <LoginLink
                                        className={buttonVariants({
                                            variant: "ghost",
                                            size: "sm"
                                        })}>
                                        登入
                                    </LoginLink>
                                    <RegisterLink
                                        className={buttonVariants({
                                            size: "sm"
                                        })}>
                                        開始使用 <ArrowRight className="ml-1.5 h-5 w-5" />
                                    </RegisterLink>
                                </>
                            ) :
                            (
                                <>
                                    <Link
                                        href={"/dashboard"}
                                        className={buttonVariants({
                                            variant: "ghost",
                                            size: "sm"
                                        })}
                                    >
                                        儀表板
                                    </Link>

                                    <UserAccountNav
                                        name={
                                            !user.given_name || !user.family_name
                                                ? "你的帳戶"
                                                : `${user.given_name} ${user.family_name}`
                                        }
                                        email={user.email ?? ""}
                                        imageUrl={user.picture ?? ""}
                                    />
                                </>
                            )
                        }
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar
