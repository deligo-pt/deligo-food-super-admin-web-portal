export type TBusinessCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TProductCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  businessCategoryId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TBusinessCategoryQueryParams = {
  limit?: number;
  page?: number;
  searchTerm?: string;
  sortBy?: string;
  status?: string;
};

export type TProductCategoryQueryParams = {
  limit?: number;
  page?: number;
  searchTerm?: string;
  sortBy?: string;
  status?: string;
};
