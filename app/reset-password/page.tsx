import ResetPasswordForm from "@/components/FogotResetPassword/ResetPassword";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  return <ResetPasswordForm token={searchParams.token} />;
}
