"use client";

import { CurrencyInput } from "@/components/Localization/CurrencyInput";
import { Switch } from "@/components/Switch/Switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BadgeEuro, Check, Clock, Globe, Search } from "lucide-react";
import { useState } from "react";

const staticLanguages = [
  {
    code: "en",
    name: "English (US)",
    enabled: true,
    default: true,
  },
  {
    code: "pt",
    name: "Portuguese",
    enabled: true,
    default: false,
  },
  {
    code: "es",
    name: "Spanish",
    enabled: true,
    default: false,
  },
  {
    code: "fr",
    name: "French",
    enabled: false,
    default: false,
  },
  {
    code: "de",
    name: "German",
    enabled: false,
    default: false,
  },
  {
    code: "ar",
    name: "Arabic",
    enabled: false,
    default: false,
  },
];

export function Localization() {
  const [languages, setLanguages] = useState(staticLanguages);

  const toggleLanguage = (code: string) => {
    setLanguages(
      languages.map((lang) =>
        lang.code === code && !lang.default
          ? {
              ...lang,
              enabled: !lang.enabled,
            }
          : lang
      )
    );
  };

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
          <h1 className="text-2xl font-bold text-[#DC3173]">Localization</h1>
          <p className="text-gray-500 mt-1">
            Languages, currencies, and timezones
          </p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Settings */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Supported Languages
                </h2>
                <p className="text-sm text-gray-500">
                  Manage available languages for your platform
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                  ${
                    lang.enabled
                      ? "border-[#DC3173] bg-pink-50/30"
                      : "border-gray-200 bg-white opacity-70"
                  }
                `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase
                    ${
                      lang.enabled
                        ? "bg-[#DC3173] text-white"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                    >
                      {lang.code}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lang.name}</p>
                      {lang.default && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC3173]">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={lang.enabled}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                    disabled={lang.default}
                  />
                </div>
              ))}

              <button className="flex items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50 transition-all">
                <span className="text-sm font-medium">+ Add New Language</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <BadgeEuro className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Currency Format
                </h2>
                <p className="text-sm text-gray-500">
                  Configure how prices are displayed
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <CurrencyInput label="Currency Symbol" defaultValue="€" />
                <CurrencyInput label="Currency Code" defaultValue="EURO" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Decimal Places
                  </label>
                  <select className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC3173]">
                    <option>0 (100)</option>
                    <option>2 (100.00)</option>
                    <option>3 (100.000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Separator
                  </label>
                  <select className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC3173]">
                    <option>Comma (1,000.00)</option>
                    <option>Dot (1.000,00)</option>
                    <option>Space (1 000.00)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Preview:</span>
                <span className="text-xl font-bold text-gray-900">
                  € 1,234.56
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timezone & Date */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Regional Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Timezone and date formats
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Operational Timezone
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="w-full h-10 rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC3173]">
                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+01:00) Paris</option>
                    <option>(GMT+09:00) Tokyo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date Format
                </label>
                <div className="space-y-2">
                  {[
                    "MM/DD/YYYY (12/31/2024)",
                    "DD/MM/YYYY (31/12/2024)",
                    "YYYY-MM-DD (2024-12-31)",
                  ].map((format, i) => (
                    <label
                      key={i}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="dateFormat"
                        defaultChecked={i === 0}
                        className="text-[#DC3173] focus:ring-[#DC3173]"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {format}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90" size="lg">
          <Check className="w-4 h-4" /> Save Configuration
        </Button>
      </div>
    </div>
  );
}
