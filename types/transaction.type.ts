export type TTransaction = {
  _id: string;
  transactionId: string;

  type: string;
  description: string;

  amount?: number;
  positive: boolean;

  status?: string;

  orderId?: string;
  orderGrandTotal?: string;
  platformFee?: string;
  vendorNetEarning?: string;
  riderNetEarnings?: string;
  fleetEarnings?: string;
  customer?: {
    name: {
      firstName: string;
      lastName: string;
    };
    contactNumber?: string;
  };
  customerOrders?: number;

  paymentMethod?: string;
  deliveryAddress?: string;

  items?: {
    name: {
      en: string;
      pt: string;
    };
    qty: number;
    price: number;
  }[];

  relatedTransactions?: {
    id: string;
    desc: string;
    amount: string;
    date: string;
    positive: boolean;
  }[];

  createdAt: string;
  updatedAt: string;
};
