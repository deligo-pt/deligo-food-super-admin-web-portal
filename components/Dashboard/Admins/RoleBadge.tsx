import { USER_ROLE } from "@/consts/user.const";

export default function RoleBadge({ role }: { role: "ADMIN" | "SUPER_ADMIN" }) {
  const base =
    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset";

  if (role === USER_ROLE.SUPER_ADMIN)
    return (
      <span
        className={`${base} bg-[rgba(220,49,115,0.12)] text-[#DC3173] ring-[#F7D6E0] animate-pulse`}
      >
        {role}
      </span>
    );

  if (role === USER_ROLE.ADMIN)
    return (
      <span className={`${base} bg-gray-100 text-gray-800 ring-gray-200`}>
        {role}
      </span>
    );

  return (
    <span className={`${base} bg-yellow-50 text-yellow-800 ring-yellow-100`}>
      {role}
    </span>
  );
}
