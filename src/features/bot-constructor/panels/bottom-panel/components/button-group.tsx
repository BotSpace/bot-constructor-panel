import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonGroupVariants = cva(
    // Bu selectorlar guruh ichidagi elementlarning burchaklarini to'g'irlaydi
    "flex w-fit items-stretch isolate",
    {
        variants: {
            orientation: {
                horizontal:
                    "flex-row [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:-ml-px [&>*:not(:last-child)]:rounded-r-none",
                vertical:
                    "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:-mt-px [&>*:not(:last-child)]:rounded-b-none",
            },
        },
        defaultVariants: {
            orientation: "horizontal",
        },
    }
)

function ButtonGroup({
    className,
    orientation = "horizontal",
    children,
    ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {

    // MUHIM: Fragment (<>...</>) ichidagi elementlarni bitta massivga yoyib chiqadi.
    // Bu CSS selectorlar (first-child, last-child) ishlashi uchun shart.
    const flattenedChildren = React.Children.toArray(children);

    return (
        <div
            role="group"
            data-orientation={orientation}
            className={cn(buttonGroupVariants({ orientation }), className)}
            {...props}
        >
            {flattenedChildren}
        </div>
    )
}

export default ButtonGroup