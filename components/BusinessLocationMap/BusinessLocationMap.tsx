/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Map, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { UseFormReturn } from "react-hook-form";

const formFields = [
  {
    label: "Street Address",
    name: "street",
  },
  {
    label: "City",
    name: "city",
  },
  {
    label: "Postal Code",
    name: "postalCode",
  },
  {
    label: "Country",
    name: "country",
  },
];

declare global {
  interface Window {
    google: any;
  }
}

type LocationFormType = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

interface IProps {
  form: UseFormReturn<any>;
  businessLocation?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  setLocationCoordinates: Dispatch<
    SetStateAction<{ latitude: number; longitude: number }>
  >;
}

const defaultLocation = { lat: 38.7223, lng: -9.1393 }; // LISBON

const BusinessLocationMap = ({
  form,
  businessLocation,
  setLocationCoordinates,
}: IProps) => {
  const map = useMap();
  const places = useMapsLibrary("places");
  const markerRef = useRef<any>(null);

  const fillAddressFields = useCallback(
    (components: any[]) => {
      const address: any = {};

      components.forEach((c) => {
        if (c.types.includes("route")) address.street = c.long_name;
        if (c.types.includes("locality")) address.city = c.long_name;
        if (c.types.includes("postal_code")) address.postalCode = c.long_name;
        if (c.types.includes("country")) address.country = c.long_name;
      });

      Object.entries(address).forEach(([key, value]) =>
        form.setValue(key as keyof LocationFormType, (value || "") as string),
      );
    },
    [form],
  );

  useEffect(() => {
    if (!map || !places) return;

    const initialPos = businessLocation?.latitude
      ? {
        lat: businessLocation.latitude,
        lng: businessLocation.longitude,
      }
      : defaultLocation;

    map.setCenter(initialPos);
    map.setZoom(14);

    // Autocomplete
    const input = document.getElementById(
      "autocomplete",
    ) as HTMLInputElement;

    if (input) {
      const autocomplete = new places.Autocomplete(input, {
        fields: ["address_components", "geometry"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const loc = place.geometry.location;

        map.setCenter(loc);
        map.setZoom(17);

        setLocationCoordinates({
          latitude: loc.lat(),
          longitude: loc.lng(),
        });

        fillAddressFields(place.address_components || []);
      });
    }
  }, [map, places, businessLocation, fillAddressFields, setLocationCoordinates]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
        <input
          id="autocomplete"
          type="text"
          placeholder="Search address here..."
          className="pl-10 py-3 rounded-xl border w-full focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Google Map */}
      <div className="w-full h-80 rounded-xl shadow-md border overflow-hidden">
        <Map
          defaultCenter={defaultLocation}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
        >
          <Marker position={defaultLocation} />
        </Map>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        {formFields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as keyof LocationFormType}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder={field.label} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BusinessLocationMap;
