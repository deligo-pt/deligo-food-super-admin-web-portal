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
    latitude: number;
    longitude: number;
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

const GOOGLE_API_URL = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHT9ARgpTJIEdvsiaD72Gf7SUUXz-Xqfg&libraries=places`;

const BusinessLocationMap = ({
  form,
  businessLocation,
  setLocationCoordinates,
}: IProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  /** --- Extract and Set Address Fields --- */
  const fillAddressFields = useCallback(
    (components: any[]) => {
      const address: any = {};
      components.forEach((c) => {
        if (c.types.includes("route")) address.streetAddress = c.long_name;
        if (c.types.includes("street_number"))
          address.streetNumber = c.long_name;
        if (c.types.includes("locality")) address.city = c.long_name;
        if (c.types.includes("postal_code")) address.postalCode = c.long_name;
        if (c.types.includes("country")) address.country = c.long_name;
      });

      Object.entries(address).forEach(([key, value]) =>
        form.setValue(key as keyof LocationFormType, (value || "") as string)
      );
    },
    [form]
  );

  /** --- Update Marker Position --- */
  const updateMarker = useCallback((map: any, location: any) => {
    markerRef.current.setPosition(location);
    map.setCenter(location);
    map.setZoom(15);
  }, []);

  /** --- Initialize Google Map & Autocomplete --- */
  const initializeMap = useCallback(async () => {
    if (!window.google?.maps) return;

    const defaultLocation = { lat: 40.4168, lng: -3.7038 }; // Madrid
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
    });

    geocoderRef.current = new window.google.maps.Geocoder();

    markerRef.current = new window.google.maps.Marker({
      map,
      position: defaultLocation,
      animation: window.google.maps.Animation.DROP,
    });

    /** Autocomplete */
    const input = document.getElementById("autocomplete") as HTMLInputElement;
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      fields: ["address_components", "geometry"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const loc = place.geometry.location;

      setLocationCoordinates({ latitude: loc.lat(), longitude: loc.lng() });
      updateMarker(map, loc);
      fillAddressFields(place.address_components);
    });

    /** On Map Click */
    map.addListener("click", (e: any) => {
      const loc = e.latLng;
      setLocationCoordinates({ latitude: loc.lat(), longitude: loc.lng() });

      geocoderRef.current.geocode(
        { location: loc },
        (results: any, status: string) => {
          if (status === "OK" && results[0]) {
            updateMarker(map, loc);
            fillAddressFields(results[0].address_components);
          }
        }
      );
    });

    if (businessLocation) {
      const loc = businessLocation;
      form.reset({
        streetAddress: loc.street || "",
        city: loc.city || "",
        postalCode: loc.postalCode || "",
        country: loc.country || "",
      });

      if (loc.latitude && loc.longitude) {
        const savedLoc = new window.google.maps.LatLng(
          loc.latitude,
          loc.longitude
        );
        setLocationCoordinates({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
        updateMarker(map, savedLoc);
      }
    }
  }, [
    businessLocation,
    fillAddressFields,
    form,
    setLocationCoordinates,
    updateMarker,
  ]);

  /** --- Load Google Maps Script Once --- */
  useEffect(() => {
    if (document.querySelector(`script[src="${GOOGLE_API_URL}"]`)) {
      Promise.resolve().then(() => initializeMap());

      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_API_URL;
    script.async = true;
    script.onload = () => {
      // Defer this as well
      Promise.resolve().then(() => initializeMap());
    };
    document.body.appendChild(script);
  }, [initializeMap]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
        <input
          id="autocomplete"
          placeholder="Search your business address..."
          className="pl-10 py-3 rounded-xl border w-full"
        />
      </div>

      <div ref={mapRef} className="w-full h-80 rounded-xl shadow-md border" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
