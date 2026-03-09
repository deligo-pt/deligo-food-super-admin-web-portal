export type TMonthlyCommission = {
  month: string;
  commission: number;
};

export type TCommission = {
  _id: string;
  customer: {
    name: {
      firstName: string;
      lastName: string;
    };
  };
  transactionId: string;
  orderId: string;
  amount: number;
  platformFee: number;
  createdAt: string;
};

export type TPlaformEarningsData = {
  stats: {
    totalRevenue: number;
    totalPlatformCommission: number;
    thisWeekCommission: number;
    thisMonthCommission: number;
  };
  monthlyCommissions: TMonthlyCommission[];
  commissions: TCommission[];
};
