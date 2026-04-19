import SuperAdminLoginPage from "@/components/login/login";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ redirect: string; sessionExpired: "true" | "false" }>;
}) {
  const { redirect, sessionExpired } = await searchParams;
  return (
    <div className="min-h-screen">
      <SuperAdminLoginPage
        redirect={redirect}
        sessionExpired={sessionExpired === "true"}
      />
    </div>
  );
}
