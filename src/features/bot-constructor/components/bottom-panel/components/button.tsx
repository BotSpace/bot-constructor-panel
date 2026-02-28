import * as React from "react"
import { Slot } from "@radix-ui/react-slot" // Slot import qilindi
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex gap-1 items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 border-transparent",
                outline: "border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border-transparent",
                ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
                destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 border-transparent",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",       // 40px
                "icon-sm": "h-8 w-8",    // 32px
                "icon-lg": "h-12 w-12",  // 48px
            },
        },
        defaultVariants: {
            variant: "outline",
            size: "icon",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const BottomPanelButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // Agar asChild true bo'lsa Slot-ni, aks holda standart button-ni tanlaymiz
        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)

BottomPanelButton.displayName = "BottomPanelButton"

export { BottomPanelButton, buttonVariants }