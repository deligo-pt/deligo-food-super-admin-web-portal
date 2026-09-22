// components/zones/ZoneForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const zoneFormSchema = z.object({
    zoneId: z
        .string()
        .min(3, "Min 3 characters")
        .max(50, "Max 50 characters")
        .regex(
            /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
            "Only letters, numbers and single hyphens"
        ),
    district: z.string().min(1, "Required").max(100),
    zoneName: z.string().min(1, "Required").max(100),
    isOperational: z.boolean(),
    minDeliveryFee: z.number().min(1, { error: "Minimum 1 is required" }),
    maxDeliveryDistanceKm: z.number().min(1, { error: "Minimum 1 is required" }),
});

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

type Props = {
    defaultValues?: Partial<ZoneFormValues>;
    onSubmit: (values: ZoneFormValues) => Promise<void>;
    isSubmitting?: boolean;
    isValidBoundary?: boolean;
};

export function ZoneForm({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    isValidBoundary = false,
}: Props) {
    const form = useForm<ZoneFormValues>({
        resolver: zodResolver(zoneFormSchema),
        defaultValues: {
            zoneId: "",
            district: "",
            zoneName: "",
            isOperational: true,
            minDeliveryFee: 2,
            maxDeliveryDistanceKm: 7,
            ...defaultValues,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="zoneId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zone ID <span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Lisbon-Zone-01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>District <span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Lisbon" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="zoneName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zone Name <span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Lisbon Centre" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isOperational"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <FormLabel>Operational</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#DC3173]"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minDeliveryFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Delivery Fee</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxDeliveryDistanceKm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Distance (km)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#DC3173]"
                    disabled={isSubmitting || !isValidBoundary}
                >
                    {isSubmitting ? "Saving…" : "Save Zone"}
                </Button>
            </form>
        </Form>
    );
}