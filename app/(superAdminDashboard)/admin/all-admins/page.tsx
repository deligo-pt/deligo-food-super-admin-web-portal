import Admins from "@/components/Dashboard/Admins/Admins";
import { getAllAdminsReq } from "@/services/dashboard/admin/admin.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllAdminsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const adminsResult = await getAllAdminsReq(queries);

  return (
    <Admins
      adminsResult={adminsResult}
      showFilters={true}
      title="all_admins"
      subtitle="manage_all_the_existing_admins"
    />
  );
}
