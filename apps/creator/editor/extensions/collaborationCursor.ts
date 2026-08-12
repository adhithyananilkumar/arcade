import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";

export interface CollaborationCursorOptions {
  provider: any;
  user: {
    name?: string | null;
    color?: string | null;
  };
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
    };
  },

  addProseMirrorPlugins() {
    const provider = this.options.provider;
    if (!provider || !provider.awareness) {
      return [];
    }

    provider.awareness.setLocalStateField("user", this.options.user);

    return [
      yCursorPlugin(provider.awareness),
    ];
  },
});
