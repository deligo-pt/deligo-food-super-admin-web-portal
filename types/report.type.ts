
export interface ISalesReportAnalytics {
    summary: {
        totalRevenue: string,
        completedOrders: number,
        cancelledOrders: number,
        avgOrderValue: string
    },
    revenueCards: {
        thisWeek: string,
        thisMonth: string,
        topEarningDay: string;
    },
    charts: {
        revenueTrend: {
            date: string;
            revenue: number;
        }[],
        earningsByDay: {
            date: string;
            revenue: number;
        }[];
    }
};

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

export interface IFleetManagerReportAnalytics {
    cards: {
        totalFleetManagers: number;
        approvedFleetManagers: number;
        submittedFleetManagers: number;
        blockedOrRejectedFleetManagers: number;
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
    },
}

export interface IDeliveryPartnerReportAnalytics {
    cards: {
        activePartners: number;
        totalDeliveries: number;
        totalPartners: number;
        totalEarnings: number | string;
    },
    partnerGrowth: {
        label: string;
        value: number;
    }[],
    vehicleTypes: {
        bicycle: number;
        motorbike: number;
        car: number;
        eBike: number;
        scooter: number;
    }
}