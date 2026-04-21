import { MessageTriggerNodeData } from "@/features/bot-constructor/nodes/types";
import { RadiusInput } from "./RadiusInput";
import { SizeInput } from "./SizeInput";
import { ValueInput } from "./ValueInput";

interface ParameterInputProps {
    filter?: string;
    context: MessageTriggerNodeData["context"];
    onContextUpdate: (newContext: MessageTriggerNodeData["context"]) => void;
}

export const ParameterInput = ({
    filter,
    context,
    onContextUpdate,
}: ParameterInputProps) => {
    switch (filter) {
        case "equals":
        case "contains":
        case "not-contains":
        case "starts_with":
        case "regex":
        case "command":
        case "extension":
            return (
                <ValueInput
                    value={context?.value || ""}
                    onChange={(value) => onContextUpdate({ value })}
                />
            );

        case "radius":
            return (
                <RadiusInput
                    value={context?.radius || {}}
                    onChange={(field, value) =>
                        onContextUpdate({
                            ...context,
                            radius: { ...context?.radius, [field]: value },
                        })
                    }
                />
            );

        // ----- TUZATILGAN QISM -----
        case "size":
            return (
                <SizeInput
                    value={context?.size || {}}
                    onChange={(field, value) =>
                        onContextUpdate({
                            ...context,
                            size: { ...context?.size, [field]: value },
                        })
                    }
                />
            );

        default:
            return null;
    }
};
