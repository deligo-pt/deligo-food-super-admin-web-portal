import CustomerWallets from "@/components/Dashboard/Wallets/CustomerWallets/CustomerWallets";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TCustomerWallet } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerWalletsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    userModel: "Customer",
  };

  const initialData: { data: TCustomerWallet[]; meta?: TMeta } = {
    data: [],
  };

  const result = await catchAsync<TCustomerWallet[]>(async () => {
    return await serverRequest.get("/wallets", {
      params: query,
    });
  });

  if (result?.success) {
    initialData.data = result.data;
    initialData.meta = result.meta;
  }

  return <CustomerWallets walletsResult={initialData} />;
}
