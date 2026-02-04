import { TVehicleType } from "@/types/delivery-partner.type";
import { Bike, Car, Motorbike } from "lucide-react";

interface IProps {
  type: TVehicleType;
}

export default function VehicleIcon({ type }: IProps) {
  switch (type) {
    case "BICYCLE":
    case "E-BIKE":
    case "SCOOTER":
      return <Bike size={14} className="text-green-500" />;

    case "MOTORBIKE":
      return <Motorbike size={14} className="text-blue-500" />;

    case "CAR":
      return <Car size={14} className="text-purple-500" />;

    default:
      return <Bike size={14} className="text-purple-500" />;
  }
}
