"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Audio, Video } from "@/components/admin/tiptap-media";
import { MediaInsertModal } from "@/components/admin/MediaInsertModal";
import { Icons } from "@/components/admin/Icons";
import "./RichTextEditor.css";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?:\/.*)?$/;
function isYouTubeUrl(url: string) {
    return YOUTUBE_REGEX.test(url.trim());
}

type RichTextEditorProps = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
};

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Metninizi buraya yazın veya kopyalayıp yapıştırın...",
}: RichTextEditorProps) {
    const [mediaModalOpen, setMediaModalOpen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            Audio,
            Video,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4",
            },
        },
    });

    const insertMedia = useCallback(
        (type: "video" | "audio" | "image", src: string, alt?: string) => {
            if (!editor) return;

            // Focus and scroll to bottom
            editor.chain().focus().run();
            const endPos = editor.state.doc.content.size;

            if (isYouTubeUrl(src)) {
                editor.chain().insertContentAt(endPos, {
                    type: "youtube",
                    attrs: { src }
                }).run();
            } else if (type === "video") {
                editor.chain().insertContentAt(endPos, {
                    type: "video",
                    attrs: { src }
                }).run();
            } else if (type === "audio") {
                editor.chain().insertContentAt(endPos, {
                    type: "audio",
                    attrs: { src }
                }).run();
            } else if (type === "image") {
                editor.chain().insertContentAt(endPos, {
                    type: "image",
                    attrs: { src, alt: alt || "" }
                }).run();
            }
        },
        [editor]
    );

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL:", previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <>
            <div className="rich-text-editor border border-gray-200 rounded-lg overflow-hidden relative bg-white">
                {/* Floating Menu */}
                <BubbleMenu
                    editor={editor}

                    className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${editor.isActive("bold") ? "text-primary bg-primary/10" : "text-gray-700"}`}
                        title="Kalın"
                    >
                        <strong>K</strong>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200"></div>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${editor.isActive("italic") ? "text-primary bg-primary/10" : "text-gray-700"}`}
                        title="İtalik"
                    >
                        <em>İ</em>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200"></div>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${editor.isActive("strike") ? "text-primary bg-primary/10" : "text-gray-700"}`}
                        title="Üstü Çizili"
                    >
                        <s>S</s>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200"></div>
                    <button
                        type="button"
                        onClick={(ev) => setLink(ev)}
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${editor.isActive("link") ? "text-primary bg-primary/10" : "text-gray-700"}`}
                        title="Link Ekle"
                    >
                        <Icons.Link className="h-4 w-4" />
                    </button>
                </BubbleMenu>

                {/* Toolbar */}
                <div className="toolbar border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMediaModalOpen(true);
                        }}
                        className="toolbar-btn flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Medya Ekle (video, ses, YouTube)"
                    >
                        <Icons.Video className="h-4 w-4 shrink-0" />
                        Medya Ekle
                    </button>
                    <div className="border-l border-gray-200 mx-1 shrink-0" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`toolbar-btn ${editor.isActive("bold") ? "toolbar-btn-active" : ""}`}
                        title="Kalın (Ctrl+B)"
                    >
                        <strong>K</strong>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`toolbar-btn ${editor.isActive("italic") ? "toolbar-btn-active" : ""}`}
                        title="İtalik (Ctrl+I)"
                    >
                        <em>İ</em>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`toolbar-btn ${editor.isActive("strike") ? "toolbar-btn-active" : ""}`}
                        title="Üstü Çizili"
                    >
                        <s>Ü</s>
                    </button>
                    <button
                        type="button"
                        onClick={(ev) => setLink(ev)}
                        className={`toolbar-btn ${editor.isActive("link") ? "toolbar-btn-active" : ""}`}
                        title="Link"
                    >
                        <Icons.Link className="h-4 w-4" />
                    </button>
                    <div className="border-l border-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "toolbar-btn-active" : ""}`}
                        title="Başlık 1"
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "toolbar-btn-active" : ""}`}
                        title="Başlık 2"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "toolbar-btn-active" : ""}`}
                        title="Başlık 3"
                    >
                        H3
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={`toolbar-btn ${editor.isActive("paragraph") ? "toolbar-btn-active" : ""}`}
                        title="Normal Metin"
                    >
                        P
                    </button>
                    <div className="border-l border-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`toolbar-btn ${editor.isActive("bulletList") ? "toolbar-btn-active" : ""}`}
                        title="Madde İşaretli Liste"
                    >
                        • Liste
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`toolbar-btn ${editor.isActive("orderedList") ? "toolbar-btn-active" : ""}`}
                        title="Numaralı Liste"
                    >
                        1. Liste
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`toolbar-btn ${editor.isActive("blockquote") ? "toolbar-btn-active" : ""}`}
                        title="Alıntı"
                    >
                        &quot; Alıntı
                    </button>
                    <div className="border-l border-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "toolbar-btn-active" : ""}`}
                        title="Sola Hizala"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "toolbar-btn-active" : ""}`}
                        title="Ortaya Hizala"
                    >
                        ↔
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "toolbar-btn-active" : ""}`}
                        title="Sağa Hizala"
                    >
                        →
                    </button>
                    <div className="border-l border-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="toolbar-btn"
                        title="Yatay Çizgi"
                    >
                        ―
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="toolbar-btn ml-auto"
                        title="Geri Al (Ctrl+Z)"
                    >
                        ↶
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="toolbar-btn"
                        title="Yinele (Ctrl+Y)"
                    >
                        ↷
                    </button>
                </div>

                <EditorContent editor={editor} placeholder={placeholder} />
            </div>
            {/* Modal form dışında render edilsin; URL eklerken sayfadan atılmasın */}
            {typeof document !== "undefined" &&
                createPortal(
                    <MediaInsertModal
                        isOpen={mediaModalOpen}
                        onClose={() => setMediaModalOpen(false)}
                        onInsert={insertMedia}
                    />,
                    document.body
                )}
        </>
    );
}
