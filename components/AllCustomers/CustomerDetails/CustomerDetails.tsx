"use client";

import CustomerOrdersSection from "@/components/AllCustomers/CustomerDetails/CustomerOrdersSection";
import InfoRow from "@/components/AllCustomers/CustomerDetails/InfoRow";
import Section from "@/components/AllCustomers/CustomerDetails/Section";
import StatusBadge from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/StatusBadge";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { TOrder } from "@/types/order.type";
import { TCustomer } from "@/types/user.type";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  Ban,
  CalendarClock,
  Check,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  customer: TCustomer;
  orders: TOrder[];
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const CustomerDetails = ({ customer, orders }: IProps) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const router = useRouter();
  const fullName =
    `${customer.name?.firstName || ""} ${
      customer.name?.lastName || ""
    }`.trim() || t("no_name_provided");

  const closeApproveOrRejectModal = (open: boolean) => {
    if (!open) {
      setApproveStatus("");
    }
  };

  const handleDeleteCustomer = async () => {};

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => router.back()}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle /> {t("go_back")}
        </Button>
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-[#DC3173] text-white p-6 rounded-t-lg"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center"
          >
            {customer.profilePhoto ? (
              <Image
                src={customer.profilePhoto}
                alt={fullName}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            ) : (
              <User className="w-10 h-10 text-white/70" />
            )}
          </motion.div>
          <div className="flex-1">
            <motion.h2
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-2xl font-bold"
            >
              {fullName}
            </motion.h2>
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="flex items-center space-x-1 text-white/80"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">{customer.email}</span>
            </motion.div>
            {customer?.contactNumber && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
                className="flex items-center space-x-1 text-white/80"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{customer.contactNumber}</span>
              </motion.div>
            )}
          </div>
          <div>
            <StatusBadge
              status={customer?.isDeleted ? "DELETED" : customer.status}
            />
          </div>
        </div>
      </motion.div>
      <div className="bg-gray-50 p-6 rounded-b-lg">
        <Section
          title={t("personal_details")}
          icon={<User />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow label={t("full_name")} value={fullName} />
              <InfoRow label={t("email")} value={customer.email} />
              <InfoRow
                label={t("contact_number")}
                value={customer?.contactNumber || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title={t("address")} icon={<MapPin />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("street")}
                value={customer.address?.street || "N/A"}
              />
              <InfoRow
                label={t("city")}
                value={customer.address?.city || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("state")}
                value={customer.address?.state || "N/A"}
              />
              <InfoRow
                label={t("country")}
                value={customer.address?.country || "N/A"}
              />
              <InfoRow
                label={t("zip_code")}
                value={customer.address?.postalCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title="Orders" icon={<Package />}>
          <CustomerOrdersSection orders={orders} />
          <div className="text-center my-3">
            <Link
              className="text-[#DC3173] hover:underline text-sm cursor-pointer font-semibold"
              href={`/admin/all-orders/customer/${customer.userId}`}
            >
              Show All
            </Link>
          </div>
        </Section>
        <Section title={t("account_information")} icon={<CalendarClock />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("account_created")}
                value={formatDate(customer.createdAt)}
              />
              <InfoRow
                label={t("last_updated")}
                value={formatDate(customer.updatedAt)}
              />
            </div>
            <div>
              <InfoRow
                label={t("approved_rejected_blocked_at")}
                value={formatDate(customer.approvedOrRejectedOrBlockedAt)}
              />
              {customer.remarks && (
                <InfoRow label={t("remarks")} value={customer.remarks} />
              )}
            </div>
          </div>
        </Section>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {customer.status === "SUBMITTED" && (
            <>
              <motion.button
                onClick={() => setApproveStatus("APPROVED")}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
              >
                <Check className="w-4 h-4" />
                <span>{t("approve")}</span>
              </motion.button>
              <motion.button
                onClick={() => setApproveStatus("REJECTED")}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600"
              >
                <X className="w-4 h-4" />
                <span>{t("reject")}</span>
              </motion.button>
            </>
          )}
          {customer.status === "APPROVED" && (
            <motion.button
              onClick={() => setApproveStatus("BLOCKED")}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600"
            >
              <Ban className="w-4 h-4" />
              <span>{t("block")}</span>
            </motion.button>
          )}
          {customer.status === "BLOCKED" && (
            <motion.button
              onClick={() => setApproveStatus("UNBLOCKED")}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
            >
              <Check className="w-4 h-4" />
              <span>{t("unblock")}</span>
            </motion.button>
          )}
          {!customer.isDeleted && (
            <motion.button
              onClick={() => setShowDeleteModal(true)}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 bg-opacity-10 text-white rounded-lg transition-all hover:bg-opacity-20"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t("delete")}</span>
            </motion.button>
          )}
        </div>
      </div>

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteCustomer}
      />

      <ApproveOrRejectModal
        open={!!approveStatus}
        onOpenChange={closeApproveOrRejectModal}
        status={
          approveStatus as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={customer.userId}
        userName={`${customer?.name?.firstName} ${customer?.name?.lastName}`}
      />
    </div>
  );
};
