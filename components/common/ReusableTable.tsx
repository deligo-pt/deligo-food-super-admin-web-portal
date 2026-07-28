'use client';
import React from "react";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export interface Column<T> {
    header: React.ReactNode;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}


interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    getRowKey: (row: T) => string;
    emptyMessage?: string;
    isRefreshing?: boolean;
};

function ReusableTable<T>({
    data = [],
    columns = [],
    getRowKey,
    emptyMessage = "No records found",
    isRefreshing = false,
}: TableProps<T>) {

    return (
        <>
            <div className="relative">
                {/* refresing overlay */}
                {isRefreshing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Refreshing...</p>
                        </div>
                    </div>
                )}

                {/* main table */}
                <Table>
                    {/* head */}
                    <TableHeader>
                        <TableRow>
                            {columns?.map((column, colIndex) => (
                                <TableHead key={colIndex} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    {/* body */}
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-[#DC3173] text-lg text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.map((item) => (
                                <TableRow key={getRowKey(item)}>
                                    {columns?.map((col, colIdx) => (
                                        <TableCell key={colIdx} className={col.className}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : String(item[col.accessor])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default ReusableTable;