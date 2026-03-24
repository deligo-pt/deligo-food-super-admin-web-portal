import { TResponse } from "@/types";
import { catchAsync } from "@/utils/catchAsync";
import { updateData } from "@/utils/requests";

export const uploadUserDocumentsReq = async (
  endPoint: string,
  key: string,
  file: Blob,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("data", JSON.stringify({ docImageTitle: key }));

  return catchAsync<null>(async () => {
    return (await updateData(endPoint, {
      data: formData,
    })) as unknown as TResponse<null>;
  });
};
