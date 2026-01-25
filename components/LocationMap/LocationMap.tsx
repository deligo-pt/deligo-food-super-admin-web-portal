"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface IProps {
  lat: number;
  lng: number;
}

export default function LocationMap({ lat, lng }: IProps) {
  const position = { lat: lat, lng: lng };
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  return (
    <div className="w-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          <Marker position={position} />
        </Map>
      </APIProvider>
    </div>
  );
}
