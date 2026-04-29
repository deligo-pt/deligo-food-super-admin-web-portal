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
import { UseFormReturn } from "react-hook-form";

declare global {
  interface Window {
    google: any;
  }
}

type LocationFormType = {
  streetAddress: string;
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

const defaultLocation = { lat: 38.7223, lng: -9.1393 }; // LISBON

const GOOGLE_API_URL = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHT9ARgpTJIEdvsiaD72Gf7SUUXz-Xqfg&libraries=places&loading=async&callback=initMapCallback`;

const BusinessLocationMap = ({
  form,
  businessLocation,
  setLocationCoordinates,
}: IProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const isInitialized = useRef(false);

  const fillAddressFields = useCallback(
    (components: any[]) => {
      const address: any = {};
      components.forEach((c) => {
        if (c.types.includes("route")) address.street = c.long_name;
        if (c.types.includes("street_number"))
          address.streetNumber = c.long_name;
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

  const setupMap = useCallback(async () => {
    if (isInitialized.current || !mapRef.current) return;

    try {
      // 1. Load Libraries
      const { Map } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } =
        await window.google.maps.importLibrary("marker");
      const { Autocomplete } = await window.google.maps.importLibrary("places");
      const { Geocoder } = await window.google.maps.importLibrary("geocoding");

      isInitialized.current = true;

      const initialPos = businessLocation?.latitude
        ? { lat: businessLocation.latitude, lng: businessLocation.longitude }
        : defaultLocation;

      // 2. Initialize Map
      const map = new Map(mapRef.current, {
        center: initialPos,
        zoom: 14,
        mapId: "DEMO_MAP_ID",
      });

      const marker = new AdvancedMarkerElement({
        map,
        position: initialPos,
        gmpDraggable: true,
      });

      const geocoder = new Geocoder();

      // 3. Setup Autocomplete
      const input = document.getElementById("autocomplete") as HTMLInputElement;
      if (input) {
        const autocomplete = new Autocomplete(input, {
          fields: ["address_components", "geometry"],
          types: ["address"],
        });

        // Stop form submission on Enter
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") e.preventDefault();
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;

          const loc = place.geometry.location;
          map.setCenter(loc);
          map.setZoom(17);
          marker.position = loc;

          setLocationCoordinates({ latitude: loc.lat(), longitude: loc.lng() });
          fillAddressFields(place.address_components || []);
        });
      }

      // 4. Map Click Geocoding
      map.addListener("click", async (e: any) => {
        const loc = e.latLng;
        marker.position = loc;
        setLocationCoordinates({ latitude: loc.lat(), longitude: loc.lng() });

        const { results } = await geocoder.geocode({ location: loc });
        if (results?.[0]) {
          fillAddressFields(results[0].address_components);
        }
      });
    } catch (error) {
      console.error("Error loading Google Maps:", error);
    }
  }, [businessLocation, fillAddressFields, setLocationCoordinates]);

  useEffect(() => {
    // Check if script is already there
    if (window.google?.maps) {
      setupMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHT9ARgpTJIEdvsiaD72Gf7SUUXz-Xqfg&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = setupMap;
    document.head.appendChild(script);
  }, [setupMap]);

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

      <div ref={mapRef} className="w-full h-80 rounded-xl shadow-md border" />

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
