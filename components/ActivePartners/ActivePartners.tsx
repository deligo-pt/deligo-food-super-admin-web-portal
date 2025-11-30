"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { Bike, Eye, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const DELIGO = "#DC3173";
const AVATAR = "/mnt/data/Screenshot from 2025-11-21 00-13-57.png";

// type Partner = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   city: string;
//   rating: number;
//   totalDelivered: number;
//   totalEarnings: number;
//   vehicleType: string;
//   activeSince: string;
//   violations?: number;
//   lastOnline?: string;
// };

interface IProps {
  partnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function ActiveDeliveryPartners({ partnersResult }: IProps) {
  const router = useRouter();
  // const [list, setList] = useState<Partner[]>([]);
  // const [query, setQuery] = useState("");
  // const [selected, setSelected] = useState<Partner | null>(null);

  // useEffect(() => {
  //   setList(mockPartners());
  // }, []);

  // const filtered = list.filter((p) =>
  //   [p.name, p.email, p.city, p.phone, p.id]
  //     .join(" ")
  //     .toLowerCase()
  //     .includes(query.toLowerCase())
  // );

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <Bike className="w-8 h-8" style={{ color: DELIGO }} /> Active Delivery
        Partners
      </motion.h1>

      {/* Search bar */}
      {/* <div className="flex items-center gap-3 mb-6 max-w-xl">
        <Input
          placeholder="Search name, phone, city, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button style={{ background: DELIGO }}>
          <Search className="w-4 h-4" />
        </Button>
      </div> */}

      <AllFilters sortOptions={sortOptions} />

      {/* List */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Active Partners</h2>
          <div className="text-sm text-slate-500">
            {partnersResult?.meta?.total} total
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          {partnersResult?.data?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No partners found.
            </div>
          ) : (
            partnersResult?.data?.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar>
                    <AvatarImage src={AVATAR} />
                    <AvatarFallback>
                      {p.name?.firstName || p.name?.lastName
                        ? `${p.name?.firstName?.[0]}${p.name?.lastName?.[0]}`
                        : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {p.name?.firstName} {p.name?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.address?.city}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3" />{" "}
                        {p.operationalData?.rating?.average}
                      </span>

                      <Badge variant="default">
                        {p.vehicleInfo?.vehicleType}
                      </Badge>

                      {/* <span className="text-xs text-slate-400">
                        Violations:{" "}
                        <strong className="text-rose-600">
                          {p.violations ?? 0}
                        </strong>
                      </span> */}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-sm text-slate-500">
                    Delivered: {p.operationalData?.totalDeliveries}
                  </p>
                  <p className="text-sm text-emerald-600 font-bold">
                    € {p.earnings?.totalEarnings?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* <div className="text-xs text-slate-400">
                      {p.lastOnline
                        ? `Online ${timeAgo(p.lastOnline)}`
                        : "Offline"}
                    </div> */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/partners/${p.userId}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {!!partnersResult?.meta?.total && partnersResult?.meta?.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={partnersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      {/* Sidebar */}
      {/* <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-md p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">
              Partner Details
            </SheetTitle>
            <SheetDescription>Full profile information</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={AVATAR} />
                  <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-semibold">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                  <p className="text-sm text-slate-500">{selected.phone}</p>
                </div>
              </div>

              <Separator />

              <Info label="Partner ID" value={selected.id} />
              <Info label="City" value={selected.city} />
              <Info label="Vehicle" value={selected.vehicleType} />
              <Info label="Rating" value={selected.rating} />
              <Info label="Total Delivered" value={selected.totalDelivered} />
              <Info
                label="Total Earnings"
                value={`€ ${selected.totalEarnings.toLocaleString()}`}
              />
              <Info
                label="Active Since"
                value={new Date(selected.activeSince).toLocaleDateString()}
              />
              <Info label="Violations" value={selected.violations ?? 0} />
              <Info
                label="Last Online"
                value={
                  selected.lastOnline
                    ? new Date(selected.lastOnline).toLocaleString()
                    : "—"
                }
              />

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet> */}
    </div>
  );
}

// function initials(name: string) {
//   return name
//     .split(" ")
//     .map((n) => n[0] || "")
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }

// function Info({ label, value }: { label: string; value: any }) {
//   return (
//     <div className="text-sm text-slate-700">
//       <p className="text-[12px] text-slate-500">{label}</p>
//       <p className="font-semibold mt-1 text-slate-800">{value}</p>
//     </div>
//   );
// }

// function timeAgo(iso?: string) {
//   if (!iso) return "";
//   const diff = Date.now() - new Date(iso).getTime();
//   const mins = Math.floor(diff / (1000 * 60));
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m`;
//   const hours = Math.floor(mins / 60);
//   if (hours < 24) return `${hours}h`;
//   const days = Math.floor(hours / 24);
//   return `${days}d`;
// }

// function mockPartners(): Partner[] {
//   const now = Date.now();
//   return [
//     {
//       id: "DP-5001",
//       name: "João Silva",
//       email: "joao@example.com",
//       phone: "+351 910000111",
//       city: "Lisbon",
//       rating: 4.9,
//       totalDelivered: 1280,
//       totalEarnings: 12450,
//       vehicleType: "Bike",
//       activeSince: new Date(now - 86400 * 1000 * 100).toISOString(),
//       violations: 1,
//       lastOnline: new Date(now - 1000 * 60 * 12).toISOString(),
//     },
//     {
//       id: "DP-5002",
//       name: "Maria Fernandes",
//       email: "maria@example.com",
//       phone: "+351 920000222",
//       city: "Porto",
//       rating: 4.7,
//       totalDelivered: 980,
//       totalEarnings: 10230,
//       vehicleType: "Scooter",
//       activeSince: new Date(now - 86400 * 1000 * 80).toISOString(),
//       violations: 0,
//       lastOnline: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
//     },
//     {
//       id: "DP-5003",
//       name: "Rui Costa",
//       email: "rui@example.com",
//       phone: "+351 930000333",
//       city: "Braga",
//       rating: 4.4,
//       totalDelivered: 720,
//       totalEarnings: 7420,
//       vehicleType: "Car",
//       activeSince: new Date(now - 86400 * 1000 * 200).toISOString(),
//       violations: 2,
//       lastOnline: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
//     },
//     {
//       id: "DP-5004",
//       name: "Ana Pereira",
//       email: "ana@example.com",
//       phone: "+351 940000444",
//       city: "Coimbra",
//       rating: 4.8,
//       totalDelivered: 640,
//       totalEarnings: 6230,
//       vehicleType: "Bike",
//       activeSince: new Date(now - 86400 * 1000 * 60).toISOString(),
//       violations: 0,
//       lastOnline: new Date(now - 1000 * 60 * 45).toISOString(),
//     },
//     {
//       id: "DP-5005",
//       name: "Carlos Sousa",
//       email: "carlos@example.com",
//       phone: "+351 950000555",
//       city: "Faro",
//       rating: 4.5,
//       totalDelivered: 540,
//       totalEarnings: 5020,
//       vehicleType: "Van",
//       activeSince: new Date(now - 86400 * 1000 * 30).toISOString(),
//       violations: 0,
//       lastOnline: new Date(now - 1000 * 60 * 5).toISOString(),
//     },
//     {
//       id: "DP-5006",
//       name: "Rita Gomes",
//       email: "rita@example.com",
//       phone: "+351 960000666",
//       city: "Lisbon",
//       rating: 4.6,
//       totalDelivered: 420,
//       totalEarnings: 3890,
//       vehicleType: "Scooter",
//       activeSince: new Date(now - 86400 * 1000 * 14).toISOString(),
//       violations: 0,
//       lastOnline: new Date(now - 1000 * 60 * 90).toISOString(),
//     },
//   ];
// }
