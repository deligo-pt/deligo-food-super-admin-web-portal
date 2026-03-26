import FleetManagerWallets from "@/components/Dashboard/Wallets/FleetManagerWallets/FleetManagerWallets";
import { getAllWalletsReq } from "@/services/dashboard/wallet/wallet.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetManagerWalletsPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const walletsResult = await getAllWalletsReq({
    ...queries,
    userModel: "FleetManager",
  });

  return <FleetManagerWallets walletsResult={walletsResult} />;
}
