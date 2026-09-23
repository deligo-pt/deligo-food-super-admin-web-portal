// components/Zones/ZoneValidationFeedback.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { ValidateBoundaryResponse } from "@/types/zone.type";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type Props = {
  validation: ValidateBoundaryResponse | null;
  isValidating: boolean;
};

export function ZoneValidationFeedback({ validation, isValidating }: Props) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking boundary…
      </div>
    );
  }

  if (!validation) return null;

  const hasOverlaps = validation.overlaps && validation.overlaps.length > 0;

  return (
    <div className="rounded-lg border p-4 space-y-3 text-sm">
      <div className="flex items-center gap-2 flex-wrap">
        {validation.valid ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}

        <span className="font-medium">
          Area: {validation.areaKm2.toFixed(2)} km²
        </span>

        <Badge variant={validation.valid ? "default" : "destructive"}>
          {validation.valid ? "Valid" : "Invalid"}
        </Badge>

        {hasOverlaps && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {validation.overlaps.length} overlap(s)
          </Badge>
        )}
      </div>

      {hasOverlaps && (
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-amber-700 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Overlaps with existing zones:
          </p>
          <ul className="list-disc list-inside text-amber-800 pl-1">
            {validation.overlaps.map((o) => (
              <li key={o.zoneId}>
                <strong>{o.zoneName}</strong> ({o.zoneId}) –{" "}
                {(o.overlapAreaM2 / 1_000_000).toFixed(2)} km²
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.valid && !hasOverlaps && (
        <p className="text-green-700">
          No overlaps — safe to save as an active zone.
        </p>
      )}
    </div>
  );
}