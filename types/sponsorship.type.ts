export type TSponsorship = {
  _id: string;
  sponsorName: string;
  sponsorType: "Ads" | "Offer" | "Other";
  bannerImage: string;
  url?: string;
  targetZoneIds?: {
    _id: string;
    district: string;
    zoneId: string;
    zoneName: string;
  }[];

  isActive: boolean;
  startDate: Date;
  endDate: Date;

  createdAt: Date;
  updatedAt: Date;
};
