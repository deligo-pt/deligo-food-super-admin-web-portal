import Sponsorships from "@/components/Dashboard/Sponsorships/Sponsorships";
import { TSponsorship } from "@/types/sponsorship.type";

const initialSponsorships: TSponsorship[] = [
  {
    _id: "1",
    name: "AB Company",
    banner: "https://images.pexels.com/photos/842519/pexels-photo-842519.jpeg",
    isActive: true,
    type: "ADS",
    startDate: new Date("2026-01-25"),
    endDate: new Date("2026-08-30"),
    createdAt: new Date("2026-01-22"),
    updatedAt: new Date("2026-01-22"),
  },
  {
    _id: "2",
    name: "SpyX Company",
    banner: "https://images.pexels.com/photos/842519/pexels-photo-842519.jpeg",
    isActive: true,
    type: "ADS",
    startDate: new Date("2026-01-25"),
    endDate: new Date("2026-04-30"),
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    _id: "3",
    name: "XYZ Company",
    banner: "https://images.pexels.com/photos/842519/pexels-photo-842519.jpeg",
    isActive: false,
    type: "ADS",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-06-30"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

export default function SponsorshipPage() {
  return (
    <Sponsorships
      sponsorshipsResult={{
        data: initialSponsorships,
        meta: { limit: 10, page: 1, total: 3, totalPage: 1 },
      }}
      title="All Sponsorships"
      subtitle=" Manage all sponsorships here"
    />
  );
}
