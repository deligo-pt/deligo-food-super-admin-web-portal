"use client";

import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TPayout } from "@/types/payout.type";
import { TAgent, TVendor } from "@/types/user.type";
import {
  CheckCircle,
  Clock,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Store,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import React from "react";

export const StatusBadge = ({ status }: { status: TPayout["status"] }) => {
  const config = {
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: <Clock size={14} />,
      label: "Pending",
    },
    PROCESSING: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <Loader2 size={14} className="animate-spin" />,
      label: "Processing",
    },
    PAID: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle size={14} />,
      label: "Paid",
    },
    FAILED: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircle size={14} />,
      label: "Failed",
    },
  };

  const { bg, text, icon, label } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${bg} ${text}`}
    >
      {icon} {label}
    </span>
  );
};

export const PaymentMethodBadge = ({
  method,
}: {
  method: TPayout["paymentMethod"];
}) => {
  const config = {
    BANK_TRANSFER: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "Bank Transfer",
    },
    MOBILE_BANKING: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      label: "Mobile Banking",
    },
    CASH: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Cash",
    },
  };

  const { bg, text, label } = config[method];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}
    >
      {label}
    </span>
  );
};

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">
        {value}
      </p>
    </div>
  </div>
);

export const RecipientCard = ({ payout }: { payout: TPayout }) => {
  if (payout.userModel === "Vendor") {
    const v = payout.userId as TVendor;
    const fullAddress = v.businessLocation
      ? `${v.businessLocation.street}, ${v.businessLocation.city}, ${v.businessLocation.country} ${v.businessLocation.postalCode}`
      : null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#DC3173]/10 rounded-xl text-[#DC3173]">
            <Store size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Vendor</h2>
        </div>
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] font-extrabold text-lg">
            {v.businessDetails?.businessName?.charAt(0) ?? "V"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {v.businessDetails?.businessName ?? "Unknown Business"}
            </h3>
            <p className="text-xs text-gray-500 font-mono">ID: {v.userId}</p>
          </div>
        </div>
        <div className="space-y-4">
          <InfoRow icon={<Mail size={16} />} label="Email" value={v.email} />
          {v.contactNumber && (
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={v.contactNumber}
            />
          )}
          {v.businessDetails?.businessLicenseNumber && (
            <InfoRow
              icon={<Hash size={16} />}
              label="License No."
              value={v.businessDetails.businessLicenseNumber}
            />
          )}
          {fullAddress && (
            <InfoRow
              icon={<MapPin size={16} />}
              label="Address"
              value={fullAddress}
            />
          )}
        </div>
      </div>
    );
  }

  if (payout.userModel === "DeliveryPartner") {
    const d = payout.userId as TDeliveryPartner;
    const fullName =
      [d.name?.firstName, d.name?.lastName].filter(Boolean).join(" ") ||
      "Unknown";
    const fullAddress = d.address
      ? [
          d.address.street,
          d.address.city,
          d.address.country,
          d.address.postalCode,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Truck size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Delivery Partner</h2>
        </div>
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-extrabold text-lg">
            {fullName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 font-mono">ID: {d.userId}</p>
          </div>
        </div>
        <div className="space-y-4">
          <InfoRow icon={<Mail size={16} />} label="Email" value={d.email} />
          {d.contactNumber && (
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={d.contactNumber}
            />
          )}
          {d.vehicleInfo?.vehicleType && (
            <InfoRow
              icon={<Truck size={16} />}
              label="Vehicle"
              value={d.vehicleInfo.vehicleType}
            />
          )}
          {fullAddress && (
            <InfoRow
              icon={<MapPin size={16} />}
              label="Address"
              value={fullAddress}
            />
          )}
        </div>
      </div>
    );
  }

  if (payout.userModel === "FleetManager") {
    const f = payout.userId as TAgent;
    const fullName =
      [f.name?.firstName, f.name?.lastName].filter(Boolean).join(" ") ||
      "Unknown";
    const fullAddress = f.address
      ? [
          f.address.street,
          f.address.city,
          f.address.country,
          f.address.postalCode,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
            <User size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Fleet Manager</h2>
        </div>
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-extrabold text-lg">
            {fullName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 font-mono">ID: {f.userId}</p>
          </div>
        </div>
        <div className="space-y-4">
          <InfoRow icon={<Mail size={16} />} label="Email" value={f.email} />
          {f.contactNumber && (
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={f.contactNumber}
            />
          )}
          {fullAddress && (
            <InfoRow
              icon={<MapPin size={16} />}
              label="Address"
              value={fullAddress}
            />
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const StatusTimeline = ({ status }: { status: TPayout["status"] }) => {
  const steps = [
    {
      key: "PENDING",
      label: "Pending",
      desc: "Payout request created",
    },
    {
      key: "PROCESSING",
      label: "Processing",
      desc: "Bank transfer initiated",
    },
    {
      key: "PAID",
      label: "Paid",
      desc: "Funds delivered",
    },
  ];

  const statusOrder = {
    PENDING: 0,
    PROCESSING: 1,
    PAID: 2,
    FAILED: 2,
  };

  const currentIndex = statusOrder[status];
  const isFailed = status === "FAILED";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Payout Status</h2>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isDone = !isFailed && index < currentIndex;
          const isCurrent = !isFailed && index === currentIndex;
          const isFinalFailed = isFailed && index === 2;
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${isFinalFailed ? "bg-red-100 border-red-400 text-red-600" : isDone ? "bg-[#DC3173] border-[#DC3173] text-white" : isCurrent ? "bg-[#DC3173]/10 border-[#DC3173] text-[#DC3173]" : "bg-white border-gray-200 text-gray-300"}`}
                >
                  {isFinalFailed ? (
                    <XCircle size={16} />
                  ) : isDone ? (
                    <CheckCircle size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Clock size={16} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 my-1 ${isDone ? "bg-[#DC3173]" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={`font-bold text-sm ${isDone || isCurrent ? "text-gray-900" : "text-gray-400"}`}
                >
                  {isFinalFailed ? "Failed" : step.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${isDone || isCurrent ? "text-gray-500" : "text-gray-300"}`}
                >
                  {isFinalFailed ? "Payout could not be processed" : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
