import DeliveryPartnerWallets from "@/components/Dashboard/Wallets/DeliveryPartnerWallets/DeliveryPartnerWallets";
import { getAllWalletsReq } from "@/services/dashboard/wallet/wallet.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerWalletsPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const walletsResult = await getAllWalletsReq({
    ...queries,
    userModel: "DeliveryPartner",
  });

  return <DeliveryPartnerWallets walletsResult={walletsResult} />;
}
