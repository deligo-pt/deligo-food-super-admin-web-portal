"use client";

import InfoRow from "@/components/AllCustomers/CustomerDetails/InfoRow";
import Section from "@/components/AllCustomers/CustomerDetails/Section";
import StatusBadge from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/StatusBadge";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { TCustomer } from "@/types/user.type";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  Ban,
  CalendarClock,
  Check,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  customer: TCustomer;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const CustomerDetails = ({ customer }: IProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const router = useRouter();
  const fullName =
    `${customer.name?.firstName || ""} ${
      customer.name?.lastName || ""
    }`.trim() || "No Name Provided";

  const closeApproveOrRejectModal = (open: boolean) => {
    if (!open) {
      setApproveStatus("");
    }
  };

  const handleDeletePartner = async () => {
    // const toastId = toast.loading("Deleting Delivery Partner...");
    // try {
    //   const result = (await deleteCustomer(
    //     customer.userId
    //   )) as TResponse<null>;
    //   if (result.success) {
    //     toast.success("Delivery Partner deleted successfully", { id: toastId });
    //     setShowDeleteModal(false);
    //     router.refresh();
    //   }
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // } catch (error: any) {
    //   console.log(error);
    //   toast.error(
    //     error?.response?.data?.message || "Delivery Partner deletion failed",
    //     { id: toastId }
    //   );
    // }
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => router.back()}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle /> Go Back
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
        <Section title="Personal Details" icon={<User />} defaultOpen={true}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow label="Full Name" value={fullName} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow
                label="Contact Number"
                value={customer?.contactNumber || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title="Address" icon={<MapPin />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label="Street"
                value={customer.address?.street || "N/A"}
              />
              <InfoRow label="City" value={customer.address?.city || "N/A"} />
            </div>
            <div>
              <InfoRow label="State" value={customer.address?.state || "N/A"} />
              <InfoRow
                label="Country"
                value={customer.address?.country || "N/A"}
              />
              <InfoRow
                label="Zip Code"
                value={customer.address?.postalCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title="Account Information" icon={<CalendarClock />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label="Account Created"
                value={formatDate(customer.createdAt)}
              />
              <InfoRow
                label="Last Updated"
                value={formatDate(customer.updatedAt)}
              />
            </div>
            <div>
              <InfoRow
                label="Approved/Rejected/Blocked At"
                value={formatDate(customer.approvedOrRejectedOrBlockedAt)}
              />
              {customer.remarks && (
                <InfoRow label="Remarks" value={customer.remarks} />
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
                <span>Approve</span>
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
                <span>Reject</span>
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
              <span>Block</span>
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
              <span>Unblock</span>
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
              <span>Delete</span>
            </motion.button>
          )}
        </div>
      </div>

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeletePartner}
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
