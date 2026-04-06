import PeakHourAnalysis from "@/components/Dashboard/Analytics/PeakHourAnalysis/PeakHourAnalysis";
import { getPeakHourAnalysisReq } from "@/services/dashboard/analytics/analytics.service";
import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";

export default async function PeakHourAnalysisPage() {
  const analyticsData: TPeakHoursAnalysis = await getPeakHourAnalysisReq();

  return <PeakHourAnalysis peakHourAnalysis={analyticsData} />;
}
