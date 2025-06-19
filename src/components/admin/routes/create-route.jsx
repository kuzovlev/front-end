"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Validation schema
const routeSchema = z.object({
  sourceCity: z.string().min(2, "Source city must be at least 2 characters"),
  destinationCity: z
    .string()
    .min(2, "Destination city must be at least 2 characters"),
  distance: z
    .number()
    .positive("Distance must be a positive number")
    .optional(),
  isActive: z.boolean().optional(),
  boardingPoints: z
    .array(
      z.object({
        locationName: z.string().min(2),
        arrivalTime: z.string().optional(),
        sequenceNumber: z.number().int().min(1).optional(),
      })
    )
    .optional(),
  droppingPoints: z
    .array(
      z.object({
        locationName: z.string().min(2),
        arrivalTime: z.string().optional(),
        sequenceNumber: z.number().int().min(1).optional(),
      })
    )
    .optional(),
});

// Format time for API submission
const formatTimeForSubmission = (time) => {
  if (!time) return null;
  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  // Combine date and time
  return new Date(`${today}T${time}`).toISOString();
};

export default function CreateRoute({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceCity: "",
    destinationCity: "",
    distance: "",
    isActive: true,
    boardingPoints: [],
    droppingPoints: [],
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle boarding points
  const addBoardingPoint = () => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: [
        ...prev.boardingPoints,
        {
          locationName: "",
          arrivalTime: "",
          sequenceNumber: prev.boardingPoints.length + 1,
        },
      ],
    }));
  };

  const removeBoardingPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: prev.boardingPoints.filter((_, i) => i !== index),
    }));
  };

  const updateBoardingPoint = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: prev.boardingPoints.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      ),
    }));
  };

  // Handle dropping points
  const addDroppingPoint = () => {
    setFormData((prev) => ({
      ...prev,
      droppingPoints: [
        ...prev.droppingPoints,
        {
          locationName: "",
          arrivalTime: "",
          sequenceNumber: prev.droppingPoints.length + 1,
        },
      ],
    }));
  };

  const removeDroppingPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      droppingPoints: prev.droppingPoints.filter((_, i) => i !== index),
    }));
  };

  const updateDroppingPoint = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      droppingPoints: prev.droppingPoints.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      ),
    }));
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Format data for submission
      const submissionData = {
        ...formData,
        distance: formData.distance ? Number(formData.distance) : undefined,
        boardingPoints: formData.boardingPoints.map((point) => ({
          ...point,
          arrivalTime: formatTimeForSubmission(point.arrivalTime),
        })),
        droppingPoints: formData.droppingPoints.map((point) => ({
          ...point,
          arrivalTime: formatTimeForSubmission(point.arrivalTime),
        })),
      };

      // Validate form data
      const validatedData = routeSchema.parse(submissionData);

      // Submit to API
      await api.post("/routes", validatedData);

      toast.success("Route created successfully");
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.response?.data?.message || "Error creating route");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceCity">Source City</Label>
              <Input
                id="sourceCity"
                name="sourceCity"
                value={formData.sourceCity}
                onChange={handleChange}
                placeholder="Enter source city"
                className={cn(
                  "bg-background",
                  errors.sourceCity && "border-destructive"
                )}
              />
              {errors.sourceCity && (
                <p className="text-sm text-destructive">{errors.sourceCity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationCity">Destination City</Label>
              <Input
                id="destinationCity"
                name="destinationCity"
                value={formData.destinationCity}
                onChange={handleChange}
                placeholder="Enter destination city"
                className={cn(
                  "bg-background",
                  errors.destinationCity && "border-destructive"
                )}
              />
              {errors.destinationCity && (
                <p className="text-sm text-destructive">
                  {errors.destinationCity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleChange}
                placeholder="Distance in kilometers"
                className={cn(
                  "bg-background",
                  errors.distance && "border-destructive"
                )}
              />
              {errors.distance && (
                <p className="text-sm text-destructive">{errors.distance}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              className="data-[state=checked]:bg-yellow-500"
            />
            <Label htmlFor="isActive">Active Route</Label>
          </div>

          {/* Boarding Points */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Boarding Points</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBoardingPoint}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Point
              </Button>
            </div>

            <div className="space-y-4">
              {formData.boardingPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={point.locationName}
                      onChange={(e) =>
                        updateBoardingPoint(
                          index,
                          "locationName",
                          e.target.value
                        )
                      }
                      placeholder="Location name"
                      className="bg-background"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Arrival Time</Label>
                    <Input
                      type="time"
                      value={point.arrivalTime}
                      onChange={(e) =>
                        updateBoardingPoint(
                          index,
                          "arrivalTime",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeBoardingPoint(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Dropping Points */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dropping Points</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDroppingPoint}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Point
              </Button>
            </div>

            <div className="space-y-4">
              {formData.droppingPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={point.locationName}
                      onChange={(e) =>
                        updateDroppingPoint(
                          index,
                          "locationName",
                          e.target.value
                        )
                      }
                      placeholder="Location name"
                      className="bg-background"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Arrival Time</Label>
                    <Input
                      type="time"
                      value={point.arrivalTime}
                      onChange={(e) =>
                        updateDroppingPoint(
                          index,
                          "arrivalTime",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeDroppingPoint(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Route"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
