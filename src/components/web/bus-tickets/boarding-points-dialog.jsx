import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin } from "lucide-react";

export default function BoardingPointsDialog({ vehicle, formatPointTime }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Boarding Points ({vehicle?.route?.boardingPoints?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Boarding Points</DialogTitle>
          <DialogDescription>
            Available boarding points for this bus
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {vehicle?.route?.boardingPoints?.length > 0 ? (
            vehicle?.route?.boardingPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium">{point.locationName}</h4>
                  <p className="text-sm text-yellow-500 font-medium">
                    {formatPointTime(point.arrivalTime)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No boarding points available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
