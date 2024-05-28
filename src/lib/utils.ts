import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {Metadata} from "next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if(typeof window !== 'undefined') {
    return path
  }


  if(process.env.DEFAULT_URL) return `${process.env.DEFAULT_URL}${path}`

  return `http://localhost:${
      process.env.PORT ?? 3000
  }${path}`
}

export function constructMetadata({
    title = "與您的業務文件對話",
    description = "ASQ 是一個讓與您的PDF文件對話變得輕鬆的平台。",
    image = "/thumbnail.png",
    icons = "/favicon.ico",
    noIndex = false
} : {
    title?: string
    description?: string
    image?: string
    icons?: string
    noIndex?: boolean
} = {}): Metadata  {
    return  {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "starlai"
        },
        icons,
        metadataBase: new URL('https://asq.twsbp.com')
    }
}
