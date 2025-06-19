"use client";

import { Bus, Grid, Calendar, Eye, Bed, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import createDynamicList from "@/components/common/create-dynamic-list";
import dynamic from "next/dynamic";

// Dynamically import delete component with SSR disabled
const DeleteBusLayout = dynamic(() => import("./delete-bus-layout"), {
  ssr: false,
});

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
    return date;
  }
};

// Get vehicle names
const getVehicleNames = (vehicles) => {
  if (!vehicles || vehicles.length === 0) return "No vehicles assigned";
  if (vehicles.length === 1)
    return `${vehicles[0].vehicleName} (${vehicles[0].vehicleNumber})`;
  return `${vehicles[0].vehicleName} (${vehicles[0].vehicleNumber}) +${
    vehicles.length - 1
  } more`;
};

// Column definitions
const columns = [
  { key: "layoutInfo", header: "Layout Info" },
  { key: "details", header: "Details" },
  { key: "vehicles", header: "Vehicles" },
  { key: "created", header: "Created" },
];

// Render row data based on column key
const renderRow = (layout, columnKey) => {
  switch (columnKey) {
    case "layoutInfo":
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Bus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{layout.layoutName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-500"
              >
                {layout.hasUpperDeck ? "Double Decker" : "Single Decker"}
              </Badge>
            </div>
          </div>
        </div>
      );
    case "details":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-500" />
            <span>
              {layout.rowCount} × {layout.columnCount} ({layout.totalSeats}{" "}
              seats)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{layout.sleeperSeats} sleeper</span>
            </div>
            <div className="flex items-center gap-1">
              <Bus className="h-4 w-4 text-green-500" />
              <span className="text-sm">{layout.seaterSeats} seater</span>
            </div>
          </div>
        </div>
      );
    case "vehicles":
      return <div className="text-sm">{getVehicleNames(layout.vehicles)}</div>;
    case "created":
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{formatDate(layout.createdAt)}</span>
        </div>
      );
    default:
      return null;
  }
};

// Create a custom DeleteBusLayout wrapper that accepts 'item' prop
const DeleteBusLayoutWrapper = ({ item, ...props }) => {
  return <DeleteBusLayout layout={item} {...props} />;
};

// Create the dynamic bus layout list component
const BusLayoutListFactory = createDynamicList({
  title: "Bus Layouts",
  apiEndpoint: "/bus-layouts",
  columns,
  renderRow,
  breadcrumbs: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Bus Layouts", href: "/admin/bus-layouts" },
  ],
  // createConfig: {
  //   show: true,
  //   label: "Create New Layout",
  //   onClick: () => (window.location.href = "/admin/bus-layouts/create"),
  //   customButton: (
  //     <Button
  //       onClick={() => (window.location.href = "/admin/bus-layouts/create")}
  //       className="bg-yellow-500 text-white hover:bg-yellow-600"
  //     >
  //       <Plus className="h-4 w-4 mr-2" />
  //       Create New Layout
  //     </Button>
  //   ),
  // },
  DeleteModal: DeleteBusLayoutWrapper,
  // detailsPath: "/admin/bus-layouts/:id",
  searchPlaceholder: "Search layouts...",
  // deleteEndpoint: "/bus-layouts/:id",
  EditMode: false,
});

export default BusLayoutListFactory;
