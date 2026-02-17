# Trigger State Keys in Collections and Filters

## Overview

When triggers have "Ma'lumotni saqlash" (data saving) enabled, the saved state keys are now automatically available in all places where StateNode keys are used:

- Collection field mappings (CollectionNode)
- Collection item filters (LoadCollectionItemNode)
- Button generator state key selectors
- Text message dynamic content filters

## How It Works

Previously, only StateNode keys were visible in dropdowns and selectors throughout the application. Now, any trigger node with state configuration enabled will also contribute its state key to these lists.

### Supported Trigger Nodes

The following trigger nodes support state configuration:

1. **MessageTriggerNode** - Message triggers
2. **CallbackQueryTriggerNode** - Callback query triggers
3. **CommandTriggerNode** - Command triggers
4. **ReplyButtonTriggerNode** - Reply button triggers

## Example Usage

### 1. MessageTrigger with State

Create a message trigger that saves user input:

```typescript
{
  type: "MessageTriggerNode",
  data: {
    type: "text",
    filter: "any",
    state: {
      key: "user_message",
      type: "text"
    }
  }
}
```

The key `user_message` will now automatically appear in:
- CollectionNode field mapping dropdowns
- LoadCollectionItemNode filter value selectors
- Button generator state key lists
- Any other component that uses state keys

### 2. CallbackQuery with State

Create a callback query trigger that saves selected data:

```typescript
{
  type: "CallbackQueryTriggerNode",
  data: {
    filter: "any",
    state: {
      key: "selected_item",
      type: "data"
    }
  }
}
```

### 3. Using in CollectionNode

When mapping collection fields, you can now select state keys from both:
- StateNodes (e.g., `user_id`, `session_data`)
- Trigger state keys (e.g., `user_message`, `selected_item`)

```
Collection Field: name
State Key: [dropdown shows both StateNode and Trigger keys]
  - user_id (from StateNode)
  - user_message (from MessageTrigger)
  - selected_item (from CallbackQueryTrigger)
```

### 4. Using in LoadCollectionItemNode Filters

When filtering collection items, trigger state keys are available as filter values:

```
Filter:
  Field: category
  Operator: equals
  Value: [dropdown includes trigger state keys]
    - {{state_user_message}}
    - {{state_selected_item}}
```

## Implementation Details

### Utility Function

A new utility function `getAvailableStateKeys()` was created in `src/features/bot-constructor/utils/get-state-keys.ts`:

```typescript
export function getAvailableStateKeys(nodes: Node[]): string[] {
  const stateKeys = new Set<string>();

  nodes.forEach((node) => {
    // Check StateNode
    if (node.type === "StateNode") {
      const nodeData = node.data as StateNodeData;
      if (nodeData.key && nodeData.key.trim() !== "") {
        stateKeys.add(nodeData.key);
      }
    }
    // Check trigger nodes with state configuration
    else if (
      node.type === "MessageTriggerNode" ||
      node.type === "CallbackQueryTriggerNode" ||
      node.type === "CommandTriggerNode" ||
      node.type === "ReplyButtonTriggerNode"
    ) {
      const nodeData = node.data as TriggerNodeWithState;
      if (nodeData.state?.key && nodeData.state.key.trim() !== "") {
        stateKeys.add(nodeData.state.key);
      }
    }
  });

  return Array.from(stateKeys).sort();
}
```

### Updated Components

The following components were updated to use the new utility:

1. **CollectionNode** - Collection field mappings
2. **LoadCollectionItemNode** - Collection item filters
3. **CollectionButtonForm** - Dynamic button filters
4. **InlineForm** - Inline button state keys
5. **ReplyForm** - Reply button state keys
6. **AccordionItemWrapper** (TextMessageNode) - Dynamic message filters

## Benefits

1. **Consistency**: State keys from triggers are treated the same as StateNode keys
2. **Simplicity**: No need to create separate StateNodes just to make trigger data available
3. **Flexibility**: Users can choose to use either StateNodes or trigger state configuration
4. **Automatic Updates**: State key lists update automatically when triggers are added/removed

## Migration

No migration needed! This is a backward-compatible enhancement:
- Existing StateNodes continue to work as before
- Trigger state keys are additive - they don't replace StateNode keys
- All existing flows will work without modification

## Testing

To test this feature:

1. Create a MessageTrigger with state saving enabled
   - Enable "Ma'lumotni saqlash" checkbox
   - Enter a state key (e.g., "user_input")
   - Select a state type (e.g., "text")

2. Create a CollectionNode
   - Open field mappings
   - Verify the trigger state key appears in the dropdown

3. Create a LoadCollectionItemNode with filters
   - Add a filter
   - Verify the trigger state key appears as a value option

4. Add dynamic buttons with filters
   - Open button generator
   - Add collection buttons with filters
   - Verify trigger state keys appear in filter value selectors
