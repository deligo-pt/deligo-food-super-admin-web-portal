import WalletDetails from "@/components/Dashboard/Wallets/WalletDetails/WalletDetails";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";
import { getSingleWalletReq } from "@/services/dashboard/wallet/wallet.service";

export default async function VendorWalletDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const queries = (await searchParams) || {};

  const wallet = await getSingleWalletReq(id);
  const payoutsData = await getAllPayoutsReq({
    ...queries,
    userId: wallet.userId?._id,
  });

  return <WalletDetails wallet={wallet} payoutsData={payoutsData} />;
}
