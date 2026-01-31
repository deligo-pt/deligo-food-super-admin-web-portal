"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TSponsorship } from "@/types/sponsorship.type";
import { catchAsync } from "@/utils/catchAsync";

export const addSponsorshipReq = async (
  data: Partial<TSponsorship>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.post("/sponsorships/create-sponsorship", {
      data: formData,
    });
  });
};

export const updateSponsorshipReq = async (
  id: string,
  data: Partial<TSponsorship>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.patch(`/sponsorships/update-sponsorship/${id}`, {
      data: formData,
    });
  });
};

export const deleteSponsorshipReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/sponsorships/soft-delete/${id}`);
  });
};
