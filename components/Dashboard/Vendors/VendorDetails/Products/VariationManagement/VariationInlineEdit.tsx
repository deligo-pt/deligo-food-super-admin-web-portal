"use client";

import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  title: string;
  value: string;
  onSave: (val: string) => void;
  className?: string;
}

export default function VariationInlineEdit({
  title,
  value,
  onSave,
  className = "",
}: IProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft.trim() && draft.trim() !== value && draft.trim().length > 1) {
      onSave(draft.trim());
      setEditing(false);
    } else {
      toast.error(`${title} is required and must be at least 2 characters`);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`group inline-flex items-center gap-1.5 text-left ${className}`}
      >
        <span>{value}</span>
        <PencilIcon
          size={12}
          className="text-[#DC3173] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        onBlur={commit}
        className="px-2 py-0.5 rounded-lg border border-[#DC3173]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#DC3173]/50 w-32"
      />
      <button
        onClick={commit}
        className="p-0.5 text-green-600 hover:bg-green-50 rounded"
      >
        <CheckIcon size={14} />
      </button>
      <button
        onClick={cancel}
        className="p-0.5 text-gray-400 hover:bg-gray-50 rounded"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
