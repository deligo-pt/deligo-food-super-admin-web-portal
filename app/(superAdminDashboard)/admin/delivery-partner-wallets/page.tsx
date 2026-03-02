import DeliveryPartnerWallets from "@/components/Dashboard/Wallets/DeliveryPartnerWallets/DeliveryPartnerWallets";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TDeliveryPartnerWallet } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerWalletsPage({
  searchParams,
}: IProps) {
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
    userModel: "DeliveryPartner",
  };

  const initialData: { data: TDeliveryPartnerWallet[]; meta?: TMeta } = {
    data: [],
  };

  const result = await catchAsync<TDeliveryPartnerWallet[]>(async () => {
    return await serverRequest.get("/wallets", {
      params: query,
    });
  });

  if (result?.success) {
    initialData.data = result.data;
    initialData.meta = result.meta;
  }

  return <DeliveryPartnerWallets walletsResult={initialData} />;
}
