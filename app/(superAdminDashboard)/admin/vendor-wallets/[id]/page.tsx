import WalletDetails from "@/components/Dashboard/Wallets/WalletDetails/WalletDetails";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";
import { getAllTransactionsReq } from "@/services/dashboard/transaction/transaction.service";
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

  const transactionQuery = {
    vendorId: wallet?.userId?._id,
    type: "VENDOR_EARNING"
  };
  const transactionsResult = await getAllTransactionsReq(transactionQuery);

  return <WalletDetails wallet={wallet} payoutsData={payoutsData} transactionsResult={transactionsResult} />;
}
