"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, Filter, MapPin, Bus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useVehicleStore from "@/store/use-vehicle-store";
import TicketSkeleton from "./ticket-skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import BoardingPointsDialog from "./boarding-points-dialog";
import DroppingPointsDialog from "./dropping-points-dialog";
import CancellationPolicyDialog from "./cancellation-policy-dialog";
import BusInfo from "./bus-info";
import SeatLayoutSheet from "./seat-layout-sheet";
import useTicketStore from "@/store/use-ticket-store";
import SearchForm from "@/components/web/bus-tickets/search-form";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const filterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const formatPointTime = (time) => {
  if (!time) return "Time not specified";
  try {
    return format(new Date(time), "hh:mm a");
  } catch (error) {
    return "Invalid time";
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function TicketList({ routeId, date }) {
  const {
    vehicles,
    loading,
    hasMore,
    sortOrder,
    filters,
    fetchVehicles,
    loadMore,
    setSortOrder,
    setFilters,
    reset,
  } = useVehicleStore();

  const { setSelectedVehicle, resetTicketSelection } = useTicketStore();

  // console.log(vehicles);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [showAC, setShowAC] = useState(false);
  const [showSeatLayout, setShowSeatLayout] = useState(false);
  const [selectedVehicle, setSelectedVehicleState] = useState(null);

  const observer = useRef();
  const lastVehicleElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore(routeId, date);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore, routeId, date]
  );

  useEffect(() => {
    reset();
    fetchVehicles(routeId, date);
    return () => reset();
  }, [routeId, date, reset, fetchVehicles]);

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const priceA = a.layout.seaterPrice;
    const priceB = b.layout.seaterPrice;
    return sortOrder === "LOW_TO_HIGH" ? priceA - priceB : priceB - priceA;
  });

  const parseAmenities = (amenitiesString) => {
    try {
      if (!amenitiesString || !amenitiesString.ids || !amenitiesString.ids[0])
        return [];
      return JSON.parse(amenitiesString.ids[0]);
    } catch (e) {
      return [];
    }
  };

  // Filter handlers
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setFilters({ ...filters, priceRange: value });
  };

  const handleAmenityToggle = (amenityId) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((id) => id !== amenityId)
      : [...selectedAmenities, amenityId];
    setSelectedAmenities(newAmenities);
    setFilters({ ...filters, amenities: newAmenities });
  };

  const handleBusTypeToggle = (type) => {
    const newTypes = selectedBusTypes.includes(type)
      ? selectedBusTypes.filter((t) => t !== type)
      : [...selectedBusTypes, type];
    setSelectedBusTypes(newTypes);
    setFilters({ ...filters, busTypes: newTypes });
  };

  const handleACToggle = (checked) => {
    setShowAC(checked);
    setFilters({ ...filters, isAC: checked });
  };

  const handleBookNow = (vehicle) => {
    resetTicketSelection(); // Reset previous selection
    setSelectedVehicleState(vehicle);
    setShowSeatLayout(true);
    // Store vehicle information in ticket store
    setSelectedVehicle(vehicle);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Filters and Sort */}
      <motion.div
        variants={filterVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-xl shadow-lg"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant="outline"
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 px-4 py-1.5 text-sm font-medium"
          >
            {vehicles.length} Buses Found
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortOrder(
                sortOrder === "LOW_TO_HIGH" ? "HIGH_TO_LOW" : "LOW_TO_HIGH"
              )
            }
            className="border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 font-medium"
          >
            Price: {sortOrder === "LOW_TO_HIGH" ? "Low to High" : "High to Low"}
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-yellow-700 dark:text-yellow-400">
                Filter Buses
              </SheetTitle>
              <SheetDescription className="text-yellow-600/80 dark:text-yellow-500/80">
                Customize your search with these filters
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                  Price Range
                </h4>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  min={0}
                  max={5000}
                  step={100}
                  className="w-full [&>[role=slider]]:bg-yellow-500 [&>[role=slider]]:border-yellow-600"
                />
                <div className="flex justify-between text-sm text-yellow-600/80 dark:text-yellow-500/80">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                  Bus Type
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-yellow-600/80 dark:text-yellow-500/80">
                      AC Buses Only
                    </label>
                    <Switch
                      checked={showAC}
                      onCheckedChange={handleACToggle}
                      className="data-[state=checked]:bg-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                  Amenities
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {/* Add your amenities list here */}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Vehicle Cards */}
      <div className="space-y-6">
        <AnimatePresence>
          {!loading && vehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
                <Bus className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Buses Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                We couldn't find any buses for this route on the selected date.
              </p>

              {/* Search Form */}
              <div className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4 text-yellow-500">
                  Try Another Search
                </h4>
                <SearchForm />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Search All Routes
                </Button>
              </div>
            </motion.div>
          ) : (
            sortedVehicles.map((vehicle, index) => {
              const amenities = parseAmenities(vehicle.amenities);
              const schedule = vehicle.schedules[0];
              const departureTime = schedule
                ? new Date(schedule.departureTime)
                : null;
              const arrivalTime = schedule
                ? new Date(schedule.arrivalTime)
                : null;

              return (
                <motion.div
                  key={vehicle.id}
                  ref={
                    index === vehicles.length - 1 ? lastVehicleElementRef : null
                  }
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  onHoverStart={() => setHoveredCard(vehicle.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <Card
                    className={cn(
                      "overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900/50 backdrop-blur-xl",
                      hoveredCard === vehicle.id &&
                        "border-yellow-500/50 dark:border-yellow-500/50 shadow-yellow-500/10"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Bus Info */}
                        <div className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl p-4">
                          <BusInfo vehicle={vehicle} />
                        </div>

                        {/* Time and Route */}
                        <div className="md:col-span-2 bg-yellow-50/30 dark:bg-yellow-900/10 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                            {/* Source City */}
                            <div className="text-center flex-1">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                              >
                                <div className="w-16 h-16 mx-auto rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                                  <MapPin className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                                </div>
                                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-1">
                                  {vehicle?.route?.sourceCity}
                                </h3>
                                <p className="text-sm font-medium text-yellow-600/80 dark:text-yellow-500/80">
                                  {formatPointTime(
                                    vehicle?.route?.boardingPoints?.[0]
                                      ?.arrivalTime
                                  )}
                                </p>
                              </motion.div>
                            </div>

                            {/* Route Line */}
                            <div className="flex-[2] px-4 py-2">
                              <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative flex flex-col items-center justify-center h-full py-4"
                              >
                                <div className="relative w-full">
                                  <div className="h-2 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full shadow-lg" />

                                  {/* Animated Bus */}
                                  <motion.div
                                    initial={{ left: "0%", scale: 0 }}
                                    animate={{ left: "100%", scale: 1 }}
                                    transition={{
                                      duration: 2,
                                      ease: "easeInOut",
                                      repeat: Infinity,
                                      repeatDelay: 1,
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                  >
                                    <div className="bg-white dark:bg-yellow-900/50 p-2 rounded-full shadow-xl">
                                      <Bus className="h-5 w-5 text-yellow-500" />
                                    </div>
                                  </motion.div>
                                </div>

                                <div className="flex items-center justify-between w-full mt-6 space-x-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 whitespace-nowrap"
                                  >
                                    {vehicle?.route?.distance} KM
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 whitespace-nowrap"
                                  >
                                    {formatPointTime(
                                      vehicle?.route?.boardingPoints?.[0]
                                        ?.arrivalTime
                                    )}{" "}
                                    -{" "}
                                    {formatPointTime(
                                      vehicle?.route?.droppingPoints?.[0]
                                        ?.arrivalTime
                                    )}
                                  </Badge>
                                </div>
                              </motion.div>
                            </div>

                            {/* Destination City */}
                            <div className="text-center flex-1">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                              >
                                <div className="w-16 h-16 mx-auto rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                                  <MapPin className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                                </div>
                                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-1">
                                  {vehicle?.route?.destinationCity}
                                </h3>
                                <p className="text-sm font-medium text-yellow-600/80 dark:text-yellow-500/80">
                                  {formatPointTime(
                                    vehicle?.route?.droppingPoints?.[0]
                                      ?.arrivalTime
                                  )}
                                </p>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Book */}
                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl p-4">
                          <div className="text-center md:text-right space-y-3 w-full">
                            {/* Price information */}
                            <div className="space-y-2">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex flex-col items-end"
                              >
                                <div className="flex items-center gap-2 w-full justify-end bg-yellow-100/50 dark:bg-yellow-900/30 p-2 rounded-lg">
                                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                    Seater
                                  </span>
                                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                                    {formatCurrency(vehicle.layout.seaterPrice)}
                                  </p>
                                </div>

                                {vehicle.layout.sleeperPrice && (
                                  <div className="flex items-center gap-2 w-full justify-end bg-yellow-100/50 dark:bg-yellow-900/30 p-2 rounded-lg mt-2">
                                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                      Sleeper
                                    </span>
                                    <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                                      {formatCurrency(
                                        vehicle.layout.sleeperPrice
                                      )}
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            </div>

                            {/* Book Now Button */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full"
                            >
                              <Button
                                onClick={() => handleBookNow(vehicle)}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-black dark:text-white font-medium px-6 py-3 rounded-xl text-lg shadow-lg transition-all duration-300"
                              >
                                Book Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Features */}
                      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <BoardingPointsDialog
                            vehicle={vehicle}
                            formatPointTime={formatPointTime}
                          />
                          <DroppingPointsDialog
                            vehicle={vehicle}
                            formatPointTime={formatPointTime}
                          />
                          <CancellationPolicyDialog />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Loading Skeletons */}
        {loading && (
          <>
            <TicketSkeleton />
            <TicketSkeleton />
            <TicketSkeleton />
          </>
        )}
      </div>

      {selectedVehicle && (
        <SeatLayoutSheet
          vehicle={selectedVehicle}
          isOpen={showSeatLayout}
          onClose={() => {
            setShowSeatLayout(false);
            setSelectedVehicleState(null);
          }}
        />
      )}
    </motion.div>
  );
}
