"use client"
import {Document, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {ChevronDown, ChevronUp, Loader2, RotateCw, Search} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";
import {useResizeDetector} from "react-resize-detector";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from 'zod'
import {zodResolver} from "@hookform/resolvers/zod";
import {cn} from "@/lib/utils";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullScreen from "@/components/PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

const PdfRenderer: React.FC<{ url: string}> = ({ url}) => {

    const { toast } = useToast()
    const {width, ref} = useResizeDetector()

    const [numPages, setNumPages] = useState<number>(1)
    const [currPage, setCurrPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0)
    const [renderedScale, setRenderedScale] = useState<number | null>(null)
    const isLoading = renderedScale !== scale

    const CustomPageValidator = z.object({
        page: z.string().refine(num => Number(num) > 0 && Number(num) <= numPages)
    })

    type TCustomPageValidator = z.infer<typeof CustomPageValidator>
    const {
        register,
        handleSubmit,
        formState: {
            errors
        },
        setValue
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(CustomPageValidator)
    })

    useEffect(() => {
        setValue("page", String(currPage))
    }, [currPage, setValue]);

    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrPage(Number(page))
        setValue("page", String(page))
    }

    return (
       <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
           <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
               <div className="flex items-center gap-1.5">
                   <Button
                       disabled={currPage <= 1}
                       onClick={() => setCurrPage(prev => (prev - 1 > 1 ? prev -1 : 1)) }
                       aria-label="previous page" variant="ghost">
                       <ChevronDown className="h-4 w-4" />
                   </Button>
                   <div className="flex items-center gap-1.5">
                       <Input
                           {...register("page")}
                           onKeyDown={e => {
                               if(e.key === "Enter") {
                                   handleSubmit(handlePageSubmit)()
                               }
                           }}
                           className={cn(
                               "w-12 h-8",
                               errors.page && "focus-visible:ring-red-500"
                           )}
                       />
                       <p className="text-zinc-700 text-sm space-x-1">
                           <span>/</span>
                           <span>{numPages}</span>
                       </p>
                   </div>
                   <Button
                       disabled={currPage >= numPages}
                       onClick={() => setCurrPage(prev => (prev + 1 > numPages ? numPages : prev + 1)) }
                       aria-label="previous page" variant="ghost">
                       <ChevronUp className="h-4 w-4" />
                   </Button>
               </div>

               <div className="space-x-2 invisible sm:visible">
                   <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                           <Button aria-label="zoom" variant="ghost" className="gap-1.5">
                               <Search className="h-4 w-4" />
                               {scale * 100}%<ChevronDown  className="h-3 w-3 opacity-50"/>
                           </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent>
                           <DropdownMenuItem onSelect={() => setScale(1)}>
                               100%
                           </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => setScale(1.5)}>
                               150%
                           </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => setScale(2)}>
                               200%
                           </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => setScale(2.5)}>
                               250%
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                   </DropdownMenu>
                   <Button
                       onClick={() => setRotation(prev => prev + 90)}
                       aria-label="rotate 90 degrees"
                       variant="ghost">
                       <RotateCw className="h-4 w-4" />
                   </Button>
                   <PdfFullScreen fileUrl={url} />
               </div>
           </div>

           <div className="flex-1 w-full max-h-screen">
               <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
                   <div ref={ref}>
                       <Document
                           loading={
                               <div className="flex justify-center">
                                   <Loader2 className="my-24 h-6 w-6 animate-spin" />
                               </div>
                           }
                           onLoadError={() => {
                               toast({
                                   title: "載入 pdf 時出錯",
                                   description: "請再試一次",
                                   variant: "destructive"
                               })
                           }}
                           onLoadSuccess={ ({ numPages}) => setNumPages(numPages)}
                           file={url}
                           className="max-h-full">
                           {isLoading && renderedScale ? <Page
                               key={"@"+renderedScale}
                               width={width ? width : 1}
                               scale={scale}
                               rotate={rotation}
                               renderTextLayer={false}
                               renderAnnotationLayer={true}
                               pageNumber={currPage}/> : null}
                           <Page
                               className={cn(isLoading ? "hidden" : "")}
                               key={"@"+scale}
                               loading={
                                    <div className="flex justify-center">
                                        <Loader2 className="my-24 h-6 w-6 animate-spin" />
                                    </div>
                               }
                               onRenderSuccess={() => setRenderedScale(scale)}
                               width={width ? width : 1}
                               scale={scale}
                               rotate={rotation}
                               renderTextLayer={false}
                               renderAnnotationLayer={true}
                               pageNumber={currPage}/>
                       </Document>
                   </div>
               </SimpleBar>

           </div>
       </div>
    )
}

export default PdfRenderer
