import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Loader2 } from "lucide-react";
import SeatLayout from "./seat-layout";
import BoardingPointSelection from "./boarding-point-selection";
import useTicketStore from "@/store/use-ticket-store";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";

// Format currency in UAH
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
  }).format(amount);
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export default function SeatLayoutSheet({ vehicle, isOpen, onClose }) {
  const [selectedDeck, setSelectedDeck] = useState("lower");
  const [showBoardingPoints, setShowBoardingPoints] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const {
    selectedSeats = [],
    setSelectedSeats,
    setTotalAmount,
    bookingDate,
    setBookingDate,
  } = useTicketStore();

  // Fetch bookings when component mounts or when vehicle/date changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const date = searchParams.get("date");
        if (date && vehicle?.id) {
          setBookingDate(date);
          const response = await api.get(
            `/bookings/vehicle/${vehicle.id}?date=${date}`
          );
          if (response.data.success) {
            setBookings(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch seat availability");
      } finally {
        setLoading(false);
      }
    };

    if (vehicle?.id) {
      fetchBookings();
    }
  }, [vehicle?.id, searchParams, setBookingDate]);

  const handleSeatSelect = (seatKey) => {
    if (!seatKey) return;

    setSelectedSeats((prevSeats) => {
      const isSelected = prevSeats.some((seat) => seat.key === seatKey);
      let newSeats;

      if (isSelected) {
        // Remove the seat if it's already selected
        newSeats = prevSeats.filter((seat) => seat.key !== seatKey);
      } else {
        // Add the seat if it's not selected and we haven't reached the limit
        if (prevSeats.length >= 4) {
          toast.error("You can only select up to 4 seats");
          return prevSeats;
        }

        const seatInfo = vehicle.layout.layoutJson.seats[seatKey];
        if (!seatInfo) return prevSeats;

        const price =
          seatInfo.type === "SLEEPER"
            ? Number(vehicle.layout.sleeperPrice)
            : Number(vehicle.layout.seaterPrice);

        newSeats = [...prevSeats, { key: seatKey, type: seatInfo.type, price }];
      }

      // Calculate total amount
      const total = newSeats.reduce((acc, seat) => acc + seat.price, 0);
      setTotalAmount(total);

      return newSeats;
    });
  };

  const calculateTotalPrice = (seats = []) => {
    if (!Array.isArray(seats)) return 0;

    let total = 0;
    seats.forEach((seat) => {
      const seatInfo = vehicle?.layout?.layoutJson?.seats?.[seat.key];
      if (seatInfo) {
        if (seatInfo.type === "SLEEPER") {
          total += Number(vehicle?.layout?.sleeperPrice) || 0;
        } else {
          total += Number(vehicle?.layout?.seaterPrice) || 0;
        }
      }
    });
    return total;
  };

  const handleContinue = () => {
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) return;
    setShowBoardingPoints(true);
  };

  const handleCloseBoardingPoints = () => {
    setShowBoardingPoints(false);
  };

  // Render selected seats badges with enhanced design
  const renderSelectedSeats = () => {
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground text-center py-4"
        >
          No seats selected yet
        </motion.p>
      );
    }

    return (
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {selectedSeats.map((seat) => {
          const seatInfo = vehicle?.layout?.layoutJson?.seats?.[seat.key];
          if (!seatInfo) return null;

          const price =
            seatInfo.type === "SLEEPER"
              ? vehicle?.layout?.sleeperPrice
              : vehicle?.layout?.seaterPrice;

          return (
            <motion.div
              key={seat.key}
              variants={itemVariants}
              className="flex items-center justify-between bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-lg"
            >
              <Badge
                className="bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer transition-colors duration-200"
                onClick={() => handleSeatSelect(seat.key)}
              >
                Seat {seatInfo.number} ({seatInfo.type})
              </Badge>
              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                {formatCurrency(price)}
              </span>
            </motion.div>
          );
        })}
        <motion.div
          variants={itemVariants}
          className="pt-3 mt-3 border-t border-yellow-200 dark:border-yellow-800 flex justify-between items-center"
        >
          <span className="font-medium text-yellow-700 dark:text-yellow-400">
            Total Amount:
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            {formatCurrency(calculateTotalPrice(selectedSeats))}
          </span>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <Sheet open={isOpen && !showBoardingPoints} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-full flex flex-col"
          >
            <SheetHeader className="space-y-2 text-center">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Select Your Seats
              </SheetTitle>
              <SheetDescription className="flex items-center justify-center gap-2">
                <span>Maximum 4 seats can be selected</span>
                {Array.isArray(selectedSeats) && selectedSeats.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  >
                    Selected: {selectedSeats.length}
                  </Badge>
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 py-6">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full space-y-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-8 h-8 text-yellow-500" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    Loading seat availability...
                  </p>
                </motion.div>
              ) : (
                <>
                  {vehicle?.layout?.hasUpperDeck ? (
                    <Tabs
                      defaultValue="lower"
                      className="w-full"
                      onValueChange={setSelectedDeck}
                    >
                      <TabsList className="w-full grid grid-cols-2 mb-6">
                        <TabsTrigger
                          value="lower"
                          className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black transition-all duration-200"
                        >
                          <Bus className="w-4 h-4 mr-2" />
                          Lower Deck
                        </TabsTrigger>
                        <TabsTrigger
                          value="upper"
                          className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black transition-all duration-200"
                        >
                          <Bus className="w-4 h-4 mr-2" />
                          Upper Deck
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="lower">
                        <SeatLayout
                          layout={vehicle?.layout?.layoutJson}
                          deck="lower"
                          selectedSeats={selectedSeats}
                          onSeatSelect={handleSeatSelect}
                          vehicle={vehicle}
                          bookings={bookings}
                          bookingDate={bookingDate}
                        />
                      </TabsContent>
                      <TabsContent value="upper">
                        <SeatLayout
                          layout={vehicle?.layout?.layoutJson}
                          deck="upper"
                          selectedSeats={selectedSeats}
                          onSeatSelect={handleSeatSelect}
                          vehicle={vehicle}
                          bookings={bookings}
                          bookingDate={bookingDate}
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <SeatLayout
                      layout={vehicle?.layout?.layoutJson}
                      deck="lower"
                      selectedSeats={selectedSeats}
                      onSeatSelect={handleSeatSelect}
                      vehicle={vehicle}
                      bookings={bookings}
                      bookingDate={bookingDate}
                    />
                  )}
                </>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-xl p-6 shadow-lg"
              >
                <h3 className="font-medium mb-4 text-yellow-700 dark:text-yellow-400">
                  Selected Seats
                </h3>
                <div className="flex flex-col gap-2">
                  {renderSelectedSeats()}
                </div>
              </motion.div>
            </div>

            <SheetFooter className="mt-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  onClick={handleContinue}
                  disabled={
                    !Array.isArray(selectedSeats) || selectedSeats.length === 0
                  }
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium shadow-lg transition-all duration-300"
                >
                  Continue Booking
                </Button>
              </motion.div>
            </SheetFooter>
          </motion.div>
        </SheetContent>
      </Sheet>

      <BoardingPointSelection
        isOpen={showBoardingPoints}
        onClose={handleCloseBoardingPoints}
        vehicle={vehicle}
      />
    </>
  );
}
