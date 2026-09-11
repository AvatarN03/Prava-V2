"use client";

import { Plus, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accommodation } from "@prisma/client";
import { AccommodationCard } from "./accommodation-card";
import { AddAccommodationDialog } from "./add-accommodation-dialog";

interface AccommodationListProps {
  tripId: string;
  items: Accommodation[];
}

export function AccommodationList({ tripId, items }: AccommodationListProps) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <BedDouble className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No accommodations added</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Keep hotel reservations, Airbnb details, check-in instructions, and contact info in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <AddAccommodationDialog
            tripId={tripId}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Stay
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Stays & Lodgings ({items.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Hotels, apartments, and check-in confirmation records.
          </p>
        </div>
        <AddAccommodationDialog tripId={tripId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <AccommodationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
