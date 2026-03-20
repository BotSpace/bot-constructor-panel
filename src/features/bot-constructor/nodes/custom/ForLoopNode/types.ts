export interface ForLoopNodeData {
  dataKey?: string;      // Variable holding the list, e.g. "{{users}}"
  itemVariable?: string; // Name for current item in each iteration, e.g. "item"
}
