"use client";

import VendorPayouts from "@/components/Dashboard/Payouts/VendorPayouts/VendorPayouts";
import { TVendorPayout } from "@/types/payout.type";

export default function VendorPayoutsPage() {
  const mockData = {
    data: mockPayouts(),
    meta: { total: 18, page: 1, limit: 10, totalPage: 2 },
  };

  return (
    <VendorPayouts
      vendorPayoutsResult={mockData}
      title="Vendor Payouts"
      subtitle=" Manage all vendor payouts here"
    />
  );
}

/* ---------------------- Mock data (replace with API) ---------------------- */
function mockPayouts(): TVendorPayout[] {
  const vendors = [
    { id: "VND-2001", name: "Casa Lisboa", city: "Lisbon" },
    { id: "VND-2002", name: "Prego Urban", city: "Porto" },
    { id: "VND-2003", name: "Sabor de Porto", city: "Porto" },
    { id: "VND-2004", name: "Pastelaria do Bairro", city: "Coimbra" },
    { id: "VND-2005", name: "Sushi Tejo", city: "Lisbon" },
  ];

  const methods = ["IBAN Transfer", "Multibanco", "Bank Transfer"];

  return Array.from({ length: 18 }).map((_, i) => {
    const v = vendors[i % vendors.length];
    const status: TVendorPayout["status"] =
      i % 5 === 0 ? "Pending" : i % 7 === 0 ? "Rejected" : "Completed";
    return {
      _id: `PAYOUT-${3000 + i}`,
      vendor: {
        userId: v.id,
        businessDetails: {
          businessName: v.name,
          city: v.city,
        },
      },
      amount: +(Math.random() * 800 + 20).toFixed(2),
      payoutMethod: methods[i % methods.length],
      createdAt: new Date(Date.now() - i * 3600 * 1000 * 24),
      updatedAt: new Date(Date.now() - i * 3600 * 1000 * 24),
      status,
      accountHolder: `${v.name} Owner`,
      iban: i % 3 === 0 ? `PT50${1000000000 + i}` : undefined,
      note: i % 6 === 0 ? "Manual review required" : undefined,
    };
  });
}
