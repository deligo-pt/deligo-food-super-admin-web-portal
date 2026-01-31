export type TSponsorship = {
  _id: string;
  sponsorName: string;
  sponsorType: "Ads" | "Offer" | "Other";
  bannerImage: string;

  isActive: boolean;
  startDate: Date;
  endDate: Date;

  createdAt: Date;
  updatedAt: Date;
};
