import OfferDetails from "@/components/Dashboard/Offers/ActiveCampaigns/OfferDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";

export default async function OfferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let offerData: TOffer = {} as TOffer;

  try {
    const result = (await serverRequest.get(
      `/offers/${id}`,
    )) as TResponse<TOffer>;

    if (result?.success) {
      offerData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <OfferDetails offer={offerData} />;
}
