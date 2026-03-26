import OfferDetails from "@/components/Dashboard/Offers/ActiveCampaigns/OfferDetails";
import { getSingleOfferReq } from "@/services/dashboard/offer/offer.service";
import { TOffer } from "@/types/offer.type";

export default async function OfferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer: TOffer = await getSingleOfferReq(id);

  return <OfferDetails offer={offer} />;
}
