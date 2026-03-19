export interface ForLoopNodeData {
  items?: string;        // Variable holding the list, e.g. "{{users}}"
  item_variable?: string; // Name for current item in each iteration, e.g. "item"
}
