
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

// --- VIDEO EXTENSION ---

export const Video = Node.create({
    name: "video",
    group: "block",
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "video",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["video", mergeAttributes(HTMLAttributes, { controls: true, class: "w-full h-auto rounded-lg shadow-md my-4" })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node }) => {
            return (
                <NodeViewWrapper className="my-8 flex justify-center">
                    <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl bg-black border border-gray-800 group">
                        {/* Modern Video Player Wrapper */}
                        <video
                            src={node.attrs.src}
                            controls
                            className="w-full h-auto max-h-[600px] outline-none"
                            preload="metadata"
                        />

                        {/* Badge Overlay (Optional aesthetic touch) */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Video Oynatıcı
                        </div>
                    </div>
                </NodeViewWrapper>
            );
        });
    },
});

// --- AUDIO EXTENSION ---

export const Audio = Node.create({
    name: "audio",
    group: "block",
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "audio",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["audio", mergeAttributes(HTMLAttributes, { controls: true, class: "w-full my-4" })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node }) => {
            return (
                <NodeViewWrapper className="my-6">
                    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-4 flex items-center gap-4 hover:shadow-xl transition-shadow">
                        <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1 truncate">Ses Dosyası</div>
                            <audio
                                src={node.attrs.src}
                                controls
                                className="w-full h-8 outline-none"
                            />
                        </div>
                    </div>
                </NodeViewWrapper>
            );
        });
    },
});
