"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import {
  Plus,
  Minus,
  Bus,
  Armchair,
  BedDouble,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

import api from "@/lib/axios";
import Link from "next/link";
import { BreadcrumbNav } from "@/components/ui/breadcrumb";

// Form validation schema
const formSchema = z.object({
  layoutName: z.string().min(2, "Layout name must be at least 2 characters"),
  totalSeats: z.coerce.number().min(1, "Total seats must be at least 1"),
  sleeperSeats: z.coerce.number().min(0, "Sleeper seats cannot be negative"),
  seaterSeats: z.coerce.number().min(0, "Seater seats cannot be negative"),
  hasUpperDeck: z.boolean().default(false),
  upperDeckSeats: z.coerce
    .number()
    .min(0, "Upper deck seats cannot be negative"),
  sleeperPrice: z.coerce.number().positive("Sleeper price must be positive"),
  seaterPrice: z.coerce.number().positive("Seater price must be positive"),
  rowCount: z.coerce.number().min(1, "Row count must be at least 1"),
  columnCount: z.coerce.number().min(1, "Column count must be at least 1"),
  isActive: z.boolean().default(true),
  layoutJson: z
    .object({
      rows: z.array(z.array(z.string().nullable())),
      seats: z.record(
        z.object({
          type: z.enum(["SEAT", "SLEEPER"]),
          number: z.string(),
          deck: z.enum(["LOWER", "UPPER"]),
        })
      ),
    })
    .optional(),
});

// Add these styles at the top of the component
const seatStyles = {
  base: "relative flex items-center justify-center w-14 h-14 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none hover:scale-105",
  empty:
    "border-dashed border-gray-200 hover:border-yellow-500/50 dark:border-gray-700 dark:hover:border-yellow-400 hover:bg-yellow-50/50 dark:hover:bg-yellow-400/10",
  seat: "bg-yellow-50 border-yellow-500 hover:bg-yellow-100 dark:bg-yellow-400/20 dark:border-yellow-400 dark:hover:bg-yellow-400/30 shadow-sm",
  sleeper:
    "bg-blue-50 border-blue-500 hover:bg-blue-100 dark:bg-blue-400/20 dark:border-blue-400 dark:hover:bg-blue-400/30 shadow-sm",
  selected:
    "ring-2 ring-offset-2 ring-yellow-500 dark:ring-yellow-400 dark:ring-offset-gray-900 transform scale-105",
};

// Add seat type options
const seatTypes = [
  {
    id: "SEAT",
    label: "Seater",
    icon: Armchair,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-500/10",
  },
  {
    id: "SLEEPER",
    label: "Sleeper",
    icon: BedDouble,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
  },
];

