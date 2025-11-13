import { Badge } from "@/components/ui/badge";
import { USER_STATUS } from "@/consts/user.const";
import { AlertCircle, CheckSquare, Clock, XCircle } from "lucide-react";

export default function StatusBadge({
  status,
}: {
  status: keyof typeof USER_STATUS;
}) {
  const variants = {
    PENDING: {
      variant: "pending" as const,
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    SUBMITTED: {
      variant: "submitted" as const,
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
    APPROVED: {
      variant: "approved" as const,
      icon: <CheckSquare className="w-3 h-3 mr-1" />,
    },
    REJECTED: {
      variant: "rejected" as const,
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
  };
  const { variant, icon } = variants[status];
  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
