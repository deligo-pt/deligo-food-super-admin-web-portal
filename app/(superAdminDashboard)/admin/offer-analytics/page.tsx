import OfferAnalytics from "@/components/Dashboard/Offers/OfferAnalytics/OfferAnalytics.tsx";
import { TOfferAnalytics } from "@/types/offer.type";

const stats = {
  totalOffers: 8,
  activeOffers: 6,
  totalRedemptions: 1200,
  revenueImpact: 500,
};

const usageOverTime = [
  {
    time: "Jan",
    redemptions: 400,
  },
  {
    time: "Feb",
    redemptions: 600,
  },
  {
    time: "Mar",
    redemptions: 550,
  },
  {
    time: "Apr",
    redemptions: 800,
  },
  {
    time: "May",
    redemptions: 1200,
  },
  {
    time: "Jun",
    redemptions: 1500,
  },
];

const offerTypeUsage = [
  {
    name: "PERCENT",
    usage: 45,
  },
  {
    name: "FLAT",
    usage: 25,
  },
  {
    name: "FREE_DELIVERY",
    usage: 20,
  },
  {
    name: "BOGO",
    usage: 10,
  },
];

const topOffers = [
  {
    name: "WELCOME20",
    usage: 450,
  },
  {
    name: "Free Delivery",
    usage: 320,
  },
  {
    name: "LUNCH5",
    usage: 185,
  },
  {
    name: "BOGO Pizza",
    usage: 100,
  },
  {
    name: "FLASH50",
    usage: 50,
  },
];

const analyticsData = {
  stats,
  usageOverTime,
  offerTypeUsage,
  topOffers,
} as TOfferAnalytics;

export default function OfferAnalyticsPage() {
  return <OfferAnalytics analyticsData={analyticsData} />;
}
