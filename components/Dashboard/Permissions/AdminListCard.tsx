"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TAdmin } from "@/types/admin.type";
import { Check } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface AdminListCardProps {
    admins: TAdmin[];
    selectedAdminId?: string;
    onSelectAdmin: (id: string) => void;
}

const AdminListCard = ({ admins, selectedAdminId, onSelectAdmin }: AdminListCardProps) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAdmins = admins.filter((admin) =>
        admin?.name?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin?.name?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin?.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="rounded-3xl bg-white border shadow-sm p-5 space-y-4">
            <div className="flex items-center space-x-2">
                <span className="text-primary text-lg">🔒</span>
                <h3 className="font-bold text-base text-gray-900">{t("select_admin_user")}</h3>
            </div>

            <Input
                placeholder={t("search_admins") || "Search admins..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 text-sm bg-gray-50/50"
            />

            <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-2">
                    {filteredAdmins.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">{t("no_admins_found")}</p>
                    ) : (
                        filteredAdmins.map((admin) => {
                            const isSelected = admin.userId === selectedAdminId;
                            return (
                                <div
                                    key={admin?._id}
                                    onClick={() => onSelectAdmin(admin.userId)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200",
                                        isSelected
                                            ? "border-[#DC3173] bg-[#FFF1F7]"
                                            : "border-gray-100 hover:bg-gray-50/80"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-sm text-gray-600">
                                            {
                                                admin?.profilePhoto ?
                                                    <Image src={admin?.profilePhoto} width={30} height={30}
                                                    className="rounded-full" alt="Profile photo" /> : (
                                                        <span>
                                                            {admin?.name?.firstName?.charAt(0)}
                                                            {admin?.name?.lastName?.charAt(0)}
                                                        </span>
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{admin.name?.firstName} {admin?.name?.lastName}</p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                ADMIN ID: <span className={isSelected ? "text-[#DC3173]" : "text-gray-700"}>{admin?.userId}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-[#DC3173] flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
};

export const AdminListCardComponent = React.memo(AdminListCard);