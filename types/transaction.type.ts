export type TTransaction = {
  _id: string;
  transactionId: string;

  type: string;
  description: string;

  amount?: string;
  positive: boolean;

  status?: string;

  orderId?: string;
  orderTotal?: string;
  platformFee?: string;
  netEarning?: string;
  customer?: string;
  customerOrders?: number;

  paymentMethod?: string;
  deliveryAddress?: string;

  items?: {
    name: string;
    qty: number;
    price: string;
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
