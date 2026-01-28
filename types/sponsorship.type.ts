export type TSponsorship = {
  _id: string;
  name: string;
  banner: string;

  isActive: boolean;
  type: "ADS" | "OFFER" | "";
  startDate: Date;
  endDate: Date;

  createdAt: Date;
  updatedAt: Date;
};

export type TSponsorshipOffer = {
  _id: string;
  title: string;
  description: string;
  price: number;
  benefits: string[];
  deadline: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
};
