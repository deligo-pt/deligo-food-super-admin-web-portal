import { Button } from '@/components/ui/button';
import { USER_ROLE } from '@/consts/user.const';
import { TMeta } from '@/types';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    BikeIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    LoaderCircleIcon,
    SearchIcon,
    ShieldIcon,
    StoreIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAllUsersReq } from '@/services/dashboard/system-management/email-notification-settings.service';
import { TUser } from './BroadcastCenter';
import { useTranslation } from '@/hooks/use-translation';

type RoleType = keyof Pick<
    typeof USER_ROLE,
    'ADMIN' | 'CUSTOMER' | 'FLEET_MANAGER' | 'VENDOR' | 'DELIVERY_PARTNER'
>;

interface IProps {
    selectedRoles: RoleType[];
    setSelectedRoles: (
        value: RoleType[] | ((prev: RoleType[]) => RoleType[]),
    ) => void;
    selectedUsers: Record<RoleType, Set<string>>;
    setSelectedUsers: (
        value:
            | Record<RoleType, Set<string>>
            | ((prev: Record<RoleType, Set<string>>) => Record<RoleType, Set<string>>),
    ) => void;
    expandedPanels: Record<RoleType, boolean>;
    setExpandedPanels: (
        value:
            | Record<RoleType, boolean>
            | ((prev: Record<RoleType, boolean>) => Record<RoleType, boolean>),
    ) => void;
    searchQueries: Record<RoleType, string>;
    setSearchQueries: (
        value:
            | Record<RoleType, string>
            | ((prev: Record<RoleType, string>) => Record<RoleType, string>),
    ) => void;
    itemVariants: Variants;
}

const ROLES = [
    { id: 'VENDOR', label: 'vendors', icon: StoreIcon, color: 'blue' },
    { id: 'FLEET_MANAGER', label: 'fleet_managers', icon: UsersIcon, color: 'purple' },
    { id: 'CUSTOMER', label: 'customers', icon: UserIcon, color: 'emerald' },
    { id: 'DELIVERY_PARTNER', label: 'riders', icon: BikeIcon, color: 'amber' },
    { id: 'ADMIN', label: 'admins', icon: ShieldIcon, color: 'red' },
] as const;

const Avatar = ({ name, colorClass }: { name: string; colorClass: string }) => {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    return (
        <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}
        >
            {initials}
        </div>
    );
};

