"use client"
import React, { useState } from "react";
import { Percent, Calendar, DollarSign, Save, ArrowLeft, PackagePlus, Store } from "lucide-react";


export default function CreateNewOfferPage() {
  const offerTypes = [
    "Percentage Discount",
    "Flat Discount",
    "Free Delivery",
    "BOGO (Buy One Get One)",
    "Combo Offer",
  ];

  const [title, setTitle] = useState("");
  const [offerType, setOfferType] = useState(offerTypes[0]);
  const [vendor, setVendor] = useState("All Vendors");
  const [value, setValue] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conditions, setConditions] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Offer Created Successfully! (Backend can be connected)");
  };

  const iconFor = () => {
    if (offerType.includes("Percentage")) return <Percent size={18} className="text-[#DC3173]" />;
    if (offerType.includes("Flat")) return <DollarSign size={18} className="text-[#DC3173]" />;
    if (offerType.includes("Combo")) return <PackagePlus size={18} className="text-[#DC3173]" />;
    if (offerType.includes("BOGO")) return <PackagePlus size={18} className="text-[#DC3173]" />;
    return <Calendar size={18} className="text-[#DC3173]" />;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ArrowLeft size={22} className="cursor-pointer" />
        <h1 className="text-3xl md:text-4xl font-extrabold">Create New Offer</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white border rounded-3xl shadow p-6 md:p-8 flex flex-col gap-6"
      >
        <div>
          <label className="text-sm font-medium">Offer Title</label>
          <input
            className="w-full border rounded-xl px-4 py-2 mt-1"
            placeholder="Ex: 20% OFF on Burgers"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Offer Type + Vendor */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">Offer Type</label>
            <select
              className="w-full border rounded-xl px-4 py-2 mt-1"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
            >
              {offerTypes.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Vendor</label>
            <div className="flex items-center border rounded-xl px-4 py-2 mt-1 bg-white gap-2">
              <Store size={18} className="text-gray-500" />
              <input
                placeholder="All Vendors or specific vendor name"
                className="w-full outline-none"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Discount / Value */}
        <div>
          <label className="text-sm font-medium">Value ({offerType.includes("Percentage") ? "%" : "€"})</label>
          <div className="flex items-center border rounded-xl px-4 py-2 mt-1 gap-2 bg-white">
            {iconFor()}
            <input
              type="number"
              min={0}
              className="w-full outline-none"
              placeholder={offerType.includes("Percentage") ? "10" : "5€"}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="w-full border rounded-xl px-4 py-2 mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              className="w-full border rounded-xl px-4 py-2 mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Conditions */}
        <div>
          <label className="text-sm font-medium">Conditions (Optional)</label>
          <textarea
            className="w-full border rounded-xl px-4 py-2 mt-1"
            placeholder="Ex: Minimum order €10, Applies only from 5PM - 9PM"
            rows={4}
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
          />
        </div>

        {/* Preview */}
        <div className="border rounded-2xl p-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Live Offer Preview</h2>
          <p className="text-[#DC3173] font-bold text-xl">{title || "Offer Title"}</p>
          <p className="text-gray-600 mt-1">{offerType}</p>
          <p className="mt-1 font-semibold">Value: {value}{offerType.includes("Percentage") ? "%" : "€"}</p>
          <p className="text-sm text-gray-600 mt-1">Vendor: {vendor}</p>
          <p className="text-sm text-gray-500 mt-1">
            {startDate || "Start Date"} → {endDate || "End Date"}
          </p>
          {conditions && <p className="text-sm text-gray-700 mt-2">Conditions: {conditions}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-md self-end"
          style={{ background: "#DC3173" }}
        >
          <Save size={18} /> Create Offer
        </button>
      </form>
    </div>
  );
}
