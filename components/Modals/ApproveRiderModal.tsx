"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Mail, User, UserCheck, MapPin, Briefcase, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea"; // make sure you have this
import { Label } from "@/components/ui/label";
import { TAgent } from "@/types/user.type";
import { getAllFleetManagersReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";
import {
    assignFleetAndApproveRiderReq,
    reAssignFleetApprovedRider,
} from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    partnerId: string;
    partnerName: string;
    city: string;
    status:
    | "APPROVED"
    | "REJECTED"
    | "BLOCKED"
    | "UNBLOCKED"
    | "ASSIGN"
    | "RE_ASSIGN"
    | "SUBMITTED";
    currentFleetManagerId?: string | null;
}

export default function ApproveRiderModal({
    open,
    onOpenChange,
    partnerId,
    partnerName,
    city,
    status,
    currentFleetManagerId = null,
}: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [fleets, setFleets] = useState<TAgent[]>([]);
    const [isLoadingFleets, setIsLoadingFleets] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFleetId, setSelectedFleetId] = useState<string>("");
    const [remarks, setRemarks] = useState("");

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedFleetId("");
            setRemarks("");
            return;
        }

        // Pre-select the already assigned fleet (especially useful for RE_ASSIGN)
        if (currentFleetManagerId) {
            setSelectedFleetId(currentFleetManagerId);
        } else {
            setSelectedFleetId("");
        }
    }, [open, currentFleetManagerId]);

    useEffect(() => {
        if (open && city) {
            const fetchFleetsByCity = async () => {
                setIsLoadingFleets(true);
                try {
                    const res = await getAllFleetManagersReq({ city });
                    setFleets(res?.data || []);
                } catch (error) {
                    console.error("Failed to load fleet managers for city:", city, error);
                    toast.error("Could not load fleet managers for this city.");
                } finally {
                    setIsLoadingFleets(false);
                }
            };

            fetchFleetsByCity();
        }
    }, [open, city]);

    // ASSIGN
    const handleAssignToFleet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFleetId) return;

        const toastId = toast.loading("Assigning to fleet manager...");
        setIsSubmitting(true);

        try {
            const result = await assignFleetAndApproveRiderReq(
                { fleetManagerId: selectedFleetId },
                partnerId
            );

            if (result?.success) {
                setSelectedFleetId("");
                toast.success("Rider assigned successfully", { id: toastId });
                onOpenChange(false);
                router.refresh();
                return;
            }

            if (result?.data?.errorSources) {
                result.data.errorSources.forEach((err: { path: string; message: string }) =>
                    toast.error(err?.message, { id: toastId })
                );
            } else {
                toast.error(result.message || "Rider assigned failed", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // RE-ASSIGN
    const handleReAssignToFleet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFleetId) return;

        const toastId = toast.loading("Re-assigning to fleet manager...");
        setIsSubmitting(true);

        try {
            const result = await reAssignFleetApprovedRider(
                {
                    fleetManagerId: selectedFleetId,
                    reason: remarks.trim() || undefined,
                },
                partnerId
            );

            if (result?.success) {
                setSelectedFleetId("");
                setRemarks("");
                toast.success("Rider re-assigned successfully", { id: toastId });
                onOpenChange(false);
                router.refresh();
                return;
            }

            if (result?.data?.errorSources) {
                result.data.errorSources.forEach((err: { path: string; message: string }) =>
                    toast.error(err?.message, { id: toastId })
                );
            } else {
                toast.error(result.message || "Rider re-assigned failed", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ASSIGN + APPROVE
    const handleAssignAndApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFleetId) return;

        const toastId = toast.loading("Assigning fleet manager and approving rider...");
        setIsSubmitting(true);

        try {
            const result = await assignFleetAndApproveRiderReq(
                { fleetManagerId: selectedFleetId },
                partnerId
            );

            if (result?.success) {
                setSelectedFleetId("");
                const approveRes = await approveOrRejectReq(partnerId, { status: "APPROVED" });

                if (approveRes.success) {
                    toast.success("Rider assigned and approved successfully", { id: toastId });
                    onOpenChange(false);
                    router.refresh();
                }
                return;
            }

            if (result?.data?.errorSources) {
                result.data.errorSources.forEach((err: { path: string; message: string }) =>
                    toast.error(err?.message, { id: toastId })
                );
            } else {
                toast.error(result?.message || "Operation failed", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // APPROVE / REJECT / BLOCK (no RE_ASSIGN here)
    const handleApproveOrReject = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guard – RE_ASSIGN should never reach here
        if (status === "RE_ASSIGN" || status === "ASSIGN") return;

        const toastId = toast.loading(
            status === "APPROVED"
                ? "Approving..."
                : status === "REJECTED"
                    ? "Rejecting..."
                    : status === "BLOCKED"
                        ? "Blocking..."
                        : "Unblocking..."
        );
        setIsSubmitting(true);

        const updateStatus = {
            status:
                status === "UNBLOCKED" || status === "SUBMITTED"
                    ? ("APPROVED" as const)
                    : (status as "APPROVED" | "REJECTED" | "BLOCKED"),
            remarks,
        };

        const result = await approveOrRejectReq(partnerId, updateStatus);

        if (result?.success) {
            setRemarks("");
            onOpenChange(false);
            toast.success(
                result.message ||
                (status === "APPROVED"
                    ? "Approved successfully!"
                    : status === "REJECTED"
                        ? "Rejected successfully!"
                        : status === "BLOCKED"
                            ? "Blocked successfully!"
                            : "Unblocked successfully!"),
                { id: toastId }
            );
            router.refresh();
            setIsSubmitting(false);
            return;
        }

        if (result?.data?.errorSources) {
            result.data.errorSources.forEach((err: { path: string; message: string }) =>
                toast.error(err?.message, { id: toastId })
            );
        } else {
            toast.error(
                result.message ||
                (status === "APPROVED"
                    ? "Approving failed"
                    : status === "REJECTED"
                        ? "Rejecting failed"
                        : status === "BLOCKED"
                            ? "Blocking failed"
                            : "Unblocking failed"),
                { id: toastId }
            );
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2" style={{ color: "#DC3173" }}>
                        <UserCheck size={20} />
                        {status === "RE_ASSIGN"
                            ? t("re_assign_rider") || "Re-assign Rider"
                            : t("approve_rider")}{" "}
                        — {partnerName}
                    </DialogTitle>
                    <DialogDescription>
                        {t("rider_city")}:{" "}
                        <span className="font-semibold text-gray-900 capitalize mx-1">
                            {city || "N/A"}
                        </span>
                        . {t("showing_available_fleet_managers")}
                    </DialogDescription>
                </DialogHeader>

                {/* Fleet Managers Table */}
                <div
                    className="flex-1 overflow-y-auto my-2 border rounded-xl bg-white min-h-50 max-h-87.5"
                    style={{ borderColor: "#DC317320" }}
                >
                    {isLoadingFleets ? (
                        <div className="flex flex-col items-center justify-center p-12 text-sm text-gray-400 gap-2">
                            <Loader2 className="animate-spin" style={{ color: "#DC3173" }} size={24} />
                            {t("loading_fleet_managers_in")} {city}...
                        </div>
                    ) : (
                        <Table>
                            <TableHeader
                                className="sticky top-0 backdrop-blur-xs z-10 border-b"
                                style={{ backgroundColor: "#DC317308", borderColor: "#DC317315" }}
                            >
                                <TableRow className="hover:bg-transparent">
                                    <TableHead style={{ color: "#DC3173" }}>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <User size={13} /> {t("manager")}
                                        </div>
                                    </TableHead>
                                    <TableHead style={{ color: "#DC3173" }}>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <Building2 size={13} /> {t("business")}
                                        </div>
                                    </TableHead>
                                    <TableHead style={{ color: "#DC3173" }}>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <MapPin size={13} /> {t("city")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right" style={{ color: "#DC3173" }}>
                                        <div className="flex items-center justify-end gap-1 font-semibold">
                                            <Briefcase size={13} /> {t("select")}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-gray-600">
                                {fleets.map((fleet) => {
                                    const fullName = `${fleet.name?.firstName || ""} ${fleet.name?.lastName || ""}`.trim() || "N/A";
                                    const isSelected = selectedFleetId === fleet?._id;
                                    const isCurrent = currentFleetManagerId === fleet.userId;

                                    return (
                                        <TableRow
                                            key={fleet._id}
                                            className="transition-colors cursor-pointer"
                                            style={{
                                                backgroundColor: isSelected ? "#DC317308" : "transparent",
                                            }}
                                            onClick={() => setSelectedFleetId(fleet._id)}
                                        >
                                            <TableCell className="p-3">
                                                <div className="font-medium text-gray-900 line-clamp-1">
                                                    {fullName}
                                                </div>
                                                {isCurrent && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium whitespace-nowrap">
                                                        {t("current") || "Current"}
                                                    </span>
                                                )}
                                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Mail size={11} /> {fleet.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3 text-xs font-medium text-gray-700">
                                                {fleet.businessDetails?.businessName || "—"}
                                            </TableCell>
                                            <TableCell className="p-3 text-xs text-gray-500 capitalize">
                                                {fleet.businessLocation?.city || fleet.address?.city || city}
                                            </TableCell>
                                            <TableCell
                                                className="p-3 text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="radio"
                                                    name="selectedFleet"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedFleetId(fleet._id)}
                                                    className="h-4 w-4 border-gray-300 cursor-pointer"
                                                    style={{ accentColor: "#DC3173" }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {fleets.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="p-8 text-center text-xs text-gray-400 hover:bg-transparent"
                                        >
                                            {t("no_fleet_managers_found_in")} {city}.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Reason textarea – only for RE_ASSIGN */}
                {status === "RE_ASSIGN" && (
                    <div className="space-y-2 mt-2">
                        <Label className="text-sm font-medium text-gray-700">
                            {t("re_assign_reason") || "Reason for re-assignment"}{" "}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={t("enter_reason_for_reassign") || "Enter reason..."}
                            className="min-h-20 resize-none"
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                {/* Footer Buttons */}
                <DialogFooter className="pt-4 border-t mt-auto" style={{ borderColor: "#DC317315" }}>
                    <DialogClose asChild>
                        <Button variant="outline" size="sm" disabled={isSubmitting}>
                            {t("cancel")}
                        </Button>
                    </DialogClose>

                    {/* RE_ASSIGN → only one button */}
                    {status === "RE_ASSIGN" ? (
                        <Button
                            onClick={handleReAssignToFleet}
                            disabled={isSubmitting || !selectedFleetId || isLoadingFleets}
                            size="sm"
                            className="text-white font-medium"
                            style={{ backgroundColor: "#DC3173" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("re_assigning") || "Re-assigning..."}
                                </>
                            ) : (
                                t("re_assign") || "Re Assign"
                            )}
                        </Button>
                    ) : status === "ASSIGN" ? (
                        <Button
                            onClick={handleAssignToFleet}
                            disabled={isSubmitting || !selectedFleetId || isLoadingFleets}
                            size="sm"
                            className="text-white font-medium"
                            style={{ backgroundColor: "#DC3173" }}
                        >
                            {t("assign_to_fleet_manager")}
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleAssignAndApprove}
                                disabled={isSubmitting || !selectedFleetId || isLoadingFleets}
                                size="sm"
                                className="text-white font-medium"
                                style={{ backgroundColor: "#DC3173" }}
                            >
                                {t("assign_and_approve")}
                            </Button>
                            <Button
                                onClick={handleApproveOrReject}
                                disabled={isSubmitting || isLoadingFleets}
                                size="sm"
                                className="text-white font-medium"
                                style={{ backgroundColor: "#DC3173" }}
                            >
                                {t("approve_without_assign")}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}