export type TVendorPayout = {
  _id: string;
  // vendor: TVendor;
  vendor: {
    userId: string;
    profilePhoto?: string;
    businessDetails: {
      businessName: string;
      city: string;
    };
  };
  amount: number;
  payoutMethod: string;
  status: string;
  accountHolder?: string;
  iban?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TFleetManagerPayout = {
  _id: string;
  fleetManager: {
    userId: string;
    profilePhoto?: string;
    businessDetails: {
      businessName: string;
      city: string;
    };
  };
  amount: number;
  payoutMethod: string;
  status: string;
  accountHolder?: string;
  iban?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TDeliveryPartnerPayout = {
  _id: string;
  deliveryPartner: {
    userId: string;
    profilePhoto?: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  amount: number;
  payoutMethod: string;
  status: string;
  accountHolder?: string;
  iban?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};
