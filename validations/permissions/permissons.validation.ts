import z from "zod";

const VALID_PERMISSION_ACTIONS = [
    'CAN_VIEW_DASHBOARD',
    'CAN_MANAGE_ADMINS',
    'CAN_MANAGE_VENDORS',
    'CAN_MANAGE_PARTNERS',
    'CAN_MANAGE_FLEET',
    'CAN_MANAGE_CUSTOMERS',
    'CAN_MANAGE_ORDERS',
    'CAN_MANAGE_PERMISSIONS',
    'CAN_MANAGE_COUPONS',
    'CAN_VIEW_ANALYTICS',
    'CAN_MANAGE_SYSTEM_SETTINGS',
    'CAN_MANAGE_AGREEMENTS',
] as const;

export const permissionActions = [
    {
        label: "Dashboard",
        value: "CAN_VIEW_DASHBOARD"
    },
    {
        label: "Manage Admins",
        value: "CAN_MANAGE_ADMINS"
    },
    {
        label: "Manage Vendors",
        value: "CAN_MANAGE_VENDORS"
    },
    {
        label: "Manage Partners",
        value: "CAN_MANAGE_PARTNERS"
    },
    {
        label: "Manage Fleet",
        value: "CAN_MANAGE_FLEET"
    },
    {
        label: "Manage Customers",
        value: "CAN_MANAGE_CUSTOMERS"
    },
    {
        label: "Manage Orders",
        value: "CAN_MANAGE_ORDERS"
    },
    {
        label: "Manage Permissions",
        value: "CAN_MANAGE_PERMISSIONS"
    },
    {
        label: "Manage Coupons",
        value: "CAN_MANAGE_COUPONS"
    },
    {
        label: "View Analytics",
        value: "CAN_VIEW_ANALYTICS"
    },
    {
        label: "Manage System Settings",
        value: "CAN_MANAGE_SYSTEM_SETTINGS"
    },
    {
        label: "Manage Agreements",
        value: "CAN_MANAGE_AGREEMENTS"
    }
];

export const MODULE_GROUPS = [
    "Dashboard",
    "User Management",
    "Vendor Management",
    "Fleet Management",
    "Order Management",
    "Marketing",
    "Analytics",
    "System Settings",
] as const;

export const permissionValidation = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    action: z.enum(VALID_PERMISSION_ACTIONS, {
        message: "Please select a valid system action code.",
    }),
    module: z.enum(MODULE_GROUPS, {
        message: "Please select a valid dashboard module group.",
    }),
    displayName: z.string().optional(),
    description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
    isSystemDefined: z.boolean().default(false),
    isActive: z.boolean().default(true),
});