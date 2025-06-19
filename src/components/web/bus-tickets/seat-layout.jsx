import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Armchair, Bed } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SeatLayout({
  layout,
  deck,
  selectedSeats = [],
  onSeatSelect,
  vehicle,
  bookings = [],
  bookingDate,
}) {
  console.log(layout);
  const rows = layout?.rows || [];
  const seats = layout?.seats || {};

  const isSeatBooked = (seatKey) => {
    if (!bookings || !bookingDate) return false;

    return bookings.some((booking) => {
      const bookingDateStr = new Date(booking.bookingDate).toDateString();
      const selectedDateStr = new Date(bookingDate).toDateString();

      if (bookingDateStr !== selectedDateStr) return false;

      return booking.seatNumbers.some((seat) => seat.key === seatKey);
    });
  };

  const handleSeatClick = (seatKey, seatInfo) => {
    if (!seatInfo) return;

    if (isSeatBooked(seatKey)) return;

    onSeatSelect(seatKey);
  };

  const getSeatStatus = (seatKey, seatInfo) => {
    if (!seatInfo) return "empty";
    if (isSeatBooked(seatKey)) return "booked";
    if (selectedSeats.some((seat) => seat.key === seatKey)) return "selected";
    return "available";
  };

  return (
    <div className="p-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border-2 border-yellow-500 flex items-center justify-center">
            <Armchair className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-yellow-500 flex items-center justify-center">
            <Armchair className="w-5 h-5 text-black" />
          </div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border-2 border-yellow-500 flex items-center justify-center">
            <Bed className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-sm">Sleeper</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <Armchair className="w-5 h-5 text-zinc-500" />
          </div>
          <span className="text-sm">Booked</span>
        </div>
      </div>

      {/* Bus Front */}
      <div className="relative mb-8">
        <div className="w-32 h-16 mx-auto bg-yellow-500/10 border-2 border-yellow-500 rounded-t-3xl flex items-center justify-center">
          <span className="text-sm font-medium text-yellow-500">Front</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid gap-4 justify-center">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 justify-center">
            {row.map((seatType, colIndex) => {
              const seatKey = `${deck}-${rowIndex}-${colIndex}`;
              const seatInfo = seats[seatKey];

              if (!seatInfo || seatInfo.deck.toLowerCase() !== deck) {
                return <div key={colIndex} className="w-8 h-8" />;
              }

              const status = getSeatStatus(seatKey, seatInfo);
              const isSleeper = seatInfo.type === "SLEEPER";

              return (
                <TooltipProvider key={colIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={
                          status === "available" ? { scale: 1.1 } : {}
                        }
                        whileTap={status === "available" ? { scale: 0.9 } : {}}
                        onClick={() => handleSeatClick(seatKey, seatInfo)}
                        disabled={status === "booked"}
                        className={cn(
                          "relative transition-all duration-200 p-1",
                          isSleeper ? "w-16 h-10" : "w-10 h-10",
                          "rounded-md border-2",
                          status === "booked" &&
                            "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 cursor-not-allowed",
                          status === "selected" &&
                            "bg-yellow-500 border-yellow-500",
                          status === "available" &&
                            "border-yellow-500 hover:border-yellow-600"
                        )}
                      >
                        {isSleeper ? (
                          <Bed
                            className={cn(
                              "w-7 h-7",
                              status === "selected"
                                ? "text-black"
                                : "text-yellow-500",
                              status === "booked" && "text-zinc-500"
                            )}
                          />
                        ) : (
                          <Armchair
                            className={cn(
                              "w-7 h-7",
                              status === "selected"
                                ? "text-black"
                                : "text-yellow-500",
                              status === "booked" && "text-zinc-500"
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "absolute -top-4 -right-2 w-7 h-7 flex items-center justify-center text-[10px] font-bold rounded-full",
                            status === "selected"
                              ? "bg-black text-yellow-500"
                              : "bg-yellow-500 text-black"
                          )}
                        >
                          {seatInfo.number}
                        </span>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-yellow-500 text-black border-none"
                    >
                      <div className="text-center">
                        <p className="font-bold">Seat {seatInfo.number}</p>
                        <p className="text-xs">{seatInfo.type}</p>
                        <p className="text-xs font-medium">
                          {isSleeper ? "Sleeper Berth" : "Regular Seat"}
                        </p>
                        <p className="text-xs font-medium">
                          Price: ৳
                          {isSleeper
                            ? vehicle?.layout?.sleeperPrice
                            : vehicle?.layout?.seaterPrice}
                        </p>
                        {status === "booked" && (
                          <p className="text-xs font-medium text-red-800">
                            Already Booked
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>

      {/* Aisle Label */}
      <div className="mt-2 text-center">
        <div className="w-32 mx-auto border-t-2 border-dashed border-yellow-500 pt-2">
          <span className="text-sm text-yellow-500 font-medium">Aisle</span>
        </div>
      </div>
    </div>
  );
}
