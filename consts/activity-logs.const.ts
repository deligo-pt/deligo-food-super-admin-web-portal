import { ActivityEntityType } from "@/types/activity-logs.type";

// 1. Explicit Dictionary for Action Labels
export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
    USER_REGISTERED: 'Account registered',
    USER_ONBOARDED: 'Account onboarded',
    USER_APPROVAL_SUBMITTED: 'Submitted for approval',
    USER_APPROVED: 'Account approved',
    USER_REJECTED: 'Account rejected',
    USER_BLOCKED: 'Account blocked',
    USER_SOFT_DELETED: 'Account deleted (soft)',
    USER_PERMANENTLY_DELETED: 'Account permanently deleted',
    PAYOUT_INITIATED: 'Payout initiated',
    PAYOUT_FINALIZED: 'Payout finalized',
    ORDER_CANCELED: 'Order cancelled',
    ORDER_REJECTED: 'Order rejected',
    ORDER_REASSIGNMENT_NEEDED: 'Order reassignment needed',
    PASSWORD_CHANGED: "Password changed",
    PASSWORD_RESET: "Password reset",
    AGREEMENT_INITIATED: "Agrement initiated",
    AGREEMENT_SIGNED: "Agrement signed",
    BUSINESS_CATEGORY_PERMANENTLY_DELETED: "Business category permanently deleted",
    CUISINE_CATEGORY_PERMANENTLY_DELETED: "Cuisine category permanently deleted",
    PRODUCT_CATEGORY_PERMANENTLY_DELETED: "Product category permanently deleted",
    DELIVERY_PARTNER_ASSIGNED_TO_FLEET_MANAGER: "Delivery partner assigned to fleet Manager",
    FLEET_MANAGER_DOCUMENT_DELETED: "Fleet Manager document deleted",
    GLOBAL_SETTINGS_UPDATED: "Global settings triggered",
    INGREDIENT_PERMANENTLY_DELETED: "Ingredient permanently deleted",
    NOTIFICATION_BROADCAST_SENT: "Broadcast notification sent",
    OFFER_PERMANENTLY_DELETED: "Offer permanently deleted",
    PAYMENT_REFUNDED: "Payment refunded",
    PAYMENT_TOKEN_CREATED: "Payment token created",
    PAYMENT_TOKEN_REMOVED: "Payment token removed",
    PERMISSION_CREATED: "Permission created",
    PERMISSION_UPDATED: "Permission updated",
    PERMISSION_DELETED: "Permission deleted",
    PERMISSION_ASSIGNED: "Permission assigned",
    PERMISSION_REVOKED: "Permission revoked",
    PRODUCT_APPROVED: "Product approved",
    PRODUCT_REJECTED: "Product rejected",
    PRODUCT_PERMANENTLY_DELETED: "Product permanently deleted",
    ACCOUNT_CONTACT_UPDATED: "Account contact updated",
    RESTRICTED_ITEM_CREATED: "Restricted item created",
    RESTRICTED_ITEM_UPDATED: "Restricted item updated",
    RESTRICTED_ITEM_SOFT_DELETED: "Restricted item soft deleted",
    RESTRICTED_ITEM_PERMANENTLY_DELETED: "Restricted item permanently deleted",
    SOS_STATUS_CHANGED: "Sos status changed",
    SPONSORSHIP_PERMANENTLY_DELETED: "Sponsorship permanently deleted",
    SUPPORT_TICKET_CLOSED: "Support ticket closed",
    TAX_CREATED: "Tax created",
    TAX_UPDATED: "Tax updated",
    TAX_SOFT_DELETED: "Tax soft deleted",
    TAX_PERMANENTLY_DELETED: "Tax permanently deleted",
    VENDOR_DOCUMENT_DELETED: "Vendor document deleted",
    ZONE_CREATED: "Zone created",
    ZONE_UPDATED: "Zone updated",
    ZONE_TOGGLED: "Zone toggled",
    ZONE_SOFT_DELETED: "Zone soft deleted",
    ZONE_PERMANENTLY_DELETED: "Zone permanently deleted",
    ADMIN_UPDATED: "Admin profile updated",
    ADDON_GROUP_DELETED: "Addon group deleted"
};


export type ActivityEntityTypeKey = keyof typeof ActivityEntityType;
export type ActivityActionTypeKey = keyof typeof ACTIVITY_ACTION_LABELS;

// 3. Human-Readable Dictionary for Entity Types
export const ACTIVITY_ENTITY_LABELS: Record<string, string> = {
    VENDOR: 'Vendor',
    SUB_VENDOR: 'Sub-Vendor',
    DELIVERY_PARTNER: 'Delivery Partner',
    FLEET_MANAGER: 'Fleet Manager',
    ADMIN: 'Admin',
    CUSTOMER: 'Customer',
    AUTH_USER: 'Auth User',
    PRODUCT: 'Product',
    PRODUCT_CATEGORY: 'Product Category',
    BUSINESS_CATEGORY: 'Business Category',
    CUISINE_CATEGORY: 'Cuisine Category',
    OFFER: 'Offer',
    INGREDIENT: 'Ingredient',
    SPONSORSHIP: 'Sponsorship',
    ORDER: 'Order',
    PAYOUT: 'Payout',
    PAYMENT_TOKEN: 'Payment Token',
    PERMISSION: 'Permission',
    TAX: 'Tax',
    ZONE: 'Zone',
    GLOBAL_SETTING: 'Global Setting',
    RESTRICTED_ITEM: 'Restricted Item',
    AGREEMENT: 'Agreement',
    SOS: 'SOS',
    NOTIFICATION: 'Notification',
    SUPPORT_TICKET: 'Support Ticket',
    ADDON_GROUP: 'Addon Group',
};

// 4. Helper function for Action Labels with Title Case fallback
export function getActivityActionLabel(action: string): string {
    if (ACTIVITY_ACTION_LABELS[action]) {
        return ACTIVITY_ACTION_LABELS[action];
    }
    return action
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// 5. Helper function for Entity Labels with Title Case fallback
export function getActivityEntityLabel(entityType: string): string {
    if (ACTIVITY_ENTITY_LABELS[entityType]) {
        return ACTIVITY_ENTITY_LABELS[entityType];
    }
    return entityType
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}