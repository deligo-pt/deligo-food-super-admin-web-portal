"use client";

import SponsorshipOfferCard from "@/components/Dashboard/SponsorshipOffers/SponsorshipOfferCard";
import SettingsCard from "@/components/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/GlobalSettings/SettingsToggle";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TSponsorshipOffer } from "@/types/sponsorship.type";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Tag } from "lucide-react";
import React, { useState } from "react";

const initialOffers: TSponsorshipOffer[] = [
  {
    _id: "1",
    title: "Gold Sponsorship Package",
    description:
      "Premium placement on homepage and all category pages for one month.",
    price: 2500,
    benefits: [
      "Homepage Hero Banner",
      "Category Top Placement",
      "Newsletter Feature",
      "Social Media Shoutout",
      "Analytics Report",
    ],
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    title: "Silver Partner",
    description: "Great visibility for growing brands with targeted placement.",
    price: 1000,
    benefits: [
      "Category Sidebar Ad",
      "Search Results Highlight",
      "Email Mention",
    ],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    title: "Flash Sale Spot",
    description: "24-hour exclusive spot for urgent promotions.",
    price: 500,
    benefits: ["Homepage Pop-up", "Push Notification"],
    deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
export default function SponsorshipOffers() {
  const [offers, setOffers] = useState<TSponsorshipOffer[]>(initialOffers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    benefits: "",
    deadline: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newOffer: TSponsorshipOffer = {
      _id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      benefits: formData.benefits.split("\n").filter((b) => b.trim()),
      deadline: new Date(formData.deadline),
      isActive: formData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOffers([newOffer, ...offers]);
    setFormData({
      title: "",
      description: "",
      price: "",
      benefits: "",
      deadline: "",
      isActive: true,
    });
    setIsSubmitting(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this offer?")) {
      setOffers(offers.filter((o) => o._id !== id));
    }
  };

  const handleEdit = (id: string) => {
    console.log(id);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title="Sponsorship Offers"
          subtitle="Create time-limited packages for potential sponsors"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Create Form */}
          <div className="lg:col-span-1">
            <SettingsCard
              title="Create New Offer"
              description="Define package details and deadline"
              icon={Plus}
              className="sticky top-8"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <SettingsInput
                  label="Offer Title"
                  placeholder="e.g. Gold Package"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 sm:text-sm transition-all"
                    placeholder="Brief summary of the offer..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <SettingsInput
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  suffix="€"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Benefits List
                  </label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 sm:text-sm transition-all"
                    placeholder="Enter one benefit per line..."
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        benefits: e.target.value,
                      })
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Separate each benefit with a new line
                  </p>
                </div>

                <SettingsInput
                  label="Deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deadline: e.target.value,
                    })
                  }
                />

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <SettingsToggle
                    label="Active Status"
                    description="Publish offer immediately"
                    checked={formData.isActive}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        isActive: val,
                      })
                    }
                  />
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  disabled={isSubmitting}
                  className={`
                    w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-500/20 transition-all
                    ${isSubmitting ? "bg-brand-400 cursor-wait" : "bg-brand-500 hover:bg-brand-600 hover:shadow-brand-600/30"}
                  `}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Offer
                    </>
                  )}
                </motion.button>
              </form>
            </SettingsCard>
          </div>

          {/* Right: Offers Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-500">
                <Tag size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Active Offers</h2>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-sm font-medium">
                {offers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {offers.map((offer) => (
                  <SponsorshipOfferCard
                    key={offer._id}
                    offer={offer}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>

            {offers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-400 mb-3">
                  <Tag size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No offers yet
                </h3>
                <p className="text-gray-500 mt-1">
                  Create your first sponsorship package to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
