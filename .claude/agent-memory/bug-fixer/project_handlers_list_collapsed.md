---
name: HandlersList must always be outside collapsed block
description: React Flow Handle components inside HandlersList break edges when nodes collapse — HandlersList must always be unconditionally rendered
type: project
---

HandlersList must always sit OUTSIDE the `{!isCollapsed && (...)}` block in every action node, positioned between the collapsed block's closing `)}` and `<SourceHandles nodeId={id} />`.

**Why:** HandlersList renders React Flow `Handle` components. React Flow tracks handles in the DOM to route edges. When a node collapses and the `{!isCollapsed}` block unmounts, those handles disappear from the DOM and all connected edges break/disconnect visually.

**How to apply:** Any time a new action node (or trigger node) is created with a `HandlersList` component and a collapse toggle, ensure `HandlersList` is placed unconditionally — outside the collapsed conditional. The correct structure is:

```tsx
{!isCollapsed && (
  <>
    <CardContent>...</CardContent>
    <CardFooter>...</CardFooter>
    {/* NO HandlersList here */}
  </>
)}

{/* Handler list - always rendered */}
<HandlersList keyboard={data.keyboard} sourceNodeId={id} />

<SourceHandles nodeId={id} />
```

Fixed in 2026-03-30 across 13 action nodes: VideoNoteNode, VoiceNode, CopyMessageNode, PinMessageNode, MediaGroupNode, LocationNode, PhotoMessageNode, FileMessageNode, TextMessageNode, EditOrSendMessageNode, AudioMessageNode, ContactNode, EditMessageNode.
