import { Node } from "@tiptap/core";

export const Audio = Node.create({
    name: "audio",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            src: { default: null, parseHTML: (el) => (el as HTMLAudioElement).getAttribute("src"), renderHTML: (attrs) => (attrs.src ? { src: attrs.src } : {}) },
        };
    },
    parseHTML() {
        return [{ tag: "audio[src]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["audio", { ...HTMLAttributes, controls: "" }];
    },
});

export const Video = Node.create({
    name: "video",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            src: { default: null, parseHTML: (el) => (el as HTMLVideoElement).getAttribute("src"), renderHTML: (attrs) => (attrs.src ? { src: attrs.src } : {}) },
        };
    },
    parseHTML() {
        return [{ tag: "video[src]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["video", { ...HTMLAttributes, controls: "" }];
    },
});
