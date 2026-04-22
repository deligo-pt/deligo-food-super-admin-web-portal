import FleetManagerReport from "@/components/Dashboard/Reports/FleetManagerReport/FleetManagersReport";
import { getFleetManagerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetManagerReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const fleetManagerReportAnalytics = await getFleetManagerReportAnalytics({
    timeframe: "last7days",
    ...queries,
  });

  return (
    <FleetManagerReport fleetReportAnalytics={fleetManagerReportAnalytics} />
  );
}
