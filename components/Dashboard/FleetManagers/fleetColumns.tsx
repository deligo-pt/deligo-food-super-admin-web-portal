import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAgent } from "@/types/user.type";
import { CircleCheckBig, Cog, IdCard, Mail, MoreVertical, Phone } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetFleetManagerColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    handleStatusInfo: (agentId: string, agentName: string, status: string) => void;
    handleDeleteId: (id: string) => void;
}

export function getFleetManagerColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
}: GetFleetManagerColumnsParams): Column<TAgent>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (agent) => agent?.businessDetails?.businessName || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Mail className="w-4" />
                    {t("email")}
                </div>
            ),
            accessor: (agent) => agent.email,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4" />
                    {t("phone")}
                </div>
            ),
            accessor: (agent) => agent.contactNumber,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (agent) => (agent.isDeleted ? "Deleted" : agent.status),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (agent) => {
                if (agent.isDeleted) return null;

                const businessName = agent.businessDetails?.businessName || "";

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => router.push(`/admin/agent/${agent.userId}`)}
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {agent.status === "SUBMITTED" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusInfo(
                                                agent.userId as string,
                                                businessName,
                                                "APPROVED"
                                            )
                                        }
                                    >
                                        {t("approve")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusInfo(
                                                agent.userId as string,
                                                businessName,
                                                "REJECTED"
                                            )
                                        }
                                    >
                                        {t("reject")}
                                    </DropdownMenuItem>
                                </>
                            )}

                            {agent.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            agent.userId as string,
                                            businessName,
                                            "BLOCKED"
                                        )
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {agent.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            agent.userId as string,
                                            businessName,
                                            "UNBLOCKED"
                                        )
                                    }
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteId(agent.userId)}
                            >
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}