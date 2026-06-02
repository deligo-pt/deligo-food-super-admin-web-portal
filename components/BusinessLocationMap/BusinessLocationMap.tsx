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
  useState,
} from "react";
import {
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { UseFormReturn } from "react-hook-form";

const formFields = [
  { label: "Street Address", name: "street" },
  { label: "City", name: "city" },
  { label: "Postal Code", name: "postalCode" },
  { label: "Country", name: "country" },
  { label: "Latitude", name: "latitude" },
  { label: "Longitude", name: "longitude" },
];

type LocationFormType = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
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

const defaultLocation = { lat: 38.7223, lng: -9.1393 };

const BusinessLocationMap = ({
  form,
  businessLocation,
  setLocationCoordinates,
}: IProps) => {
  const map = useMap();
  const places = useMapsLibrary("places");

  const inputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({
    lat: businessLocation?.latitude ?? defaultLocation.lat,
    lng: businessLocation?.longitude ?? defaultLocation.lng,
  });

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

  // Reverse geocode (for map drag/select)
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        fillAddressFields(results[0].address_components);
      }
    });
  }, [fillAddressFields]);

  // SEARCH + INIT AUTOCOMPLETE
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "address_components"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const newPos = { lat, lng };

      setPosition(newPos);
      setLocationCoordinates({ latitude: lat, longitude: lng });

      form.setValue("latitude", lat);
      form.setValue("longitude", lng);

      map?.panTo(newPos);
      map?.setZoom(16);

      fillAddressFields(place.address_components || []);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }, [places, map, fillAddressFields, setLocationCoordinates, form]);


  return (
    <div className="space-y-6">

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search address here..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="pl-10 py-3 rounded-xl border w-full focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* MAP */}
      <div className="w-full h-80 rounded-xl shadow-md border overflow-hidden">
        <Map
          defaultCenter={position}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          onClick={(event) => {
            if (!event.detail?.latLng) return;

            const lat = event.detail.latLng.lat;
            const lng = event.detail.latLng.lng;

            setPosition({ lat, lng });

            setLocationCoordinates({
              latitude: lat,
              longitude: lng,
            });

            form.setValue("latitude", lat);
            form.setValue("longitude", lng);

            reverseGeocode(lat, lng);
          }}
        >
          <Marker position={position} />
        </Map>
      </div>

      {/* FORM (READ ONLY) */}
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
                  <Input
                    {...formField}
                    readOnly={
                      field.name === "latitude" ||
                      field.name === "longitude"
                    }
                  />
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