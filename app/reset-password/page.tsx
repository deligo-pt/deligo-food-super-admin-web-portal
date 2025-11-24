import ResetPasswordForm from "@/components/FogotResetPassword/ResetPassword";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  return <ResetPasswordForm token={(await searchParams).token} />;
}
