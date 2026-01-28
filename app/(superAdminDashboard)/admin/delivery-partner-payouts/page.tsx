"use client";

import DeliveryPartnerPayouts from "@/components/Dashboard/Payouts/DeliveryPartnerPayouts/DeliveryPartnerPayouts";
import { TDeliveryPartnerPayout } from "@/types/payout.type";

export default function DeliveryPartnerPayoutsPage() {
  const mockData = {
    data: mockPayouts(),
    meta: { total: 18, page: 1, limit: 10, totalPage: 2 },
  };

  return (
    <DeliveryPartnerPayouts
      deliveryPartnerPayoutsResult={mockData}
      title="Delivery Partner Payouts"
      subtitle=" Manage all delivery partner payouts here"
    />
  );
}

/* ---------------------- Mock data (replace with API) ---------------------- */
function mockPayouts(): TDeliveryPartnerPayout[] {
  const partners = [
    { id: "VND-2001", firstName: "João", lastName: "Silva", city: "Lisbon" },
    {
      id: "VND-2002",
      firstName: "Maria",
      lastName: "Fernandes",
      city: "Porto",
    },
    { id: "VND-2003", firstName: "Rui", lastName: "Costa", city: "Porto" },
    { id: "VND-2004", firstName: "Ana", lastName: "Pereira", city: "Coimbra" },
    { id: "VND-2005", firstName: "Carlos", lastName: "Sousa", city: "Lisbon" },
  ];

  const methods = ["IBAN Transfer", "Multibanco", "Bank Transfer"];

  return Array.from({ length: 18 }).map((_, i) => {
    const p = partners[i % partners.length];
    const status: TDeliveryPartnerPayout["status"] =
      i % 5 === 0 ? "Pending" : i % 7 === 0 ? "Rejected" : "Completed";
    return {
      _id: `PAYOUT-${3000 + i}`,
      deliveryPartner: {
        userId: p.id,
        name: {
          firstName: p.firstName,
          lastName: p.lastName,
        },
      },
      amount: +(Math.random() * 800 + 20).toFixed(2),
      payoutMethod: methods[i % methods.length],
      createdAt: new Date(Date.now() - i * 3600 * 1000 * 24),
      updatedAt: new Date(Date.now() - i * 3600 * 1000 * 24),
      status,
      accountHolder: `${p.firstName} ${p.lastName} Owner`,
      iban: i % 3 === 0 ? `PT50${1000000000 + i}` : undefined,
      note: i % 6 === 0 ? "Manual review required" : undefined,
    };
  });
}
