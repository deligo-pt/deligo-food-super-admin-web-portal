import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { TRating } from "@/types/rating.type";
import { format } from "date-fns";
import { StarIcon } from "lucide-react";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: TRating | null;
}

export default function CustomerFeedbackDetails({
  open,
  onOpenChange,
  feedback,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
        <SheetHeader className="p-0">
          <SheetTitle>{t("feedback_details")}</SheetTitle>
          <SheetDescription>
            {t("view_full_feedback_nd_reply")}
          </SheetDescription>
        </SheetHeader>

        {feedback && (
          <div className="mt-4 grid grid-cols-1 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={feedback?.reviewerId?.profilePhoto} />
                  <AvatarFallback>
                    {feedback?.reviewerId?.name?.firstName?.charAt(0)}
                    {feedback?.reviewerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">
                    {feedback.reviewerId?.name?.firstName ||
                    feedback.reviewerId?.name?.lastName
                      ? `${feedback.reviewerId?.name?.firstName} ${feedback.reviewerId?.name?.lastName}`
                      : "N/A"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {feedback.reviewerId?.email || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {feedback.reviewerId?.address?.city || "N/A"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-yellow-500" />{" "}
                    <span className="font-semibold">
                      {feedback.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="mt-4">
                <h4 className="font-semibold mb-2">{t("comment")}</h4>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {feedback.review || "N/A"}
                </p>
              </div>
            </div>

            <div className="col-span-1">
              <Card className="p-4 mb-4">
                <p className="text-xs text-slate-500">{t("date")}</p>
                <p className="font-semibold">
                  {format(feedback.createdAt, "do MMM yyyy, h:mm a")}
                </p>
              </Card>

              <Card className="p-4 mb-4">
                <p className="text-xs text-slate-500">{t("sentiment")}</p>
                <p className="font-semibold capitalize">
                  {feedback.sentiment || "—"}
                </p>
              </Card>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
