"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { Bike, Eye, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const DELIGO = "#DC3173";

interface IProps {
  partnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function ActiveDeliveryPartners({ partnersResult }: IProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <Bike className="w-8 h-8" style={{ color: DELIGO }} /> Active Delivery
        Partners
      </motion.h1>

      <AllFilters sortOptions={sortOptions} />

      {/* List */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Active Partners</h2>
          <div className="text-sm text-slate-500">
            {partnersResult?.meta?.total} total
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          {partnersResult?.data?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No partners found.
            </div>
          ) : (
            partnersResult?.data?.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar>
                    <AvatarImage src={p.profilePhoto} />
                    <AvatarFallback>
                      {p.name?.firstName || p.name?.lastName
                        ? `${p.name?.firstName?.[0]}${p.name?.lastName?.[0]}`
                        : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {p.name?.firstName} {p.name?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.address?.city}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3" />{" "}
                        {p.operationalData?.rating?.average}
                      </span>

                      <Badge variant="default">
                        {p.vehicleInfo?.vehicleType}
                      </Badge>

                      {/* <span className="text-xs text-slate-400">
                        Violations:{" "}
                        <strong className="text-rose-600">
                          {p.violations ?? 0}
                        </strong>
                      </span> */}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-sm text-slate-500">
                    Delivered: {p.operationalData?.totalDeliveries}
                  </p>
                  <p className="text-sm text-emerald-600 font-bold">
                    € {p.earnings?.totalEarnings?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* <div className="text-xs text-slate-400">
                      {p.lastOnline
                        ? `Online ${timeAgo(p.lastOnline)}`
                        : "Offline"}
                    </div> */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/partners/${p.userId}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {!!partnersResult?.meta?.total && partnersResult?.meta?.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={partnersResult?.meta?.totalPage || 0}
          />
        </div>
      )}
    </div>
  );
}
