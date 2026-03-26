import CustomerWallets from "@/components/Dashboard/Wallets/CustomerWallets/CustomerWallets";
import { getAllWalletsReq } from "@/services/dashboard/wallet/wallet.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerWalletsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const walletsResult = await getAllWalletsReq({
    ...queries,
    userModel: "Customer",
  });

  return <CustomerWallets walletsResult={walletsResult} />;
}
