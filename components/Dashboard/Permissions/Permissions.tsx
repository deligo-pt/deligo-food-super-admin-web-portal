'use client';

import AllFilters from '@/components/Filtering/AllFilters';
import TitleHeader from '@/components/TitleHeader/TitleHeader';
import PermissionsTable from './PermissionsTable';
import { TSystemPermission } from '@/types/permission.type';
import { TMeta } from '@/types';
import PaginationComponent from '@/components/Filtering/PaginationComponent';
import { motion } from "framer-motion";
import { useState } from 'react';
import UpdatePermissionModal from './UpdatePermissionModal';

interface IProps {
    permissionsResult: { data: TSystemPermission[]; meta?: TMeta };
}

const sortOptions = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
    { label: "Establishment (A-Z)", value: "establishmentName" },
];

const Permissions = ({
    permissionsResult
}: IProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<TSystemPermission | null>(null);

    const handleOpenEdit = (permission: TSystemPermission) => {
        setSelectedPermission(permission);
        setIsModalOpen(true);
    };

    const handleCloseEdit = () => {
        setIsModalOpen(false);
        setSelectedPermission(null);
    };

    return (
        <div className="space-y-6 max-w-full">
            {/* Page Title */}
            <TitleHeader
                title={"All Permissions"}
                subtitle={"Manage and view all admin permissions"}
            />

            {/* Filters */}
            <AllFilters
                sortOptions={sortOptions}
            />

            {/* Agreements Table */}
            <PermissionsTable permissions={permissionsResult?.data || []} onOpenEditModal={handleOpenEdit} />

            {/* Pagination */}
            {!!permissionsResult?.meta?.totalPage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-6"
                >
                    <PaginationComponent
                        totalPages={permissionsResult?.meta?.totalPage as number}
                    />
                </motion.div>
            )}

            {/* Edit Permission modal */}
            <UpdatePermissionModal
                isOpen={isModalOpen}
                onClose={handleCloseEdit}
                permission={selectedPermission}
            />
        </div>
    );
};

export default Permissions;