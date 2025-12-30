import SupportTickets from "@/components/SupportTickets/SupportTickets";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TConversation, TMessage } from "@/types/chat.type";
import { TVendor } from "@/types/user.type";

export default async function SupportTicketsPage() {
  let conversationData = {} as TConversation;
  const messagesData = {} as { data: TMessage[]; meta?: TMeta };

  try {
    const profileResult = (await serverRequest.get(
      "/profile"
    )) as TResponse<TVendor>;

    const conversationResult = (await serverRequest.get(
      "/support/conversations"
      // {
      //   data: {
      //     type: "SUPPORT",
      //     targetUser: {
      //       userId: profileResult?.data?.userId,
      //       role: profileResult?.data?.role,
      //       name: `${profileResult?.data?.name?.firstName} ${profileResult?.data?.name?.lastName}`,
      //     },
      //   },
      // }
    )) as TResponse<TConversation>;

    conversationData = conversationResult.data;

    console.log(conversationResult);

    // const messagesResult = (await serverRequest.get(
    //   `/support/conversations/${conversationResult?.data?.room}/messages`,
    //   { params: { page: 1, limit: 50, sortBy: "createdAt" } }
    // )) as TResponse<TMessage[]>;

    // messagesData = messagesResult;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data, error.message);
  }

  return (
    <SupportTickets
    // initialConversation={conversationData}
    // initialMessagesData={messagesData}
    />
  );
}