export default function CreateBusLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState("SEAT"); // SEAT, SLEEPER
  const [currentDeck, setCurrentDeck] = useState("LOWER"); // LOWER, UPPER
  const [layout, setLayout] = useState({
    lower: Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => null)
    ),
    upper: Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => null)
    ),
  });
  const [seatNumbers, setSeatNumbers] = useState({
    lower: {
      seater: { start: 1, current: 1 },
      sleeper: { start: 1, current: 1 },
    },
    upper: {
      seater: { start: 1, current: 1 },
      sleeper: { start: 1, current: 1 },
    },
  });

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      layoutName: "",
      totalSeats: 0,
      sleeperSeats: 0,
      seaterSeats: 0,
      hasUpperDeck: false,
      upperDeckSeats: 0,
      sleeperPrice: 0,
      seaterPrice: 0,
      rowCount: 4,
      columnCount: 4,
      isActive: true,
    },
  });

  // Watch for changes in row and column count
  const rowCount = form.watch("rowCount");
  const columnCount = form.watch("columnCount");
  const hasUpperDeck = form.watch("hasUpperDeck");

  // Update layout when row or column count changes
  useEffect(() => {
    const createEmptyLayout = (rows, cols) =>
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => null)
      );

    setLayout({
      lower: createEmptyLayout(rowCount, columnCount),
      upper: createEmptyLayout(rowCount, columnCount),
    });

    // Reset seat numbers when layout changes
    resetSeatNumbers();
  }, [rowCount, columnCount]);

  // Handle seat click
  const handleSeatClick = (deck, rowIndex, colIndex) => {
    const newLayout = {
      ...layout,
      [deck.toLowerCase()]: layout[deck.toLowerCase()].map((row, r) =>
        r === rowIndex
          ? row.map((cell, c) =>
              c === colIndex
                ? cell === null
                  ? {
                      type: selectedSeatType,
                      number: getNextSeatNumber(deck, selectedSeatType),
                      deck: deck,
                    }
                  : null
                : cell
            )
          : row
      ),
    };
    setLayout(newLayout);

    // Update form values
    const totalSeater = countSeats(newLayout, "SEAT");
    const totalSleeper = countSeats(newLayout, "SLEEPER");
    form.setValue("seaterSeats", totalSeater);
    form.setValue("sleeperSeats", totalSleeper);
    form.setValue("totalSeats", totalSeater + totalSleeper);
    if (hasUpperDeck) {
      form.setValue(
        "upperDeckSeats",
        countSeats(newLayout, "SEAT", "UPPER") +
          countSeats(newLayout, "SLEEPER", "UPPER")
      );
    }
  };

  // Count seats by type and deck
  const countSeats = (layout, type, deck = null) => {
    let count = 0;
    const decks = deck ? [deck.toLowerCase()] : ["lower", "upper"];

    decks.forEach((d) => {
      layout[d].forEach((row) => {
        row.forEach((seat) => {
          if (seat && seat.type === type) {
            count++;
          }
        });
      });
    });

    return count;
  };

  // Add this function after the countSeats function
  const getNextSeatNumber = (deck, type) => {
    const prefix = deck === "UPPER" ? "U" : "L";
    const typePrefix = type === "SEAT" ? "S" : "B"; // S for Seater, B for Berth/Sleeper
    const currentNumber = seatNumbers[deck.toLowerCase()][
      type === "SEAT" ? "seater" : "sleeper"
    ].current++;

    return `${prefix}${typePrefix}${currentNumber.toString().padStart(2, "0")}`;
  };

  // Add a reset numbering function
  const resetSeatNumbers = () => {
    setSeatNumbers({
      lower: {
        seater: { start: 1, current: 1 },
        sleeper: { start: 1, current: 1 },
      },
      upper: {
        seater: { start: 1, current: 1 },
        sleeper: { start: 1, current: 1 },
      },
    });
  };

  // Handle row count change
  const handleRowChange = (change) => {
    const newRowCount = Math.max(1, Math.min(15, rowCount + change));
    if (newRowCount !== rowCount) {
      form.setValue("rowCount", newRowCount);
    }
  };

  // Handle column count change
  const handleColumnChange = (change) => {
    const newColumnCount = Math.max(1, Math.min(6, columnCount + change));
    if (newColumnCount !== columnCount) {
      form.setValue("columnCount", newColumnCount);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Convert layout object to array format
      const lowerDeckRows = [];
      const upperDeckRows = [];
      const layoutSeats = {};

      let totalSeaterCount = 0;
      let totalSleeperCount = 0;
      let upperDeckCount = 0;

      // Process lower deck
      layout.lower.forEach((row, rowIndex) => {
        const currentRow = [];
        row.forEach((seat, colIndex) => {
          if (seat) {
            const seatKey = `lower-${rowIndex}-${colIndex}`;
            layoutSeats[seatKey] = {
              type: seat.type,
              number: seat.number,
              deck: "LOWER",
            };
            if (seat.type === "SEAT") totalSeaterCount++;
            if (seat.type === "SLEEPER") totalSleeperCount++;
          }
          currentRow.push(seat ? seat.type : null);
        });
        lowerDeckRows.push(currentRow);
      });

      // Process upper deck if enabled
      if (data.hasUpperDeck) {
        layout.upper.forEach((row, rowIndex) => {
          const currentRow = [];
          row.forEach((seat, colIndex) => {
            if (seat) {
              const seatKey = `upper-${rowIndex}-${colIndex}`;
              layoutSeats[seatKey] = {
                type: seat.type,
                number: seat.number,
                deck: "UPPER",
              };
              if (seat.type === "SEAT") totalSeaterCount++;
              if (seat.type === "SLEEPER") totalSleeperCount++;
              upperDeckCount++;
            }
            currentRow.push(seat ? seat.type : null);
          });
          upperDeckRows.push(currentRow);
        });
      }

      // Prepare layout data
      const layoutData = {
        ...data,
        seaterSeats: totalSeaterCount,
        sleeperSeats: totalSleeperCount,
        totalSeats: totalSeaterCount + totalSleeperCount,
        upperDeckSeats: upperDeckCount,
        layoutJson: {
          rows: [...lowerDeckRows, ...(data.hasUpperDeck ? upperDeckRows : [])],
          seats: layoutSeats,
        },
      };

      // Validate the data before sending
      const validatedData = formSchema.parse(layoutData);

      const response = await api.post("/bus-layouts", validatedData);

      if (response.data.success) {
        toast.success("Bus layout created successfully");
        router.push("/admin/bus-layouts");
      } else {
        throw new Error(response.data.message || "Failed to create bus layout");
      }
    } catch (error) {
      console.error("Error creating layout:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create bus layout"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-1 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <BreadcrumbNav
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Bus Layouts", href: "/admin/bus-layouts" },
              { label: "Create Layout" },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Create Bus Layout
          </h1>
          <p className="text-muted-foreground mt-1">
            Design your bus layout by configuring seats and sleepers
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info Card */}
          <Card className="border-yellow-100 dark:border-yellow-900/50">
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="layoutName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Volvo 9400 2x2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your layout a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Disable to hide this layout from being used
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasUpperDeck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Upper Deck</FormLabel>
                        <FormDescription>
                          Enable if bus has an upper deck
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Configuration Card */}
          <Card className="border-yellow-100 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                  Layout Configuration
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column - Row & Column Controls */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                        Grid Size
                      </h4>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-yellow-700 dark:text-yellow-400">
                          Rows
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRowChange(-1)}
                            className="border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10"
                          >
                            <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </Button>
                          <span className="w-12 text-center font-medium text-yellow-700 dark:text-yellow-400">
                            {rowCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRowChange(1)}
                            className="border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10"
                          >
                            <Plus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-yellow-700 dark:text-yellow-400">
                          Columns
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleColumnChange(-1)}
                            className="border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10"
                          >
                            <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </Button>
                          <span className="w-12 text-center font-medium text-yellow-700 dark:text-yellow-400">
                            {columnCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleColumnChange(1)}
                            className="border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10"
                          >
                            <Plus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Price Controls */}
                  <div className="space-y-6">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                      Pricing
                    </h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seaterPrice"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormLabel className="w-24 text-yellow-700 dark:text-yellow-400">
                                Seater
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="border-yellow-200 focus-visible:ring-yellow-500 dark:border-yellow-800 dark:focus-visible:ring-yellow-400 dark:bg-gray-950 dark:text-yellow-400 dark:placeholder-yellow-400/50"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 dark:text-red-400 ml-28" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sleeperPrice"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormLabel className="w-24 text-yellow-700 dark:text-yellow-400">
                                Sleeper
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="border-yellow-200 focus-visible:ring-yellow-500 dark:border-yellow-800 dark:focus-visible:ring-yellow-400 dark:bg-gray-950 dark:text-yellow-400 dark:placeholder-yellow-400/50"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 dark:text-red-400 ml-28" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Designer Card */}
          <Card className="border-yellow-100 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    Seat Designer
                  </h3>
                  <div className="flex items-center gap-4">
                    {seatTypes.map((type) => (
                      <Button
                        key={type.id}
                        type="button"
                        variant="outline"
                        className={cn(
                          "gap-2 border-yellow-200 dark:border-yellow-800",
                          selectedSeatType === type.id
                            ? "bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-400/20 dark:border-yellow-400 dark:text-yellow-400"
                            : "hover:border-yellow-500 hover:bg-yellow-50 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10"
                        )}
                        onClick={() => setSelectedSeatType(type.id)}
                      >
                        <type.icon className={cn("h-4 w-4", type.color)} />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Tabs
                  defaultValue="LOWER"
                  value={currentDeck}
                  onValueChange={setCurrentDeck}
                  className="w-full"
                >
                  <TabsList className="w-full bg-yellow-50 dark:bg-yellow-400/10">
                    <TabsTrigger
                      value="LOWER"
                      className="w-full data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-400 dark:data-[state=active]:text-gray-900"
                    >
                      Lower Deck
                    </TabsTrigger>
                    {hasUpperDeck && (
                      <TabsTrigger
                        value="UPPER"
                        className="w-full data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-400 dark:data-[state=active]:text-gray-900"
                      >
                        Upper Deck
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="LOWER" className="mt-4">
                    <div className="relative p-6 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-800">
                      <div className="absolute left-2 top-2 p-2 bg-yellow-50 dark:bg-yellow-400/10 rounded-md">
                        <Bus className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                      </div>
                      <div
                        className="grid gap-4 justify-center"
                        style={{
                          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        }}
                      >
                        {layout.lower.map((row, rowIndex) =>
                          row.map((seat, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={cn(
                                seatStyles.base,
                                !seat
                                  ? seatStyles.empty
                                  : seat.type === "SEAT"
                                  ? seatStyles.seat
                                  : seatStyles.sleeper,
                                "hover:scale-105 transition-transform"
                              )}
                              onClick={() =>
                                handleSeatClick("LOWER", rowIndex, colIndex)
                              }
                            >
                              {seat && (
                                <>
                                  {seat.type === "SEAT" ? (
                                    <Armchair className="w-5 h-5" />
                                  ) : (
                                    <BedDouble className="w-5 h-5" />
                                  )}
                                  <span className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 border rounded-full w-6 h-6 text-[10px] font-medium flex items-center justify-center shadow-sm">
                                    {seat.number}
                                  </span>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  {hasUpperDeck && (
                    <TabsContent value="UPPER" className="mt-4">
                      <div className="relative p-6 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-800">
                        <div className="absolute left-2 top-2 p-2 bg-yellow-50 dark:bg-yellow-400/10 rounded-md">
                          <Bus className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <div
                          className="grid gap-4 justify-center"
                          style={{
                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                          }}
                        >
                          {layout.upper.map((row, rowIndex) =>
                            row.map((seat, colIndex) => (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className={cn(
                                  seatStyles.base,
                                  !seat
                                    ? seatStyles.empty
                                    : seat.type === "SEAT"
                                    ? seatStyles.seat
                                    : seatStyles.sleeper,
                                  "hover:scale-105 transition-transform"
                                )}
                                onClick={() =>
                                  handleSeatClick("UPPER", rowIndex, colIndex)
                                }
                              >
                                {seat && (
                                  <>
                                    {seat.type === "SEAT" ? (
                                      <Armchair className="w-5 h-5" />
                                    ) : (
                                      <BedDouble className="w-5 h-5" />
                                    )}
                                    <span className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 border rounded-full w-6 h-6 text-[10px] font-medium flex items-center justify-center shadow-sm">
                                      {seat.number}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                      Seat Count
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-800 dark:bg-yellow-400/10">
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          Seater
                        </div>
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {form.watch("seaterSeats")}
                        </div>
                      </div>
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-800 dark:bg-yellow-400/10">
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          Sleeper
                        </div>
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {form.watch("sleeperSeats")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Layout"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
