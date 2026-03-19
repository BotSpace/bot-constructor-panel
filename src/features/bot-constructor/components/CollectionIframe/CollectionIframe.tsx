import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useState } from "react"

export function CollectionIframeDialog({
    children,
    open,
    onOpenChange,
}: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {

    const [isLoading, setisLoading] = useState(true)
    const { lang, id } = useParams()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[1020px] h-[90vh] p-0 overflow-hidden">
                {
                    isLoading && <Skeleton
                        className="w-full h-full"
                    />
                }

                <iframe
                    onLoad={() => setisLoading(false)}
                    src={`/${lang}/shared-collection?collection=${id}`}
                    className={cn("block w-full h-full", isLoading && "hidden")} />
            </DialogContent>
        </Dialog>
    )
}
