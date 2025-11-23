export default class VariableTool {
  api: any;
  button: HTMLButtonElement | null = null;
  tag: string = "SPAN";
  class: string = "tg-variable-chip";

  static get isInline() {
    return true;
  }

  static get title() {
    return "Variable ($msg)";
  }

  constructor({ api }: any) {
    this.api = api;
  }

  static get sanitize() {
    return {
      span: {
        class: "tg-variable-chip",
        "data-var-id": true,
        "data-label": true,
        contenteditable: true, // Muhim: Sanitizer atributni o'chirib tashlamasligi uchun
      },
    };
  }

  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = "<b>$</b>";
    this.button.classList.add(this.api.styles.inlineToolButton);
    return this.button;
  }

  surround(range: Range) {
    if (!range) return;
    this.wrap(range);
  }

  wrap(range: Range) {
    const selectedText = range.extractContents(); // Matnni qirqib olamiz
    const span = this.createChip("$msg = 'Select message'");

    range.insertNode(span);
    this.api.selection.expandToTag(span);
  }

  // Chip yaratish uchun yordamchi funksiya (tashqaridan ham chaqirish uchun public qildik)
  createChip(text: string = "$msg = 'Select message'"): HTMLElement {
    const span = document.createElement(this.tag);
    span.classList.add(this.class);
    span.setAttribute("data-label", "Select message");
    span.contentEditable = "false"; // User ichiga yozolmasligi uchun
    span.innerText = text;
    return span;
  }

  checkState() {
    const termWrapper = this.api.selection.findParentTag(this.tag, this.class);
    this.button?.classList.toggle(
      this.api.styles.inlineToolButtonActive,
      !!termWrapper
    );
    return !!termWrapper;
  }
}
