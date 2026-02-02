"use client";

import { ColorPicker } from "@/components/ColorPicker/ColorPicker";
import { FileUpload } from "@/components/FileUpload/FileUpload";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { RefreshCw, Save, Smartphone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function BrandingTheme() {
  const { t } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState("#DC3173");
  const [accentColor, setAccentColor] = useState("#FCDDEC");
  const [font, setFont] = useState("Inter");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <TitleHeader
        title={t("branding_and_theme")}
        subtitle={t("manage_logos_colors_typography")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("visual_identity")}
                </h2>
                <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {t("global")}
                </span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label={t("main_logo_light_mode")}
                    accept="image/*"
                  />
                  <FileUpload
                    label={t("main_logo_dark_mode")}
                    accept="image/*"
                  />
                </div>

                <FileUpload
                  label={t("favicon_app_icon")}
                  accept="image/png, image/ico"
                  maxSize={1}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t("color_palatte")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label={t("primary_color")}
                  color={primaryColor}
                  onChange={setPrimaryColor}
                />
                <ColorPicker
                  label={t("accent_color")}
                  color={accentColor}
                  onChange={setAccentColor}
                />
                <ColorPicker
                  label={t("success_color")}
                  color="#10B981"
                  onChange={() => {}}
                />
                <ColorPicker
                  label={t("error_color")}
                  color="#EF4444"
                  onChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t("typography")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("primary_font_family")}
                  </label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC3173] focus:border-transparent"
                  >
                    <option value="Inter">Inter (Default)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    {t("this_font_will_be_applied_all_customer")}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">{t("preview")}:</p>
                  <p
                    className="text-2xl font-bold text-gray-900 mb-1"
                    style={{
                      fontFamily: font,
                    }}
                  >
                    {t("the_quick_brown_fox_jumps")}
                  </p>
                  <p
                    className="text-base text-gray-600"
                    style={{
                      fontFamily: font,
                    }}
                  >
                    {t("abcdef")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {t("live_preview")}
              </h3>
              <div className="flex gap-2">
                <button className="p-1.5 text-gray-400 hover:text-[#DC3173] rounded bg-white shadow-sm border border-gray-200">
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile App Preview Mockup */}
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-14 rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
              <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-2xl left-1/2 -translate-x-1/2 absolute"></div>
              <div className="h-8 w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
              <div className="h-16 w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

              {/* Screen Content */}
              <div className="rounded-4xl overflow-hidden w-full h-full bg-white flex flex-col relative">
                {/* Splash Screen Mode */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mb-6 flex items-center justify-center">
                    <Image
                      src="/deligoLogo.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <h1
                    className="text-white text-2xl font-bold mb-2"
                    style={{
                      fontFamily: font,
                    }}
                  >
                    DeliGo
                  </h1>
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>

                {/* App Interface (Behind Splash) */}
                <div className="flex-1 bg-gray-50 pt-12 px-4">
                  <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                  </div>
                  <div className="h-32 bg-white rounded-xl shadow-sm mb-4"></div>
                  <div className="h-32 bg-white rounded-xl shadow-sm mb-4"></div>
                </div>

                {/* Bottom Nav */}
                <div className="h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  ></div>
                  <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              {t("splash_screen_preview")}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      <motion.div
        initial={{
          y: 100,
        }}
        animate={{
          y: 0,
        }}
        className="fixed bottom-6 right-6 left-6 md:left-80 z-20"
      >
        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="font-medium">{t("unsaved_changes")}</p>
              <p className="text-xs text-gray-400">
                {t("preview_updates_instantly_across")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800 hover:text-white"
            >
              {t("discard")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" /> {t("save_changes")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
