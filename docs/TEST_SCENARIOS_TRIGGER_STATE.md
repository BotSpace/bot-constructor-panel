# Test Scenarios for Trigger State Keys Feature

## Test Scenario 1: MessageTrigger State Keys

### Setup
1. Create a new flow
2. Add a MessageTrigger node
3. Configure it to receive text messages
4. Enable "Ma'lumotni saqlash" (Save data)
5. Set state key to "user_message"
6. Set state type to "text"

### Test Cases

#### Test 1.1: CollectionNode Field Mapping
1. Add a CollectionNode
2. Select a collection with at least one field
3. Open the field mapping dropdown
4. **Expected**: The state key "user_message" should appear in the dropdown alongside any StateNode keys

#### Test 1.2: LoadCollectionItemNode Filter
1. Add a LoadCollectionItemNode
2. Select a collection
3. Add a filter
4. Open the value dropdown/input
5. **Expected**: The state key "user_message" should be available as a filter value option

#### Test 1.3: Button Generator - Collection Buttons
1. Add a SendTextMessageNode
2. Open button generator
3. Create collection buttons
4. Add filters to the collection
5. **Expected**: The state key "user_message" should appear in filter value options

## Test Scenario 2: CallbackQueryTrigger State Keys

### Setup
1. Create a new flow
2. Add a CallbackQueryTrigger node
3. Configure it to catch callback queries
4. Enable "Ma'lumotni saqlash"
5. Set state key to "selected_option"
6. Set state type to "data"

### Test Cases

#### Test 2.1: Multiple State Sources
1. Keep the MessageTrigger from Scenario 1
2. Add a StateNode with key "user_id"
3. Add a CollectionNode
4. Open field mapping dropdown
5. **Expected**: All three state keys should appear:
   - user_message (from MessageTrigger)
   - selected_option (from CallbackQueryTrigger)
   - user_id (from StateNode)

## Test Scenario 3: CommandTrigger State Keys

### Setup
1. Add a CommandTrigger node
2. Set command to "start"
3. Enable "Ma'lumotni saqlash"
4. Set state key to "start_command"
5. Set state type to "text"

### Test Cases

#### Test 3.1: Button Generator - Inline Buttons
1. Add a SendTextMessageNode
2. Open button generator
3. Switch to Inline buttons tab
4. **Expected**: The state key "start_command" should be available

## Test Scenario 4: ReplyButtonTrigger State Keys

### Setup
1. Add a ReplyButtonTrigger node
2. Select or create reply buttons
3. Enable "Ma'lumotni saqlash"
4. Set state key to "button_text"
5. Set state type to "text"

### Test Cases

#### Test 4.1: Button Generator - Reply Buttons
1. Add a SendTextMessageNode
2. Open button generator
3. Switch to Reply buttons tab
4. **Expected**: The state key "button_text" should be available

## Test Scenario 5: Dynamic Updates

### Setup
All triggers and StateNode from previous scenarios

### Test Cases

#### Test 5.1: Add New Trigger with State
1. Open an existing CollectionNode
2. Note the current state keys in dropdown
3. Add a new MessageTrigger with state key "new_input"
4. Return to CollectionNode
5. Open field mapping dropdown
6. **Expected**: "new_input" should now appear in the list

#### Test 5.2: Remove Trigger State
1. Open an existing CollectionNode
2. Note that "user_message" is in the dropdown
3. Delete or disable state on MessageTrigger
4. Return to CollectionNode
5. Open field mapping dropdown
6. **Expected**: "user_message" should no longer appear

#### Test 5.3: Update State Key
1. Open MessageTrigger
2. Change state key from "user_message" to "message_text"
3. Open CollectionNode field mapping
4. **Expected**: "user_message" should be gone, "message_text" should appear

## Test Scenario 6: Edge Cases

### Test 6.1: Empty State Key
1. Create a MessageTrigger with state enabled
2. Leave state key empty or whitespace only
3. Open CollectionNode
4. **Expected**: Empty key should not appear in dropdown

### Test 6.2: Duplicate Keys
1. Create StateNode with key "duplicate"
2. Create MessageTrigger with state key "duplicate"
3. Open CollectionNode
4. **Expected**: Only one "duplicate" entry should appear (deduplicated)

### Test 6.3: Special Characters in Key
1. Create MessageTrigger with state key "user-message_123"
2. Open CollectionNode
3. **Expected**: Key should appear and work correctly

## Test Scenario 7: Integration Points

### Test 7.1: Text Message Dynamic Content
1. Add a SendTextMessageNode
2. Enable dynamic collections
3. Select a collection
4. Add filters
5. **Expected**: Trigger state keys should be available in filter values

### Test 7.2: Multiple Collections
1. Add multiple CollectionNodes
2. Each should show the same state keys from triggers
3. **Expected**: Consistent state key list across all CollectionNodes

## Regression Tests

### Test 8.1: Existing StateNodes Still Work
1. Create a traditional StateNode (no triggers)
2. Set key to "old_state"
3. **Expected**: Key appears in all expected places as before

### Test 8.2: Flows Without Triggers
1. Create a flow with only StateNodes
2. **Expected**: Everything works as before, no errors

### Test 8.3: Flows Without State at All
1. Create a flow with triggers but no state enabled
2. **Expected**: No state keys appear, no errors

## Performance Tests

### Test 9.1: Many Nodes
1. Create a flow with 50+ nodes
2. Include 10 StateNodes and 10 triggers with state
3. Open CollectionNode field mapping
4. **Expected**: Dropdown should load quickly (< 1 second)

### Test 9.2: Frequent Updates
1. Rapidly add/remove triggers with state
2. Keep a CollectionNode open
3. **Expected**: UI should remain responsive

## Expected Results Summary

All state keys from the following sources should appear in dropdowns:
- ✅ StateNode (existing functionality)
- ✅ MessageTriggerNode with state enabled
- ✅ CallbackQueryTriggerNode with state enabled
- ✅ CommandTriggerNode with state enabled
- ✅ ReplyButtonTriggerNode with state enabled

State keys should appear in:
- ✅ CollectionNode field mappings
- ✅ LoadCollectionItemNode filters
- ✅ CollectionButtonForm filters
- ✅ InlineForm state key lists
- ✅ ReplyForm state key lists
- ✅ TextMessageNode dynamic content filters

## Validation Checklist

- [ ] TypeScript compilation passes
- [ ] No runtime errors in console
- [ ] State keys appear sorted alphabetically
- [ ] Duplicate keys are handled correctly
- [ ] Empty/whitespace keys are filtered out
- [ ] Updates are reactive (adding/removing nodes updates lists)
- [ ] All documentation is accurate
- [ ] Backward compatibility maintained
