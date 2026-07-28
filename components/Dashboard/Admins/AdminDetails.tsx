'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftCircle,
    UserIcon,
    MapPin,
    ShieldAlert,
    History,
    FileText,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TAdmin } from '@/types/admin.type';
import { useTranslation } from '@/hooks/use-translation';

// Reusable Subcomponent
const InfoField = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div>
        <span className="text-gray-400 block text-xs font-medium mb-0.5">{label}</span>
        <span className="text-gray-800 text-sm font-semibold">{value || '—'}</span>
    </div>
);

// Reusable Collapsible Panel Section Wrapper
const AccordionSection = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children
}: {
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode
}) => (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div
            onClick={onToggle}
            className="flex justify-between items-center p-4 border-b border-gray-50 cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
        >
            <div className="flex items-center gap-2.5 text-gray-700">
                <Icon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="text-sm font-bold tracking-wide text-gray-800">{title}</h3>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>

        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="p-5 bg-white text-gray-700">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const AdminDetails = ({ admin }: { admin: TAdmin }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [panels, setPanels] = useState({
        personal: true,
        location: true,
        permissions: true,
        activity: true,
        documents: true,
    });

    const togglePanel = (key: keyof typeof panels) => {
        setPanels(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-xs';
            case 'PENDING': return 'bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs';
            case 'BLOCKED': return 'bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full text-xs';
            default: return 'bg-white text-gray-600 font-semibold px-3 py-1 rounded-full text-xs';
        }
    };

    const formatDate = (date: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen">
            {/* Go Back Link Button */}
            <div className="mb-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0 py-0 h-4 cursor-pointer font-medium bg-transparent border-none"
                >
                    <ArrowLeftCircle className="w-5 h-5" /> {t("go_back")}
                </button>
            </div>

            {/* Header Container Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mx-auto bg-gray-50 rounded-xl overflow-hidden shadow-md border border-gray-100"
            >
                <div className="relative bg-linear-to-r from-[#DC3173] to-[#e95b92] p-6 text-white">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute top-6 right-6"
                    >
                        <span className={getStatusColor(admin?.status)}>
                            {admin?.status}
                        </span>
                    </motion.div>

                    <div className="flex items-center gap-5">
                        {admin?.profilePhoto ? (
                            <Image
                                src={admin.profilePhoto}
                                alt={`${admin?.name?.firstName || "Admin"}`}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-md"
                                width={200}
                                height={200}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/10">
                                <UserIcon size={36} />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-wide">
                                {admin?.name?.firstName} {admin?.name?.lastName}
                            </h1>
                            <p className="opacity-90 text-sm mt-0.5">{admin?.email}</p>
                            {admin?.contactNumber && (
                                <p className="opacity-90 text-sm mt-0.5">{admin?.contactNumber}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dynamic Accordion Stack List Container */}
                <div className="p-4 md:p-6 space-y-4 max-w-full">

                    {/* Section 1: Personal Details */}
                    <AccordionSection
                        title="Personal Details"
                        icon={UserIcon}
                        isOpen={panels.personal}
                        onToggle={() => togglePanel('personal')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <InfoField label={t("full_name")} value={`${admin?.name?.firstName || ''} ${admin?.name?.lastName || ''}`.trim() || 'N/A'} />
                            <InfoField label={t('email')} value={admin?.email} />
                            <InfoField label={t("contact_number")} value={admin?.contactNumber} />
                            <InfoField label={t("email_verified")} value={admin?.isEmailVerified ? t("yes") : t("no")} />
                        </div>
                    </AccordionSection>

                    {/* Section 2: Business / System Profile Roles */}
                    <AccordionSection
                        title={t("system_role_configuration")}
                        icon={ShieldAlert}
                        isOpen={panels.permissions}
                        onToggle={() => togglePanel('permissions')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-4">
                            <InfoField label={t("system_id")} value={admin?.userId} />
                            <InfoField label={t("assigned_role")} value={admin?.role?.replace('_', ' ')} />
                            <InfoField label={t("update_protection_lock")} value={admin?.isUpdateLocked ? "Active (Locked)" : "Inactive (Open)"} />
                            <InfoField label={t("account_marked_deleted")} value={admin?.isDeleted ? t("yes") : t("no")} />
                        </div>
                        <div className="mt-4 border-t border-gray-50 pt-4">
                            <span className="text-gray-400 block text-xs font-medium mb-2">{t("security_capability_permissions_tokens")}</span>
                            {admin?.permissions && admin.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {admin.permissions.map((perm, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-sm font-mono font-medium">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">{t("no_tailored_capability_constraints")}</p>
                            )}
                        </div>
                    </AccordionSection>

                    {/* Section 3: Location Details */}
                    <AccordionSection
                        title={t("location_details")}
                        icon={MapPin}
                        isOpen={panels.location}
                        onToggle={() => togglePanel('location')}
                    >
                        {admin?.address && (admin.address.street || admin.address.city || admin.address.country) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <InfoField label={t("street_address")} value={admin.address.street} />
                                <InfoField label={t("postal_code")} value={admin.address.postalCode} />
                                <InfoField label={t("city")} value={admin.address.city} />
                                <InfoField label={t("state")} value={admin.address.state} />
                                <InfoField label={t("country")} value={admin.address.country} />
                                <InfoField label={t("geo_coordinates")} value={admin.address.latitude && admin.address.longitude ? `${admin.address.latitude}, ${admin.address.longitude}` : 'No GPS Data'} />
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic py-1">{t("no_operational_location_address_details_provided")}</p>
                        )}
                    </AccordionSection>

                    {/* Section 4: Workflow Activity Logs */}
                    <AccordionSection
                        title={t("activity_logs")}
                        icon={History}
                        isOpen={panels.activity}
                        onToggle={() => togglePanel('activity')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
                            <InfoField label={t("registered_on")} value={formatDate(admin?.createdAt as Date)} />
                            <InfoField label={t("last_modification_status_update")} value={formatDate(admin?.updatedAt as Date)} />
                            <InfoField label={t("decision_audit_mapped_at")} value={formatDate(admin?.approvedOrRejectedOrBlockedAt as Date)} />
                            <InfoField label={t("action_enforced_by_log_id")} value={admin?.approvedBy || admin?.rejectedBy || admin?.blockedBy || 'N/A'} />
                            <div className="md:col-span-2">
                                <InfoField label={t("internal_workflow_remarks")} value={admin?.remarks || t("no_recorded_history_notes")} />
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Section 5: Documents */}
                    <AccordionSection
                        title={t("documents")}
                        icon={FileText}
                        isOpen={panels.documents}
                        onToggle={() => togglePanel('documents')}
                    >
                        <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 font-medium">{t("no_verified_identity_credentials_refernece_documents")}</p>
                        </div>
                    </AccordionSection>

                </div>
            </motion.div>
        </div>
    );
};

export default AdminDetails;