import FleetManagerReport from "@/components/Dashboard/Reports/FleetManagerReport/FleetManagersReport";
import { getAllFleetManagersReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";
import { getFleetManagerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetManagerReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const fleetManagerReportAnalytics = await getFleetManagerReportAnalytics();
  const fleetManagersData = await getAllFleetManagersReq(queries);

  return (
    <FleetManagerReport
      fleetManagersData={fleetManagersData}
      fleetReportAnalytics={fleetManagerReportAnalytics}
    />
  );
}
