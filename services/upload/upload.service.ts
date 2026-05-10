import { TResponse } from "@/types";
import { catchAsync } from "@/utils/catchAsync";
import { postData } from "@/utils/requests";

export const uploadImagesReq = async (images: File[]) => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("files", image);
  });

  return catchAsync<string[]>(async () => {
    return (await postData("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as unknown as TResponse<string[]>;
  });
};
