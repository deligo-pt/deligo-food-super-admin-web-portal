"use client";

import { ElementType } from "react";

interface Iprops {
  label: string;
  value?: string | number;
  icon?: ElementType;
}

export function ProfileInfoRow({ label, value, icon: Icon }: Iprops) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="w-5 h-5 text-[#DC3173] mt-0.5">
          <Icon className="w-full h-full" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base text-gray-900 font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}
