import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

export function CollectionIframeDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[960px] h-[90vh] p-0 overflow-hidden">
                <iframe src="http://localhost:3000/en/shared-collection?id=480" className="block w-full h-full bg-red-300" />
                {/* <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}
