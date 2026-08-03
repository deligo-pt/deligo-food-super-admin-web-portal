"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IProps {
  onSend: (text: string) => void;
  onTyping: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function SupportChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Type a reply...",
}: IProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`; // max-h-32
  }, [value]);

  const handleSend = () => {
    if (disabled || !value.trim()) return;
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    onTyping(e);
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
      <div className="flex items-end gap-2">
        <div
          className={`flex-1 bg-gray-50 rounded-xl border transition-all p-1 ${disabled
            ? "border-gray-200 opacity-60 cursor-not-allowed"
            : "border-gray-200 focus-within:border-[#DC3173] focus-within:ring-2 focus-within:ring-[#DC3173]/20"
            }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent px-3 py-2 outline-none text-sm resize-none max-h-32 min-h-10 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="p-3 bg-[#DC3173] text-white rounded-xl hover:bg-[#DC3173]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}