"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { Calendar, FileText, History } from "lucide-react";
import { useState } from "react";

export function LegalDocuments() {
  const { t } = useTranslation();
  const [activeDoc, setActiveDoc] = useState("terms");

  const documents = [
    {
      id: "terms",
      label: t("terms_of_service"),
      status: "published",
      version: "2.4",
    },
    {
      id: "privacy",
      label: t("privacy_policy"),
      status: "published",
      version: "1.8",
    },
    {
      id: "vendor_agreement",
      label: t("vendor_agreement"),
      status: "draft",
      version: "3.0",
    },
    {
      id: "driver_agreement",
      label: t("driver_agreement"),
      status: "published",
      version: "2.1",
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="mb-8">
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <h1 className="text-2xl font-bold text-[#DC3173]">{t("legal_documents")}</h1>
          <p className="text-gray-500 mt-1">{t("terms_privacy_agreements")}</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar List */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`
                group flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 border
                ${activeDoc === doc.id
                  ? "bg-white border-[#DC3173] shadow-md"
                  : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
                }
              `}
            >
              <div
                className={`
                p-2 rounded-lg shrink-0
                ${activeDoc === doc.id
                    ? "bg-pink-50 text-[#DC3173]"
                    : "bg-gray-100 text-gray-500"
                  }
              `}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${activeDoc === doc.id ? "text-gray-900" : "text-gray-700"
                    }`}
                >
                  {doc.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`
                    text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                    ${doc.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                      }
                  `}
                  >
                    {doc.status}
                  </span>
                  <span className="text-xs text-gray-400">v{doc.version}</span>
                </div>
              </div>
            </button>
          ))}

          <button className="mt-auto flex items-center justify-center gap-2 p-3 text-sm font-medium text-gray-500 hover:text-[#DC3173] transition-colors">
            <History className="w-4 h-4" />
            {t("view_version_history")}
          </button>
        </div>

        {/* Editor Area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {t("version")}:
                  </span>
                  <input
                    type="text"
                    defaultValue={
                      documents.find((d) => d.id === activeDoc)?.version
                    }
                    className="w-16 h-8 px-2 text-sm border border-gray-300 rounded focus:border-[#DC3173] focus:outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {t("effective_date")}:
                  </span>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      defaultValue="Jan 1, 2025"
                      className="w-28 h-8 pl-7 pr-2 text-sm border border-gray-300 rounded focus:border-[#DC3173] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  {t("save_draft")}
                </Button>
                <Button
                  className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                  size="sm"
                >
                  {t("")}
                </Button>
              </div>
            </div>

            {/* Rich Text Area */}
            <div className="flex-1 relative">
              <textarea
                className="w-full h-full p-8 resize-none focus:outline-none text-gray-800 leading-relaxed"
                defaultValue={`# Terms of Service

Last Updated: January 1, 2025

1. Acceptance of Terms
By accessing and using the FoodApp platform, you agree to be bound by these Terms of Service.

2. User Responsibilities
Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.

3. Ordering and Delivery
- Orders are subject to availability.
- Delivery times are estimates and not guarantees.
- Prices are subject to change without notice.

4. Intellectual Property
All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of FoodApp or its content suppliers.

5. Limitation of Liability
FoodApp shall not be liable for any indirect, incidental, special, consequential or punitive damages.

6. Changes to Terms
We reserve the right to modify these terms at any time.

[End of Document]`}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
