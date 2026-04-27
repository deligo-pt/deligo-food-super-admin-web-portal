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

  const initializeMap = useCallback(async () => {
    if (isInitialized.current || !window.google?.maps) return;
    isInitialized.current = true;

    const { Map } = await window.google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } =
      await window.google.maps.importLibrary("marker");
    const { Autocomplete } = await window.google.maps.importLibrary("places");
    const { Geocoder } = await window.google.maps.importLibrary("geocoding");

    const initialPos = businessLocation?.latitude
      ? { lat: businessLocation.latitude, lng: businessLocation.longitude }
      : defaultLocation;

    const map = new Map(mapRef.current as HTMLElement, {
      center: initialPos,
      zoom: 14,
      mapId: "DEMO_MAP_ID", // REQUIRED for AdvancedMarkerElement
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: initialPos,
      gmpDraggable: true,
    });
    markerRef.current = marker;

    const geocoder = new Geocoder();

    /** Autocomplete */
    const input = document.getElementById("autocomplete") as HTMLInputElement;
    const autocomplete = new Autocomplete(input, {
      fields: ["address_components", "geometry", "name"],
      types: ["address"],
    });

    autocomplete.bindTo("bounds", map);

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

    /** Map Click */
    map.addListener("click", async (e: any) => {
      const loc = e.latLng;
      marker.position = loc;
      setLocationCoordinates({ latitude: loc.lat(), longitude: loc.lng() });

      const { results } = await geocoder.geocode({ location: loc });
      if (results && results[0]) {
        fillAddressFields(results[0].address_components);
      }
    });

    if (businessLocation) {
      form.reset({
        street: businessLocation.street || "",
        city: businessLocation.city || "",
        postalCode: businessLocation.postalCode || "",
        country: businessLocation.country || "",
      });
    }
  }, [businessLocation, fillAddressFields, setLocationCoordinates, form]);

  useEffect(() => {
    (window as any).initMapCallback = () => {
      initializeMap();
    };

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_API_URL}"]`,
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = GOOGLE_API_URL;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.google?.maps) {
      initializeMap();
    }
  }, [initializeMap]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
        <input
          id="autocomplete"
          placeholder="Search address here..."
          className="pl-10 py-3 rounded-xl border w-full"
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
