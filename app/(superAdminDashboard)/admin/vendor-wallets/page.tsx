import VendorWallets from "@/components/Dashboard/Wallets/VendorWallets/VendorWallets";
import { getAllWalletsReq } from "@/services/dashboard/wallet/wallet.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorWalletsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const walletsResult = await getAllWalletsReq({
    ...queries,
    userModel: "Vendor",
  });

  return <VendorWallets walletsResult={walletsResult} />;
}
