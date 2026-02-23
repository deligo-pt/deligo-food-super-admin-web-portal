

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