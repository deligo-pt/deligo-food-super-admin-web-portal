import OfferAnalytics from "@/components/Dashboard/Offers/OfferAnalytics/OfferAnalytics.tsx";
import { getOfferAnalyticsReq } from "@/services/dashboard/offer/offer.service";
import { TOfferAnalytics } from "@/types/offer.type";

export default async function OfferAnalyticsPage() {
  const analyticsData: TOfferAnalytics = await getOfferAnalyticsReq();

  return <OfferAnalytics analyticsData={analyticsData} />;
}
