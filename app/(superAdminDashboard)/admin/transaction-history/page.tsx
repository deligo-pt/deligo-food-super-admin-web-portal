import Transactions from "@/components/Dashboard/Transactions/Transactions";
import { getAllTransactionsReq } from "@/services/dashboard/transaction/transaction.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function TransactionsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const transactionsResult = await getAllTransactionsReq(queries);

  return <Transactions transactionsResult={transactionsResult} />;
}
