import TransactionDetails from "@/components/Dashboard/Transactions/TransactionDetails";
import { getSingleTransactionReq } from "@/services/dashboard/transaction/transaction.service";
import { TTransaction } from "@/types/transaction.type";

export default async function CustomerSpendDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction: TTransaction = await getSingleTransactionReq(id);

  return <TransactionDetails transaction={transaction} />;
}
