'use client';

import { useRef, useEffect, useState, useCallback } from "react";
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
    Heading2,
    Rows,
    Trash2,
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
    const isInternalChange = useRef(false); // prevents cursor jump

    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        underline: false,
        unorderedList: false,
        orderedList: false,
        subheading: false,
    });

    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(2);
    const [tableOpen, setTableOpen] = useState(false);

    // ========== Save / Restore Cursor ==========
    const saveSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current) return null;

        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return {
            start,
            end: start + range.toString().length,
        };
    };

    const restoreSelection = (saved: { start: number; end: number } | null) => {
        if (!saved || !editorRef.current) return;

        const selection = window.getSelection();
        if (!selection) return;

        let charIndex = 0;
        const range = document.createRange();
        range.setStart(editorRef.current, 0);
        range.collapse(true);

        const nodeStack: Node[] = [editorRef.current];
        let node: Node | undefined;
        let foundStart = false;
        let stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nextCharIndex = charIndex + (node.textContent?.length || 0);
                if (!foundStart && saved.start >= charIndex && saved.start <= nextCharIndex) {
                    range.setStart(node, saved.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && saved.end >= charIndex && saved.end <= nextCharIndex) {
                    range.setEnd(node, saved.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        selection.removeAllRanges();
        selection.addRange(range);
    };

    // ========== Sync external value (only when needed) ==========
    useEffect(() => {
        if (!editorRef.current) return;

        // Skip if the change came from inside the editor
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (editorRef.current.innerHTML !== value) {
            const saved = saveSelection();
            editorRef.current.innerHTML = value || "";
            restoreSelection(saved);
        }
    }, [value]);

    // ========== Clean HTML ==========
    const cleanHtml = (html: string): string => {
        return html
            .replace(/ style="[^"]*"/gi, "")
            .replace(/ style='[^']*'/gi, "")
            .replace(/<span[^>]*>/gi, "")
            .replace(/<\/span>/gi, "")
            .replace(/<b>/gi, "<strong>")
            .replace(/<\/b>/gi, "</strong>")
            .replace(/<i>/gi, "<em>")
            .replace(/<\/i>/gi, "</em>")
            .replace(/<\/?thead[^>]*>/gi, "")
            .replace(/<\/?tbody[^>]*>/gi, "")
            .replace(/<div><br><\/div>/gi, "<br>")
            .replace(/<p><br><\/p>/gi, "<br>");
    };


    const updateActiveFormats = () => {
        const selection = window.getSelection();
        let isSubheading = false;

        if (selection?.anchorNode) {
            let node = selection.anchorNode as HTMLElement | null;
            while (node && node !== editorRef.current) {
                if (node.nodeType === 1 && node.classList?.contains("subheading")) {
                    isSubheading = true;
                    break;
                }
                node = node.parentElement;
            }
        }

        setActiveFormats({
            bold: document.queryCommandState("bold"),
            underline: document.queryCommandState("underline"),
            unorderedList: document.queryCommandState("insertUnorderedList"),
            orderedList: document.queryCommandState("insertOrderedList"),
            subheading: isSubheading,
        });
    };

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;

        isInternalChange.current = true;
        const cleaned = cleanHtml(editorRef.current.innerHTML);
        onChange(cleaned);
        updateActiveFormats();
    }, [onChange]);

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    // ========== Subheading ==========
    const applySubheading = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer as HTMLElement;

        while (node && node !== editorRef.current) {
            if (
                node.nodeType === 1 &&
                ["P", "DIV", "H1", "H2", "H3", "LI"].includes(node.nodeName)
            ) {
                break;
            }
            node = node.parentElement as HTMLElement;
        }

        if (node && node !== editorRef.current) {
            if (node.classList.contains("subheading")) {
                // Toggle off
                const p = document.createElement("p");
                p.innerHTML = node.innerHTML || "<br>";
                node.parentNode?.replaceChild(p, node);
            } else {
                const div = document.createElement("div");
                div.className = "subheading";
                div.innerHTML = node.innerHTML || "<br>";
                node.parentNode?.replaceChild(div, node);

                // Keep cursor at the end
                const newRange = document.createRange();
                newRange.selectNodeContents(div);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } else {
            document.execCommand("insertHTML", false, `<div class="subheading"><br></div>`);
        }

        handleInput();
    };

    // ========== Lists ==========
    const insertBulletList = () => {
        document.execCommand("insertUnorderedList", false);
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection) return;
            let node = selection.anchorNode as HTMLElement | null;
            while (node && node !== editorRef.current) {
                if (node.nodeName === "UL") {
                    node.setAttribute("class", "bullet-list");
                    break;
                }
                node = node.parentElement;
            }
            handleInput();
        }, 0);
    };

    const insertOrderedList = () => {
        document.execCommand("insertOrderedList", false);
        handleInput();
    };

    // ========== Table helpers ==========
    const findNearestTable = (): HTMLTableElement | null => {
        const selection = window.getSelection();
        if (selection?.anchorNode) {
            let node = selection.anchorNode as HTMLElement | null;
            while (node && node !== editorRef.current) {
                if (node.nodeName === "TABLE") return node as HTMLTableElement;
                node = node.parentElement;
            }
        }
        const tables = editorRef.current?.querySelectorAll("table.calc-table");
        return tables && tables.length > 0
            ? (tables[tables.length - 1] as HTMLTableElement)
            : null;
    };

    const insertTable = () => {
        const rows = Math.max(1, Math.min(tableRows, 15));
        const cols = Math.max(1, Math.min(tableCols, 8));

        let html = `<table class="calc-table"><tr>`;
        for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
        html += `</tr>`;

        for (let r = 0; r < rows; r++) {
            html += `<tr>`;
            for (let c = 0; c < cols; c++) html += `<td>Cell</td>`;
            html += `</tr>`;
        }
        html += `</table><p><br></p>`;

        document.execCommand("insertHTML", false, html);
        handleInput();
        setTableOpen(false);
    };

    const addTableRow = () => {
        const table = findNearestTable();
        if (!table) return;
        const cols = table.rows[0]?.cells.length || 2;
        const newRow = table.insertRow(-1);
        for (let i = 0; i < cols; i++) {
            newRow.insertCell().innerHTML = "Cell";
        }
        handleInput();
    };

    const addTotalRow = () => {
        const table = findNearestTable();
        if (!table) return;
        const cols = table.rows[0]?.cells.length || 2;
        const newRow = table.insertRow(-1);
        newRow.className = "total-row";
        for (let i = 0; i < cols; i++) {
            newRow.insertCell().innerHTML = i === 0 ? "Total" : "";
        }
        handleInput();
    };

    const deleteTableRow = () => {
        const selection = window.getSelection();
        if (!selection?.anchorNode) return;

        let node = selection.anchorNode as HTMLElement | null;
        while (node && node !== editorRef.current) {
            if (node.nodeName === "TR") {
                const table = node.closest("table");
                if (table && table.rows.length > 1) {
                    node.remove();
                    handleInput();
                }
                break;
            }
            node = node.parentElement;
        }
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
                    className={cn(activeFormats.bold && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("underline")}
                    className={cn(activeFormats.underline && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <Underline className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={insertBulletList}
                    className={cn(activeFormats.unorderedList && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={insertOrderedList}
                    className={cn(activeFormats.orderedList && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button type="button" size="sm" variant="ghost" onClick={() => exec("formatBlock", "p")}>
                    <Pilcrow className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={applySubheading}
                    className={cn(activeFormats.subheading && "bg-[#DC3173]/15 text-[#DC3173]")}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                {/* Table */}
                <Popover open={tableOpen} onOpenChange={setTableOpen}>
                    <PopoverTrigger asChild>
                        <Button type="button" size="sm" variant="ghost">
                            <Table className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4" align="start">
                        <div className="space-y-4">
                            <p className="text-sm font-medium">Insert Table</p>
                            <div className="flex items-center justify-between gap-3">
                                <Label>Rows</Label>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setTableRows(p => Math.max(1, p - 1))}>
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Input type="number" min={1} max={15} value={tableRows} onChange={e => setTableRows(Number(e.target.value) || 1)} className="w-14 h-8 text-center" />
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setTableRows(p => Math.min(15, p + 1))}>
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Label>Columns</Label>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setTableCols(p => Math.max(1, p - 1))}>
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Input type="number" min={1} max={8} value={tableCols} onChange={e => setTableCols(Number(e.target.value) || 1)} className="w-14 h-8 text-center" />
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setTableCols(p => Math.min(8, p + 1))}>
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <Button className="w-full" onClick={insertTable}>Insert Table</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button type="button" size="sm" variant="ghost" onClick={addTableRow} title="Add Row">
                    <Rows className="h-4 w-4" />
                </Button>

                <Button type="button" size="sm" variant="ghost" onClick={addTotalRow} title="Add Total Row" className="text-[#DC3173] font-bold">
                    Σ
                </Button>

                <Button type="button" size="sm" variant="ghost" onClick={deleteTableRow} title="Delete Row" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
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
        .rich-editor .subheading {
          font-weight: 600;
          font-size: 1rem;
          margin: 1rem 0 0.4rem;
          color: #111;
        }
        .rich-editor ul.bullet-list {
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
        .rich-editor table.calc-table {
         border-collapse: collapse;
        width: 100%;
         margin: 1rem 0;
         table-layout: auto;
        }

        .rich-editor table.calc-table th,
        .rich-editor table.calc-table td {
        border: 1px solid #d1d5db;
        padding: 0.6rem 0.9rem;
        text-align: left !important;
        vertical-align: top;
        white-space: normal;
        }

        .rich-editor table.calc-table th {
        background-color: #f3f4f6;
        font-weight: 600;
        text-align: left !important;
        }

        .rich-editor table.calc-table tr.total-row {
        font-weight: 700;
        background-color: #fdf2f8;
        }

        .rich-editor table.calc-table tr.total-row td {
        text-align: left !important;
        }
        .rich-editor p {
          margin: 0.5rem 0;
        }
      `}</style>
        </div>
    );
};

export default RichTextEditor;