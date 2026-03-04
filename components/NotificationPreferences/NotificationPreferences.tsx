"use client";

import { CurrencyInput } from "@/components/Localization/CurrencyInput";
import { Switch } from "@/components/Switch/Switch";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Smartphone,
  Store,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";

type TActiveTab = "customer" | "vendor" | "driver";

export function NotificationPreferences() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TActiveTab>("customer");
  const [activeTemplate, setActiveTemplate] = useState("order_confirmation");

  const userTypes = [
    {
      id: "customer",
      label: t("customer"),
      icon: User,
    },
    {
      id: "vendor",
      label: t("vendor"),
      icon: Store,
    },
    {
      id: "driver",
      label: t("delivery_partner"),
      icon: Truck,
    },
  ];

  const channels = [
    {
      id: "push",
      label: t("push_notification"),
      icon: Smartphone,
    },
    {
      id: "email",
      label: t("email"),
      icon: Mail,
    },
    {
      id: "sms",
      label: t("sms"),
      icon: MessageSquare,
    },
  ];

  const events = [
    {
      id: "order_confirmation",
      label: t("order_confirmation"),
    },
    {
      id: "order_shipped",
      label: t("order_picked_up"),
    },
    {
      id: "order_delivered",
      label: t("order_delivered"),
    },
    {
      id: "promo",
      label: t("promotional"),
    },
  ];

  return (
    <div className="space-y-8">
      <TitleHeader
        title={t("notifications")}
        subtitle={t("configure_alerts_templates")}
      />

      {/* User Type Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        {userTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id as TActiveTab)}
            className={`
              relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all
              ${
                activeTab === type.id
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {activeTab === type.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white shadow-sm rounded-lg"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <type.icon className="w-4 h-4" />
              {type.label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Channel Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("active_channels")}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t("enable_communication_channels_for")}{" "}
                {userTypes.find((t) => t.id === activeTab)?.label}s.
              </p>

              <div className="space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md shadow-sm text-[#DC3173]">
                        <channel.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {channel.label}
                      </span>
                    </div>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("event_triggers")}
              </h3>
              <div className="space-y-1">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setActiveTemplate(event.id)}
                    className={`
                    w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors
                    ${
                      activeTemplate === event.id
                        ? "bg-pink-50 text-[#DC3173] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                  >
                    {event.label}
                    {activeTemplate === event.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DC3173]" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("template_editor")}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t("editing")}{" "}
                    <span className="font-medium text-[#DC3173]">
                      {events.find((e) => e.id === activeTemplate)?.label}
                    </span>{" "}
                    {t("email_template")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {t("send_test")}
                  </Button>
                  <Button
                    className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                    size="sm"
                  >
                    {t("save_template")}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <CurrencyInput
                  label={t("subject_line")}
                  defaultValue="Your order #12345 has been confirmed!"
                />

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("email_body")}
                  </label>
                  <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden flex flex-col min-h-[400px]">
                    {/* Mock Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1 flex-wrap">
                      {["Bold", "Italic", "Link", "H1", "H2", "List"].map(
                        (tool) => (
                          <button
                            key={tool}
                            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
                          >
                            {tool}
                          </button>
                        ),
                      )}
                      <div className="w-px h-4 bg-gray-300 mx-1 self-center" />
                      <button className="px-2 py-1 text-xs font-medium text-[#DC3173] bg-pink-50 hover:bg-pink-100 rounded">
                        {"{"} {t("variable")} {"}"}
                      </button>
                    </div>

                    {/* Editor Area */}
                    <textarea
                      className="flex-1 w-full p-4 focus:outline-none resize-none font-mono text-sm text-gray-800"
                      defaultValue={`Hi {{customer_name}},

Great news! Your order from {{restaurant_name}} has been confirmed and is being prepared.

Order Summary:
{{order_items}}

Total: {{order_total}}

We'll let you know when it's on the way!

Track your order here: {{tracking_link}}

Enjoy,
The FoodApp Team`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {t("available_variables")}:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {t("customer_name")}
                    </code>
                    ,{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {t("restaurant_name")}
                    </code>
                    ,{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {t("order_total")}
                    </code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
