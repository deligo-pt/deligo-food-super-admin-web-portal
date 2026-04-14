import CustomerSpends from "@/components/Dashboard/CustomerSpends/CustomerSpends";
import { getAllTransactionsReq } from "@/services/dashboard/transaction/transaction.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerSpendsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const customerSpendsResult = await getAllTransactionsReq({
    ...queries,
    type: "ORDER_PAYMENT",
    status: "SUCCESS",
  });

  return <CustomerSpends customerSpendsResult={customerSpendsResult} />;
}
