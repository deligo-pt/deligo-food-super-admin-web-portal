import SuperAdminLoginPage from "@/components/login/login";

export default function Home({
  searchParams,
}: {
  searchParams: { redirect: string };
}) {
  return (
    <div className="min-h-screen">
      <SuperAdminLoginPage redirect={searchParams?.redirect} />
    </div>
  );
}
