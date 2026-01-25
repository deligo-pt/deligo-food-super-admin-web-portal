import { SOS } from "@/components/Dashboard/SOS/SOS";
import { getAllSOSReq } from "@/services/dashboard/SOS/SOS";
import { TMeta } from "@/types";
import { TSOS } from "@/types/sos.type";
import { cookies } from "next/headers";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SOSPage({ searchParams }: IProps) {
  const accessToken = (await cookies()).get("accessToken")?.value || "";

  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const initialData: { data: TSOS[]; meta?: TMeta } = { data: [] };

  const result = await getAllSOSReq(query);

  if (result?.success) {
    initialData.data = result.data.result;
    initialData.meta = result.data.meta;
  } else {
    console.log("Server fetch error:", result);
  }

  // console.log(initialData);

  return <SOS accessToken={accessToken} />;
}
