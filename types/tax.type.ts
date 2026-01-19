export type TTax = {
  _id: string;
  taxName: string;
  taxCode: "NOR" | "INT" | "RED" | "ISE";
  taxRate: 6 | 13 | 23 | 0;
  countryID: string;
  TaxRegionID?: string;
  taxGroupID: string;
  description: string;
  taxExemptionCode?: string;
  taxExemptionReason?: string;
  isActive: boolean;
  isDeleted: boolean;
};
