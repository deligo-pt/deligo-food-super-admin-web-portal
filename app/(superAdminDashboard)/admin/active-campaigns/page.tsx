import ActiveCampaigns from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaigns";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ActiveCampaignsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const offersResult = await getAllOffersReq({
    ...queries,
    activeStatus: "ACTIVE",
    validStatus: "VALID",
  });

  return (
    <ActiveCampaigns
      offersResult={offersResult}
      title="Active Campaigns"
      subtitle="List of all active offers"
    />
  );
}
