import { ValueInput } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/ParameterInput/ValueInput";
import { RadiusInput } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/ParameterInput/RadiusInput";
import { SizeInput } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/ParameterInput/SizeInput"; // <-- YANGI IMPORT

interface TriggerContext {
  value?: string;
  radius?: { lat?: string; lng?: string; km?: string };
  size?: { min?: string; max?: string };
}

interface ParameterInputProps {
    filter?: string;
    context: TriggerContext | undefined;
    onContextUpdate: (newContext: TriggerContext) => void;
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
