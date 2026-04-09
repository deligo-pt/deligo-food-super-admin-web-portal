"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RESTRICTED_CATEGORIES } from "@/consts/item.const";
import { useTranslation } from "@/hooks/use-translation";
import { TRestrictedItem } from "@/types/product.type";
import { restrictedItemValidation } from "@/validations/item/restricted-item.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevValues: TRestrictedItem;
}

type TFormValues = z.infer<typeof restrictedItemValidation>;

export default function EditRestrictedItemModal({
  open,
  onOpenChange,
  prevValues,
}: IProps) {
  const { t } = useTranslation();

  const form = useForm<TFormValues>({
    resolver: zodResolver(restrictedItemValidation),
    defaultValues: {
      name: prevValues?.name || "",
      category: prevValues?.category || "",
      reason: prevValues?.reason || "",
    },
  });

  const onSubmit = (data: TFormValues) => {
    const toastId = toast.loading("Updating restricted item...");
    console.log("Form Data:", data);
    setTimeout(() => {
      toast.success("Restricted item updated successfully!", {
        id: toastId,
      });
      onOpenChange(false);
      form.reset();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restricted Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              id="editRestrictedItemForm"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Cuban Cigars"
                        className="h-10!"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full h-10!">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESTRICTED_CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="reason"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Detailed reason for restriction..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              form="editRestrictedItemForm"
              type="submit"
              className="bg-[#DC3173] hover:bg-[#DC3173]/90"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
