import { Input } from "@/components/ui/input";
import { updateSOSStatusReq } from "@/services/dashboard/SOS/SOS";
import { TSosStatus } from "@/types/sos.type";
import { CheckCircle, TriangleAlert, UserSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  status: TSosStatus;
  sosId: string;
  onStatusUpdateSuccess: () => void;
}

export default function SOSActions({
  status,
  sosId,
  onStatusUpdateSuccess,
}: IProps) {
  const [note, setNote] = useState("");

  const updateStatus = async (status: TSosStatus) => {
    const toastId = toast.loading("Updating status...");

    const result = await updateSOSStatusReq(sosId, { status, note });

    if (result?.success) {
      toast.success(result.message || "Status updated successfully!", {
        id: toastId,
      });
      onStatusUpdateSuccess();
      return;
    }

    toast.error(result?.message || "Failed to update status", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <div>
      <div className="mb-2">
        {status !== "RESOLVED" && (
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
          />
        )}
      </div>

      <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
        {status !== "INVESTIGATING" && status !== "RESOLVED" && (
          <button
            onClick={() => updateStatus("INVESTIGATING")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500/90"
          >
            <UserSearch size={16} />
            Investigate
          </button>
        )}
        {status !== "RESOLVED" && (
          <button
            onClick={() => updateStatus("RESOLVED")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC3173] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#DC3173]/90"
          >
            <CheckCircle size={16} />
            Resolve
          </button>
        )}
        {status !== "FALSE_ALARM" && status !== "RESOLVED" && (
          <button
            onClick={() => updateStatus("FALSE_ALARM")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-500/90"
          >
            <TriangleAlert size={16} />
            False Alarm
          </button>
        )}
      </div>
    </div>
  );
}
