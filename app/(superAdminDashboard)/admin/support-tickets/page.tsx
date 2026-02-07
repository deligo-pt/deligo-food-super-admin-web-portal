import SupportTickets from "@/components/SupportTickets/SupportTickets";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TConversation } from "@/types/chat.type";

export default async function SupportTicketsPage() {
  const initialData: { data: TConversation[]; meta?: TMeta } = { data: [] };

  try {
    const conversationsResult = (await serverRequest.get(
      "/support/conversations",
      { params: { type: "SUPPORT" } },
    )) as TResponse<TConversation[]>;

    initialData.data = conversationsResult.data;
    initialData.meta = conversationsResult.meta;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data, error.message);
  }

  return <SupportTickets conversationsData={initialData} />;
}
