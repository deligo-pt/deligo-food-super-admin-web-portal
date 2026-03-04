import WalletDetails from "@/components/Dashboard/Wallets/WalletDetails/WalletDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TWalletDetails } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";

export default async function VendorWalletDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TWalletDetails = {} as TWalletDetails;

  try {
    const result = await catchAsync<TWalletDetails>(async () => {
      return await serverRequest.get(`/wallets/${id}`);
    });

    if (result?.success) {
      initialData = result.data || {};
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <WalletDetails wallet={initialData} />;
}
