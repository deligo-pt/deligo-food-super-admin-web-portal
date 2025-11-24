import SuperAdminLoginPage from "@/components/login/login";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ redirect: string }>;
}) {
  return (
    <div className="min-h-screen">
      <SuperAdminLoginPage redirect={(await searchParams)?.redirect} />
    </div>
  );
}
