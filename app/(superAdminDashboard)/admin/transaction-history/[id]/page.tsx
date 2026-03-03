import TransactionDetails from "@/components/Dashboard/Transactions/TransactionDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TTransaction } from "@/types/transaction.type";
import { catchAsync } from "@/utils/catchAsync";

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TTransaction = {} as TTransaction;

  try {
    const result = await catchAsync<TTransaction>(async () => {
      return await serverRequest.get(`/transactions/${id}`);
    });

    if (result?.success) {
      initialData = result.data || {};
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <TransactionDetails transaction={initialData} />;
}
