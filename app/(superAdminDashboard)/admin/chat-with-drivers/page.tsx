import ChatWithDrivers from "@/components/Dashboard/Chat/ChatWithDrivers/ChatWithDrivers";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TConversation } from "@/types/chat.type";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ChatWithCustomersPage({ searchParams }: IProps) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const decoded = jwtDecode(accessToken as string) as { userId: string };

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
    role: "DELIVERY_PARTNER",
    type: "DRIVER_CHAT",
  };

  const conversationsData: { data: TConversation[]; meta?: TMeta } = {
    data: [],
  };

  try {
    const result = (await serverRequest.get("/support/conversations", {
      params: query,
    })) as TResponse<TConversation[]>;

    if (result?.success) {
      conversationsData.data = result.data;
      conversationsData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <ChatWithDrivers
      conversationsData={conversationsData}
      accessToken={accessToken as string}
      decoded={decoded}
    />
  );
}
