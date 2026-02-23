

export interface ICustomerReportAnalytics {
    cards: {
        totalCustomers: number;
        activeCustomers: number;
        totalOrders: number;
        totalRevenue: number;
    },
    customerGrowth: {
        label: string;
        value: number;
    }[],
    statusDistribution: {
        approved: number;
        blocked: number;
        pending: number;
    },
}

export interface IVendorReportAnalytics {
    cards: {
        totalVendors: number;
        approvedVendors: number;
        submittedVendors: number;
        blockedOrRejectedVendors: number;
    },
    monthlySignups: {
        label: string;
        value: number;
    }[],
    statusDistribution: {
        approved: number;
        blocked: number;
        pending: number;
        rejected: number;
        submitted: number;
    },
}