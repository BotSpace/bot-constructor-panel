// ControlPanel is no longer used directly — ButtonGenerator renders forms inline.
// Kept as a thin pass-through for backwards compatibility if imported elsewhere.
import { InlineForm } from "./InlineForm";
import { ReplyForm } from "./ReplyForm";
import { ButtonConfig } from "../types";

interface ControlPanelProps {
  activeTab: "inline" | "reply";
  onTabChange: (tab: "inline" | "reply") => void;
  onAddButton: (button: ButtonConfig) => void;
  isCurrentRowFull: boolean;
  nodeId: string;
}

export const ControlPanel = ({
  activeTab,
  onAddButton,
  isCurrentRowFull,
  nodeId,
}: ControlPanelProps) => {
  if (activeTab === "inline") {
    return <InlineForm onAdd={onAddButton} disabled={isCurrentRowFull} nodeId={nodeId} />;
  }
  return <ReplyForm onAdd={onAddButton} disabled={isCurrentRowFull} nodeId={nodeId} />;
};
