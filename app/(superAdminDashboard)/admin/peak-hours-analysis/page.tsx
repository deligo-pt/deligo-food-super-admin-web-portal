import PeakHourAnalysis from "@/components/Dashboard/Analytics/PeakHourAnalysis/PeakHourAnalysis";
import { getPeakHourAnalysisReq } from "@/services/dashboard/analytics/analytics.service";
import { TPeakHourData } from "@/types/analytics.type";

export default async function PeakHourAnalysisPage() {
  const analyticsData: TPeakHourData = await getPeakHourAnalysisReq();

  return <PeakHourAnalysis analyticsData={analyticsData} />;
}
