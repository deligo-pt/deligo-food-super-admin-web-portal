import SupportTickets from "@/components/SupportTickets/SupportTickets";
import { getAllTicketsReq } from "@/services/dashboard/support/support.service";

interface IProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SupportTicketsPage({ searchParams }: IProps) {
  const queries = await searchParams;
  const ticketData = await getAllTicketsReq(queries);

  return <SupportTickets ticketData={ticketData} />;
}
