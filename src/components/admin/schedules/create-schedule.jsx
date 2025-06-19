"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Form validation schema
const formSchema = z
  .object({
    routeId: z.string().min(1, "Route is required"),
    vehicleId: z.string().min(1, "Vehicle is required"),
    departureTime: z.string().min(1, "Departure time is required"),
    arrivalTime: z.string().min(1, "Arrival time is required"),
    busType: z.enum(["AC_SLEEPER", "NON_AC_SLEEPER", "AC_SEATER"]),
    departureDate: z.string().min(1, "Departure date is required"),
    arrivalDate: z.string().min(1, "Arrival date is required"),
    availableSeats: z.number().int().min(0).default(0),
    status: z.enum(["ACTIVE", "CANCELLED", "COMPLETED"]).default("ACTIVE"),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const departureDateTime = new Date(
        `${data.departureDate}T${data.departureTime}`
      );
      const arrivalDateTime = new Date(
        `${data.arrivalDate}T${data.arrivalTime}`
      );
      return arrivalDateTime > departureDateTime;
    },
    {
      message: "Arrival time must be after departure time",
      path: ["arrivalTime"],
    }
  );

export default function CreateSchedule({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeId: "",
      vehicleId: "",
      departureTime: "",
      arrivalTime: "",
      busType: "AC_SLEEPER",
      departureDate: "",
      arrivalDate: "",
      availableSeats: 0,
      status: "ACTIVE",
      isActive: true,
    },
  });

  // Fetch routes and vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, vehiclesRes] = await Promise.all([
          api.get("/routes"),
          api.get("/vehicles"),
        ]);
        setRoutes(routesRes.data.data.routes);
        setVehicles(vehiclesRes.data.data.vehicles);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // Format dates and times to ISO strings
      const departureDateTime = new Date(
        `${values.departureDate}T${values.departureTime}`
      );
      const arrivalDateTime = new Date(
        `${values.arrivalDate}T${values.arrivalTime}`
      );

      const formattedData = {
        ...values,
        departureTime: departureDateTime.toISOString(),
        arrivalTime: arrivalDateTime.toISOString(),
        departureDate: departureDateTime.toISOString(),
        arrivalDate: arrivalDateTime.toISOString(),
      };

      const response = await api.post("/bus-schedules", formattedData);

      if (response.data.success) {
        toast.success("Schedule created successfully");
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create schedule");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="routeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "bg-background",
                          form.formState.errors.routeId && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.sourceCity} to {route.destinationCity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "bg-background",
                          form.formState.errors.vehicleId &&
                            "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicleName} ({vehicle.vehicleNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="busType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "bg-background",
                          form.formState.errors.busType && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select bus type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AC_SLEEPER">AC Sleeper</SelectItem>
                      <SelectItem value="NON_AC_SLEEPER">
                        Non AC Sleeper
                      </SelectItem>
                      <SelectItem value="AC_SEATER">AC Seater</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={cn(
                          "bg-background",
                          form.formState.errors.departureDate &&
                            "border-destructive"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="1"
                        {...field}
                        className={cn(
                          "bg-background",
                          form.formState.errors.departureTime &&
                            "border-destructive"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={cn(
                          "bg-background",
                          form.formState.errors.arrivalDate &&
                            "border-destructive"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="1"
                        {...field}
                        className={cn(
                          "bg-background",
                          form.formState.errors.arrivalTime &&
                            "border-destructive"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availableSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className={cn(
                        "bg-background",
                        form.formState.errors.availableSeats &&
                          "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "bg-background",
                          form.formState.errors.status && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 text-white hover:bg-yellow-600"
              >
                {loading ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
