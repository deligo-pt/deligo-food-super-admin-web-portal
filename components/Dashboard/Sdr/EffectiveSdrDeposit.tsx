"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Banknote,
    Calendar,
    CheckCircle2,
    XCircle,
    Info,
} from "lucide-react";
import { TEffectiveSdrDeposit } from "@/types/sdr-deposits.type";
import TitleHeader from "@/components/TitleHeader/TitleHeader";

interface Props {
    sdr: TEffectiveSdrDeposit | null;
}

const EffectiveSdrDeposit = ({ sdr }: Props) => {
    const { t } = useTranslation();

    if (!sdr) {
        return (
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">
                        {t("effective_sdr_deposit") || "Effective SDR Deposit"}
                    </CardTitle>
                    <CardDescription>
                        {t("no_effective_sdr") || "No effective SDR deposit is currently active."}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <TitleHeader
                title={t("effective_sdr_deposit") || "Effective SDR Deposit"}
                subtitle={t("currently_active_sdr_config") ||
                    "Currently active deposit configuration"}
                extraComponent={(
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-sm font-medium px-3 py-1",
                            sdr.isActive
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700"
                        )}
                    >
                        {sdr.isActive ? (
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t("active") || "Active"}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" />
                                {t("inactive") || "Inactive"}
                            </span>
                        )}
                    </Badge>
                )}
            />
            <Card className="border shadow-sm">
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Amount */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#DC3173]/10 text-[#DC3173]">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t("deposit_amount") || "Deposit Amount"}
                                </p>
                                <p className="text-xl font-bold tracking-tight">
                                    {sdr.depositAmount.toFixed(2)}{" "}
                                    <span className="text-base font-medium text-muted-foreground">
                                        {sdr.currency}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Effective From */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t("effective_from") || "Effective From"}
                                </p>
                                <p className="font-medium">
                                    {format(new Date(sdr.effectiveFrom), "dd MMM yyyy, HH:mm")}
                                </p>
                            </div>
                        </div>

                        {/* Source */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t("source") || "Source"}
                                </p>
                                <p className="font-medium capitalize">{sdr.source}</p>
                            </div>
                        </div>

                        {/* Deposit ID
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t("deposit_id") || "Deposit ID"}
                                </p>
                                <p className="font-mono text-sm break-all">{sdr.depositId}</p>
                            </div>
                        </div> */}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default EffectiveSdrDeposit;