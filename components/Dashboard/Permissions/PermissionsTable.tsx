"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TSystemPermission } from "@/types/permission.type";
import { useTranslation } from "@/hooks/use-translation";
import { getPermissionsColumns } from "./PermissionsColumns";
import ReusableTable from "@/components/common/ReusableTable";

interface IProps {
    permissions: TSystemPermission[];
    onOpenEditModal?: (permission: TSystemPermission) => void;
}

export default function PermissionsTable({ permissions = [], onOpenEditModal }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getPermissionsColumns({
        t,
        router,
        onOpenEditModal
    });


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 md:p-6 mb-5 overflow-x-auto"
        >
            <ReusableTable
                data={permissions}
                columns={columns}
                getRowKey={(row) => row._id}
                emptyMessage={t("manage_view_all_admin_permissions")}
            />
        </motion.div>
    );
}