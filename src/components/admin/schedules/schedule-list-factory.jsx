"use client";

import { Bus, Calendar, Clock, Users2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import createDynamicList from "@/components/common/create-dynamic-list";
import CreateSchedule from "./create-schedule";
import EditSchedule from "./edit-schedule";
import DeleteSchedule from "./delete-schedule";
import api from "@/lib/axios";

// Format time
const formatTime = (time) => {
  if (!time) return "N/A";

  try {
    // If it's an ISO string, extract the time part
    if (time.includes("T")) {
      const date = new Date(time);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // If it's already a time string
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return time; // Return as is if parsing fails
  }
};

// Format date
const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return date; // Return as is if parsing fails
  }
};

// Column definitions
const columns = [
  { key: "route", header: "Route" },
  { key: "vehicle", header: "Vehicle" },
  { key: "departure", header: "Departure" },
  { key: "arrival", header: "Arrival" },
  { key: "availableSeats", header: "Available Seats" },
  { key: "status", header: "Status" },
];

// Render row data based on column key
const renderRow = (schedule, columnKey) => {
  switch (columnKey) {
    case "route":
      return (
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-yellow-500" />
          {schedule.route.sourceCity} to {schedule.route.destinationCity}
        </div>
      );
    case "vehicle":
      return schedule.vehicles && schedule.vehicles[0] ? (
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-yellow-500" />
          {schedule.vehicles[0].vehicleName} (
          {schedule.vehicles[0].vehicleNumber})
        </div>
      ) : (
        "Not assigned"
      );
    case "departure":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-500" />
            {formatDate(schedule.departureDate)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            {formatTime(schedule.departureTime)}
          </div>
        </div>
      );
    case "arrival":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-500" />
            {formatDate(schedule.arrivalDate)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            {formatTime(schedule.arrivalTime)}
          </div>
        </div>
      );
    case "availableSeats":
      return (
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-yellow-500" />
          {schedule.availableSeats}
        </div>
      );
    case "status":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-transparent border shadow-sm",
            schedule.status === "ACTIVE"
              ? "border-green-500 text-green-500"
              : schedule.status === "CANCELLED"
              ? "border-red-500 text-red-500"
              : "border-yellow-500 text-yellow-500"
          )}
        >
          {schedule.status}
        </Badge>
      );
    default:
      return null;
  }
};

// Custom delete handler with confirmation modal
const customDeleteHandler = async (schedule, refreshData) => {
  // We'll return false to prevent the default delete behavior
  // and handle it with our custom DeleteSchedule modal
  return false;
};

// Create a custom EditSchedule wrapper that accepts 'item' prop instead of 'schedule'
const EditScheduleWrapper = ({ item, ...props }) => {
  return <EditSchedule schedule={item} {...props} />;
};

// Create the dynamic schedule list component
const ScheduleListFactory = createDynamicList({
  title: "Bus Schedules",
  apiEndpoint: "/bus-schedules",
  columns,
  renderRow,
  breadcrumbs: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Bus Schedules", href: "/admin/schedules" },
  ],
  createConfig: {
    show: true,
    label: "Create New Schedule",
  },
  CreateModal: CreateSchedule,
  EditModal: EditScheduleWrapper,
  // detailsPath: "/admin/schedules/:id",
  // customActions: [
  //   {
  //     label: "View Details",
  //     icon: <Eye className="h-4 w-4" />,
  //     onClick: (schedule) =>
  //       (window.location.href = `/admin/schedules/${schedule.id}`),
  //     className:
  //       "text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer",
  //   },
  // ],
  EditMode: false,
  searchPlaceholder: "Search schedules...",
  deleteEndpoint: "/schedules/:id",
});

export default ScheduleListFactory;
