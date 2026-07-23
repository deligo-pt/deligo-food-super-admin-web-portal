import ActivityLogs from "@/components/Dashboard/ActivityLogs/ActivityLogs";
import { getAllActivityLogs } from "@/services/dashboard/activity-logs/activity-logs.service";
import { ActivityLogResponse } from "@/types/activity-logs.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ActivityLogsPage = async ({ searchParams }: IProps) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const logsData = await getAllActivityLogs(queryString);

  return (
    <div>
      <ActivityLogs logsData={logsData as unknown as ActivityLogResponse} />
    </div>
  );
};

export default ActivityLogsPage;