export type TTransaction = {
  _id: string;
  transactionId: string;
  type:
  | 'ORDER_PAYMENT'
  | 'VENDOR_EARNING'
  | 'FLEET_EARNING'
  | 'DELIVERY_PARTNER_EARNING'
  | 'VENDOR_SETTLEMENT'
  | 'FLEET_SETTLEMENT'
  | 'DELIVERY_PARTNER_SETTLEMENT'
  | 'PLATFORM_COMMISSION'
  | 'INGREDIENT_PURCHASE'
  | 'REFERRAL_BONUS'
  | 'PLATFORM_TAX_COLLECTION'
  | 'PLATFORM_SERVICE_CHARGE';

  description: string;

  amount?: number;
  positive: boolean;

  status?: 'PENDING' | 'SUCCESS' | 'FAILED';

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

  paymentMethod?:
  | 'CARD'
  | 'MB_WAY'
  | 'PAYPAL'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'WALLET'
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'OTHER';
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
