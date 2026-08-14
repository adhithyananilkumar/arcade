import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";

export interface CollaborationCursorOptions {
  provider: any;
  user: {
    name?: string | null;
    color?: string | null;
  };
  render?: (user: { name?: string | null; color?: string | null }) => HTMLElement;
}

export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: "collaborationCursor",

  priority: 999,

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
      },
      render: undefined,
    };
  },

  addProseMirrorPlugins() {
    const provider = this.options.provider;
    if (!provider || !provider.awareness) {
      return [];
    }

    provider.awareness.setLocalStateField("user", this.options.user);

    const defaultCursorBuilder = (user: { name?: string; color?: string }) => {
      const cursor = document.createElement("span");
      cursor.classList.add("arcade-collab-cursor");

      const cursorColor = user.color || "#7c3aed";

      // 1. Thin vertical caret matching normal text cursor size
      const caret = document.createElement("span");
      caret.classList.add("arcade-collab-caret");
      caret.style.backgroundColor = cursorColor;
      cursor.appendChild(caret);

      // 2. Compact remote collaborator presence name label
      const name = (user.name || "Collaborator").trim();
      const label = document.createElement("span");
      label.classList.add("arcade-collab-label");
      label.style.backgroundColor = cursorColor;
      label.textContent = name;
      cursor.appendChild(label);

      return cursor;
    };

    return [
      yCursorPlugin(provider.awareness, {
        cursorBuilder: this.options.render || defaultCursorBuilder,
      }),
    ];
  },
});
