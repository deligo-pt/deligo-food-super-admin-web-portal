export type TTax = {
  _id: string;
  taxName: {
    en: string;
    pt: string;
  };
  taxCode: "NOR" | "INT" | "RED" | "ISE";
  taxRate: 6 | 13 | 23 | 0;
  countryID: string;
  TaxRegionID?: string;
  taxGroupID: string;
  description: {
    en: string;
    pt: string;
  };
  taxExemptionCode?: string;
  taxExemptionReason?: {
    en: string;
    pt: string;
  };
  isActive: boolean;
  isDeleted: boolean;
};
