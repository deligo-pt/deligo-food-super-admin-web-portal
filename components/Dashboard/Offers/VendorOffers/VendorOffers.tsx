"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarClock, Flame, Percent, Tag } from "lucide-react";

const BG = "#FFF1F7";
const SHADOW = "0 6px 20px rgba(0,0,0,0.06)";

interface IProps {
  vendor: TVendor;
  offersResult: {
    data: TOffer[];
    meta?: TMeta;
  };
}
const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Active",
        value: "active",
      },
      {
        label: "Inactive",
        value: "inactive",
      },
    ],
  },
];

export default function VendorOffers({ vendor, offersResult }: IProps) {
  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: BG }}>
      <div className="max-w-[1100px] mx-auto space-y-12">
        <TitleHeader
          title={`${vendor.name?.firstName} ${vendor.name?.lastName}'s Offers`}
          subtitle={`All offers from (${vendor.email})`}
        />

        <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

        <div className="space-y-6 pt-4">
          {offersResult?.data?.map((offer, idx) => (
            <motion.div
              key={offer?._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card
                className="rounded-3xl bg-white border shadow-md hover:shadow-xl transition-all"
                style={{ boxShadow: SHADOW }}
              >
                <CardContent className="px-6 py-3">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
                        {offer.offerType === "PERCENT" && <Percent size={28} />}
                        {offer.offerType === "BOGO" && <Tag size={28} />}
                        {offer.offerType === "FLAT" && <Flame size={28} />}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {offer.title}
                        </h2>

                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Badge variant="outline">
                            Code: {offer.code || "N/A"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                          <CalendarClock size={14} /> Valid till:{" "}
                          {format(offer.endDate, "dd MMM, yyyy")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right md:min-w-[200px]">
                      <p className="text-sm text-gray-500">Total Used</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {offer.usageCount}
                      </p>
                      <div>
                        <Badge
                          className={
                            offer.isActive
                              ? "bg-[#DC3173] text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {offer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {offer.offerType === "PERCENT"
                          ? `${offer.discountValue}% Off`
                          : offer.offerType === "FLAT"
                            ? `€ ${offer.discountValue} Off`
                            : offer.offerType === "BOGO"
                              ? `Buy ${offer.bogo?.buyQty} Get ${offer.bogo?.getQty}`
                              : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {offersResult?.meta?.total === 0 && (
            <p className="text-center text-gray-500 py-10">No offers found</p>
          )}
        </div>

        {!!offersResult?.meta?.totalPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-6"
          >
            <PaginationComponent
              totalPages={offersResult?.meta?.totalPage as number}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
