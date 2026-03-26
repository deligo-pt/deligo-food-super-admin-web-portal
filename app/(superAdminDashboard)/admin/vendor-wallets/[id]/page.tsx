import WalletDetails from "@/components/Dashboard/Wallets/WalletDetails/WalletDetails";
import { getSingleWalletReq } from "@/services/dashboard/wallet/wallet.service";

export default async function VendorWalletDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wallet = await getSingleWalletReq(id);

  return <WalletDetails wallet={wallet} />;
}
