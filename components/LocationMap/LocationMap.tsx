"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";

interface IProps {
  lat: number;
  lng: number;
}

export default function LocationMap({ lat, lng }: IProps) {
  const position = { lat: lat, lng: lng };

  return (
    <div className="w-full">
      <Map
        defaultCenter={position}
        defaultZoom={15}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        <Marker position={position} />
      </Map>
    </div>
  );
}
