import FleetManagerReport from "@/components/Dashboard/Reports/FleetManagerReport/FleetManagersReport";
import { getFleetManagerReportAnalytics } from "@/services/dashboard/reports/reports.service";

export default async function FleetManagerReportPage() {
  const fleetManagerReportAnalytics = await getFleetManagerReportAnalytics();

  return (
    <FleetManagerReport fleetReportAnalytics={fleetManagerReportAnalytics} />
  );
}