export default function RoleSelector({
    selectedRoles,
    setSelectedRoles,
    selectedUsers,
    setSelectedUsers,
    expandedPanels,
    setExpandedPanels,
    searchQueries,
    setSearchQueries,
    itemVariants,
}: IProps) {
    const { t } = useTranslation();

    const [targetModes, setTargetModes] = useState<Record<RoleType, 'all' | 'specific'>>({
        VENDOR: 'all',
        CUSTOMER: 'all',
        DELIVERY_PARTNER: 'all',
        FLEET_MANAGER: 'all',
        ADMIN: 'all',
    });

    const [usersData, setUsersData] = useState<
        Record<RoleType, { data: TUser[]; meta?: TMeta }>
    >({
        VENDOR: { data: [] },
        CUSTOMER: { data: [] },
        DELIVERY_PARTNER: { data: [] },
        FLEET_MANAGER: { data: [] },
        ADMIN: { data: [] },
    });

    const [userDataLoading, setUserDataLoading] = useState<Record<RoleType, boolean>>({
        VENDOR: false,
        CUSTOMER: false,
        DELIVERY_PARTNER: false,
        FLEET_MANAGER: false,
        ADMIN: false,
    });

    // Keep track of the last search term that was actually sent to the API
    const lastFetchedSearch = useRef<Record<RoleType, string>>({
        VENDOR: '',
        CUSTOMER: '',
        DELIVERY_PARTNER: '',
        FLEET_MANAGER: '',
        ADMIN: '',
    });

    // Core fetch
    const getUsers = useCallback(
        async (roleId: RoleType, limit = 10, searchTerm = '') => {
            setUserDataLoading((prev) => ({ ...prev, [roleId]: true }));

            try {
                const resultData = await getAllUsersReq({
                    limit,
                    role: roleId,
                    searchTerm,
                });

                setUsersData((prev) => ({
                    ...prev,
                    [roleId]: resultData,
                }));
                lastFetchedSearch.current[roleId] = searchTerm;
            } finally {
                setUserDataLoading((prev) => ({ ...prev, [roleId]: false }));
            }
        },
        [],
    );

    // Initial load (counts + first page) – runs once 
    useEffect(() => {
        const roles = Object.keys(USER_ROLE) as RoleType[];
        // Fire all requests in parallel
        roles.forEach((role) => {
            getUsers(role, 10, '');
        });
    }, [getUsers]);

    // Debounced search
    useEffect(() => {
        const timers: Partial<Record<RoleType, ReturnType<typeof setTimeout>>> = {};

        (Object.keys(searchQueries) as RoleType[]).forEach((roleId) => {
            // Only care about roles that are currently in “specific” mode
            if (targetModes[roleId] !== 'specific') return;

            const query = searchQueries[roleId];
            if (query === lastFetchedSearch.current[roleId]) return; // already fetched

            timers[roleId] = setTimeout(() => {
                getUsers(roleId, 10, query); // always reset to page 1 on new search
            }, 300);
        });

        return () => {
            Object.values(timers).forEach((t) => t && clearTimeout(t));
        };
    }, [searchQueries, targetModes, getUsers]);

    // Handlers
    const toggleRole = (roleId: RoleType) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId],
        );
    };

    const handleTargetMode = (roleId: RoleType, mode: 'all' | 'specific') => {
        setTargetModes((prev) => ({ ...prev, [roleId]: mode }));

        if (mode === 'specific') {
            setExpandedPanels((prev) => ({ ...prev, [roleId]: true }));

            // Only fetch if we have never loaded this role or the search term changed
            const currentSearch = searchQueries[roleId];
            if (
                !usersData[roleId]?.data?.length ||
                currentSearch !== lastFetchedSearch.current[roleId]
            ) {
                getUsers(roleId, 10, currentSearch);
            }
        }
    };

    const toggleUser = (roleId: RoleType, userId: string) => {
        setSelectedUsers((prev) => {
            const newSet = new Set(prev[roleId] || []);
            if (newSet.has(userId)) newSet.delete(userId);
            else newSet.add(userId);
            return { ...prev, [roleId]: newSet };
        });
    };

    const toggleAllUsers = (roleId: RoleType, filteredUserIds: string[]) => {
        setSelectedUsers((prev) => {
            const newSet = new Set(prev[roleId] || []);
            const allSelected = filteredUserIds.every((id) => newSet.has(id));
            if (allSelected) {
                filteredUserIds.forEach((id) => newSet.delete(id));
            } else {
                filteredUserIds.forEach((id) => newSet.add(id));
            }
            return { ...prev, [roleId]: newSet };
        });
    };

    const getColorClasses = (color: string) => {
        const map: Record<
            string,
            { border: string; bg: string; text: string; lightBg: string; ring: string }
        > = {
            blue: {
                border: 'border-blue-500',
                bg: 'bg-blue-500',
                text: 'text-blue-600',
                lightBg: 'bg-blue-50',
                ring: 'ring-blue-500',
            },
            purple: {
                border: 'border-purple-500',
                bg: 'bg-purple-500',
                text: 'text-purple-600',
                lightBg: 'bg-purple-50',
                ring: 'ring-purple-500',
            },
            emerald: {
                border: 'border-emerald-500',
                bg: 'bg-emerald-500',
                text: 'text-emerald-600',
                lightBg: 'bg-emerald-50',
                ring: 'ring-emerald-500',
            },
            amber: {
                border: 'border-amber-500',
                bg: 'bg-amber-500',
                text: 'text-amber-600',
                lightBg: 'bg-amber-50',
                ring: 'ring-amber-500',
            },
            red: {
                border: 'border-red-500',
                bg: 'bg-red-500',
                text: 'text-red-600',
                lightBg: 'bg-red-50',
                ring: 'ring-red-500',
            },
        };
        return map[color] || map.blue;
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {t('target_audience')}
                </h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {selectedRoles.length} {t('selected')}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    const colors = getColorClasses(role.color);
                    return (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={role.id}
                            onClick={() => toggleRole(role.id)}
                            className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${isSelected
                                ? `${colors.border} ${colors.lightBg} shadow-sm ring-1 ${colors.ring}`
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {isSelected && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg}`} />
                            )}
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? colors.bg : 'bg-gray-100'
                                    }`}
                            >
                                <role.icon
                                    className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`}
                                />
                            </div>
                            <div>
                                <p
                                    className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'
                                        }`}
                                >
                                    {t(`${role.label}`)}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {usersData[role.id]?.meta?.total || 0} {t('users')}
                                </p>
                            </div>
                            {isSelected && (
                                <div
                                    className={`absolute top-2 right-2 w-4 h-4 rounded-full ${colors.bg} flex items-center justify-center`}
                                >
                                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Specific User Selection Panels */}
            <AnimatePresence>
                {selectedRoles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-4"
                    >
                        <div className="h-px bg-gray-100 w-full mb-6" />

                        {selectedRoles.map((roleId) => {
                            const roleDef = ROLES.find((r) => r.id === roleId)!;
                            const colors = getColorClasses(roleDef.color);
                            const mode = targetModes[roleId];
                            const roleData = usersData[roleId] || { data: [] };
                            const isExpanded = expandedPanels[roleId];
                            const selectedCount = selectedUsers[roleId]?.size || 0;

                            return (
                                <motion.div
                                    key={roleId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`border rounded-xl overflow-hidden ${mode === 'specific' ? colors.border : 'border-gray-200'
                                        }`}
                                >
                                    {/* Panel Header */}
                                    <div
                                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${mode === 'specific' ? colors.lightBg : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <roleDef.icon className={`w-4 h-4 ${colors.text}`} />
                                            <span className="font-bold text-gray-900 text-sm">
                                                {t(roleDef.label)}
                                            </span>
                                            {mode === 'specific' && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} text-white font-medium ml-2`}
                                                >
                                                    {selectedCount} {t('selected')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                                            <button
                                                onClick={() => handleTargetMode(roleId, 'all')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'all'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {t('all_users')}
                                            </button>
                                            <button
                                                onClick={() => handleTargetMode(roleId, 'specific')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'specific'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {t('select_specific')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Panel Body */}
                                    <AnimatePresence>
                                        {mode === 'specific' && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden bg-white"
                                            >
                                                <div className="p-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="relative flex-1">
                                                            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="text"
                                                                placeholder={`Search ${t(roleDef.label).toLowerCase()}...`}
                                                                value={searchQueries[roleId]}
                                                                onChange={(e) =>
                                                                    setSearchQueries((prev) => ({
                                                                        ...prev,
                                                                        [roleId]: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                toggleAllUsers(
                                                                    roleId,
                                                                    roleData.data?.map((u) => u.userId) || [],
                                                                )
                                                            }
                                                            className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 bg-gray-100 rounded-lg"
                                                        >
                                                            {roleData.data?.length > 0 &&
                                                                roleData.data.every((u) =>
                                                                    selectedUsers[roleId]?.has(u.userId),
                                                                )
                                                                ? t('deselect_all')
                                                                : t('select_all')}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setExpandedPanels((prev) => ({
                                                                    ...prev,
                                                                    [roleId]: !isExpanded,
                                                                }))
                                                            }
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUpIcon className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDownIcon className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isExpanded &&
                                                            (userDataLoading[roleId] ? (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="max-h-60 flex justify-center items-center py-8"
                                                                >
                                                                    <LoaderCircleIcon className="w-6 h-6 text-gray-400 animate-spin" />
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="max-h-60 overflow-y-auto pr-2 space-y-1 custom-scrollbar"
                                                                >
                                                                    {roleData.meta?.total === 0 ||
                                                                        !roleData.data?.length ? (
                                                                        <p className="text-sm text-gray-500 text-center py-4">
                                                                            {t('no_users_found')}
                                                                        </p>
                                                                    ) : (
                                                                        roleData.data.map((user) => {
                                                                            const isUserSelected = selectedUsers[
                                                                                roleId
                                                                            ]?.has(user.userId);
                                                                            return (
                                                                                <div
                                                                                    key={user._id}
                                                                                    onClick={() =>
                                                                                        toggleUser(roleId, user.userId)
                                                                                    }
                                                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isUserSelected
                                                                                        ? colors.lightBg
                                                                                        : 'hover:bg-gray-50'
                                                                                        }`}
                                                                                >
                                                                                    <div
                                                                                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isUserSelected
                                                                                            ? `${colors.bg} border-transparent`
                                                                                            : 'border-gray-300 bg-white'
                                                                                            }`}
                                                                                    >
                                                                                        {isUserSelected && (
                                                                                            <CheckIcon className="w-3 h-3 text-white" />
                                                                                        )}
                                                                                    </div>
                                                                                    <Avatar
                                                                                        name={`${user.name?.firstName ?? ''} ${user.name?.lastName ?? ''}`}
                                                                                        colorClass={`${colors.lightBg} ${colors.text}`}
                                                                                    />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                                            {!user.name?.firstName &&
                                                                                                !user.name?.lastName
                                                                                                ? 'N/A'
                                                                                                : `${user.name?.firstName ?? ''} ${user.name?.lastName ?? ''}`}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 truncate">
                                                                                            {roleId === 'CUSTOMER'
                                                                                                ? user.contactNumber ||
                                                                                                user.email ||
                                                                                                '-'
                                                                                                : user.email ||
                                                                                                user.contactNumber ||
                                                                                                '-'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}

                                                                    {(roleData.meta?.limit || 10) <
                                                                        (roleData.meta?.total || 0) && (
                                                                            <div className="text-center mt-2">
                                                                                <Button
                                                                                    onClick={() =>
                                                                                        getUsers(
                                                                                            roleId,
                                                                                            (roleData.meta?.limit || 10) + 10,
                                                                                            searchQueries[roleId],
                                                                                        )
                                                                                    }
                                                                                    size="sm"
                                                                                    disabled={userDataLoading[roleId]}
                                                                                    className={`text-xs cursor-pointer hover:opacity-90 ${colors.bg} hover:${colors.bg} transition-colors`}
                                                                                >
                                                                                    {userDataLoading[roleId] ? (
                                                                                        <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                                                                                    ) : (
                                                                                        t('show_more')
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                </motion.div>
                                                            ))}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}