"use client";

import { useTranslation } from '@/hooks/use-translation';
import { motion, Variants } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
} from 'lucide-react';

interface IProps {
    title: string;
    setTitle: (value: string) => void;
    body: string;
    setBody: (value: string) => void;
    itemVariants: Variants;
}

export default function MessageForm({
    title,
    setTitle,
    body,
    setBody,
    itemVariants,
}: IProps) {
    const { t } = useTranslation();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: body,
        onUpdate: ({ editor }) => {
            setBody(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[160px] px-4 py-3',
            },
        },
    });

    useEffect(() => {
        if (editor && body !== editor.getHTML()) {
            editor.commands.setContent(body);
        }
    }, [body, editor]);

    const setLink = () => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                {t("message_content")}
            </h2>

            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {t("message_title")}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("short_catchy_title")}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all"
                    />
                </div>

                {/* Body */}
                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-xs font-semibold text-gray-600">
                            {t("message_body")}
                        </label>
                        <span className="text-xs text-gray-400">
                            {body.replace(/<[^>]*>/g, '').length} {t("chars")}
                        </span>
                    </div>

                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#DC3173] focus-within:ring-1 focus-within:ring-[#DC3173] transition-all">
                        {/* Toolbar - Lists first */}
                        {editor && (
                            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                                {/* Lists first as you requested */}
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    isActive={editor.isActive('bulletList')}
                                    title="Bullet List"
                                >
                                    <List size={16} />
                                </ToolbarButton>

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    isActive={editor.isActive('orderedList')}
                                    title="Numbered List"
                                >
                                    <ListOrdered size={16} />
                                </ToolbarButton>

                                <div className="w-px h-5 bg-gray-300 mx-1" />

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    isActive={editor.isActive('bold')}
                                    title="Bold"
                                >
                                    <Bold size={16} />
                                </ToolbarButton>

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    isActive={editor.isActive('italic')}
                                    title="Italic"
                                >
                                    <Italic size={16} />
                                </ToolbarButton>

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    isActive={editor.isActive('underline')}
                                    title="Underline"
                                >
                                    <UnderlineIcon size={16} />
                                </ToolbarButton>

                                <div className="w-px h-5 bg-gray-300 mx-1" />

                                <ToolbarButton
                                    onClick={setLink}
                                    isActive={editor.isActive('link')}
                                    title="Link"
                                >
                                    <LinkIcon size={16} />
                                </ToolbarButton>
                            </div>
                        )}

                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Important: Restore list styles that Tailwind removes */}
            <style jsx global>{`
                .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .ProseMirror li {
                    margin: 0.25rem 0;
                }
                .ProseMirror li p {
                    margin: 0;
                }
            `}</style>
        </motion.div>
    );
}

function ToolbarButton({
    onClick,
    isActive,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-md transition-colors ${isActive
                    ? 'bg-[#DC3173] text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
        >
            {children}
        </button>
    );
}