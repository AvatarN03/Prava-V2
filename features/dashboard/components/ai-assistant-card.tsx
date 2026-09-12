import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AiAssistantCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
          <div className="p-1 rounded-sm bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Need help planning?</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Ask Prava AI to suggest efficient transit routes, audit your daily itinerary pacing, or balance your category budget.
        </p>

        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5 border-primary/30 hover:border-primary/60 text-xs font-medium cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Open AI Assistant</span>
        </Button>
      </CardContent>
    </Card>
  );
}
