'use client';

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Underline,
    List,
    ListOrdered,
    Pilcrow,
    Table,
    Plus,
    Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Write content here...",
    className,
}: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        underline: false,
        unorderedList: false,
        orderedList: false,
    });

    // Table size controls
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(2);
    const [tableOpen, setTableOpen] = useState(false);

    // Sync external value → editor
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    const updateActiveFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            underline: document.queryCommandState("underline"),
            unorderedList: document.queryCommandState("insertUnorderedList"),
            orderedList: document.queryCommandState("insertOrderedList"),
        });
    };

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
        updateActiveFormats();
    };

    const handleInput = () => {
        if (!editorRef.current) return;

        let html = editorRef.current.innerHTML;

        html = html
            .replace(/<div><br><\/div>/gi, "<br>")
            .replace(/<div>/gi, "<p>")
            .replace(/<\/div>/gi, "</p>")
            .replace(/<b>/gi, "<strong>")
            .replace(/<\/b>/gi, "</strong>");

        onChange(html);
        updateActiveFormats();
    };

    // Generate table with custom rows & columns
    const insertTable = () => {
        const rows = Math.max(1, Math.min(tableRows, 15)); // limit 1-15
        const cols = Math.max(1, Math.min(tableCols, 8));  // limit 1-8

        let tableHtml = `<table><thead><tr>`;

        // Header row
        for (let c = 0; c < cols; c++) {
            tableHtml += `<th>Header ${c + 1}</th>`;
        }
        tableHtml += `</tr></thead><tbody>`;

        // Body rows
        for (let r = 0; r < rows; r++) {
            tableHtml += `<tr>`;
            for (let c = 0; c < cols; c++) {
                tableHtml += `<td>Cell</td>`;
            }
            tableHtml += `</tr>`;
        }

        tableHtml += `</tbody></table><p><br></p>`;

        document.execCommand("insertHTML", false, tableHtml);
        handleInput();
        setTableOpen(false);
    };

    const toggleList = (ordered: boolean) => {
        const command = ordered ? "insertOrderedList" : "insertUnorderedList";
        document.execCommand(command, false);
        editorRef.current?.focus();
        handleInput();
        updateActiveFormats();
    };

    return (
        <div className={cn("border rounded-md overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b bg-muted/40 flex-wrap">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("bold")}
                    title="Bold"
                    className={cn(activeFormats.bold && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("underline")}
                    title="Underline"
                    className={cn(activeFormats.underline && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <Underline className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleList(false)}
                    title="Bullet List"
                    className={cn(activeFormats.unorderedList && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleList(true)}
                    title="Numbered List"
                    className={cn(activeFormats.orderedList && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("formatBlock", "p")}
                    title="Paragraph"
                >
                    <Pilcrow className="h-4 w-4" />
                </Button>

                {/* ===== Table with size selector ===== */}
                <Popover open={tableOpen} onOpenChange={setTableOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            title="Insert Table"
                        >
                            <Table className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-64 p-4" align="start">
                        <div className="space-y-4">
                            <p className="text-sm font-medium">Insert Table</p>

                            {/* Rows */}
                            <div className="flex items-center justify-between gap-3">
                                <Label className="text-sm">Rows</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => setTableRows((prev) => Math.max(1, prev - 1))}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={15}
                                        value={tableRows}
                                        onChange={(e) => setTableRows(Number(e.target.value) || 1)}
                                        className="w-14 h-8 text-center"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => setTableRows((prev) => Math.min(15, prev + 1))}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Columns */}
                            <div className="flex items-center justify-between gap-3">
                                <Label className="text-sm">Columns</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => setTableCols((prev) => Math.max(1, prev - 1))}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={8}
                                        value={tableCols}
                                        onChange={(e) => setTableCols(Number(e.target.value) || 1)}
                                        className="w-14 h-8 text-center"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => setTableCols((prev) => Math.min(8, prev + 1))}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="button"
                                className="w-full"
                                onClick={insertTable}
                            >
                                Insert Table
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                className="min-h-40 p-4 outline-none prose prose-sm max-w-none focus:ring-0 rich-editor"
                data-placeholder={placeholder}
            />

            <style jsx global>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        .rich-editor ul {
          list-style-type: disc !important;
          padding-left: 1.75rem !important;
          margin: 0.75rem 0 !important;
        }

        .rich-editor ol {
          list-style-type: decimal !important;
          padding-left: 1.75rem !important;
          margin: 0.75rem 0 !important;
        }

        .rich-editor li {
          margin: 0.25rem 0 !important;
          display: list-item !important;
        }

        .rich-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }

        .rich-editor th,
        .rich-editor td {
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        .rich-editor th {
          background-color: #f3f4f6;
          font-weight: 600;
        }

        .rich-editor p {
          margin: 0.5rem 0;
        }
      `}</style>
        </div>
    );
};

export default RichTextEditor;