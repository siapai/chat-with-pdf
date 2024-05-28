"use client"

import {ArrowRight, Menu} from "lucide-react";
import {useEffect, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";


interface Props {
    isAuth: boolean
}
const MobileNav: React.FC<Props> = ({ isAuth }) => {

    const [isOpen, setOpen] = useState<boolean>(false)
    const toggleOpen = () => setOpen(prevState => !prevState)
    const pathName = usePathname()

    useEffect(() => {
        if(isOpen) toggleOpen()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathName]);

    const closeOnCurrent = (href: string) => {
        if(pathName === href) {
            toggleOpen()
        }
    }

    return <div className="sm:hidden">
        <Menu
            onClick={toggleOpen}
            className="relative z-50 h-5 w-5 text-zinc-700 cursor-pointer" />

        {isOpen ? (
            <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
                <ul
                    className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8"
                >
                    {!isAuth ? (
                        <>
                            <li>
                                <Link
                                    onClick={() => closeOnCurrent("/sign-up")}
                                    className="flex items-center w-full font-semibold text-gray-600"
                                    href={"/sign-up"}
                                >
                                    開始使用 <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>
                            </li>
                            <li className="my-3 h-px w-full bg-gray-300" />
                            <li>
                                <Link
                                    onClick={() => closeOnCurrent("/sign-in")}
                                    className="flex items-center w-full font-semibold"
                                    href={"/sign-in"}
                                >
                                    登入
                                </Link>
                            </li>
                            <li className="my-3 h-px w-full bg-gray-300" />
                            <li>
                                <Link
                                    onClick={() => closeOnCurrent("/pricing")}
                                    className="flex items-center w-full font-semibold"
                                    href={"/pricing"}
                                >
                                    價錢
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link
                                    onClick={() => closeOnCurrent("/dashboard")}
                                    className="flex items-center w-full font-semibold"
                                    href={"/sign-in"}
                                >
                                    儀表板
                                </Link>
                            </li>
                            <li className="my-3 h-px w-full bg-gray-300" />
                            <li>
                                <Link
                                    className="flex items-center w-full font-semibold"
                                    href={"/sign-out"}
                                >
                                    登出
                                </Link>
                            </li>
                        </>
                    )}

                </ul>
            </div>
        ) : null}
    </div>
}

export default MobileNav
