/**
 * variableHighlight.ts
 *
 * TipTap Extension: highlights {{...}} tokens in the editor with accent colors.
 * Uses a ProseMirror Plugin + DecorationSet.
 *
 * Inline style approach — no dynamic Tailwind classes, no global CSS required.
 */

import type { Node as PmNode } from "@tiptap/pm/model";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const VAR_TOKEN_RE = /\{\{[^}]+\}\}/g;

const variableHighlightKey = new PluginKey("variableHighlight");

function buildDecorations(doc: PmNode): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    let match: RegExpExecArray | null;
    VAR_TOKEN_RE.lastIndex = 0;
    while ((match = VAR_TOKEN_RE.exec(node.text)) !== null) {
      const from = pos + match.index;
      const to = from + match[0].length;
      decorations.push(
        Decoration.inline(from, to, {
          style: [
            "color: var(--primary, hsl(220 90% 56%))",
            "background-color: color-mix(in srgb, var(--primary, hsl(220 90% 56%)) 18%, transparent)",
            "border-radius: 3px",
          ].join("; "),
        }),
      );
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const VariableHighlightExtension = Extension.create({
  name: "variableHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: variableHighlightKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(doc);
          },
          apply(tr, old) {
            if (!tr.docChanged) return old;
            return buildDecorations(tr.doc);
          },
        },
        props: {
          decorations(state) {
            return variableHighlightKey.getState(state) as DecorationSet;
          },
        },
      }),
    ];
  },
});
