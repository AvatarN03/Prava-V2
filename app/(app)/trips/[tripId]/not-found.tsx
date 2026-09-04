import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TripNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-border bg-card text-center p-6">
        <CardHeader className="pb-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Trip Not Found or Access Denied</CardTitle>
          <CardDescription className="text-xs">
            The trip workspace you are trying to access does not exist, was deleted, or belongs to another user account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button size="sm" asChild>
            <Link href="/trips">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Trips List
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
