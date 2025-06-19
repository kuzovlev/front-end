"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useTicketStore from "@/store/use-ticket-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bus, MapPin, CreditCard, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import PaymentForm from "@/components/web/payment/payment-element";
import { useSettings } from "@/hooks/use-settings";

export default function CheckoutPage() {
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const {
    selectedVehicle,
    selectedSeats,
    selectedBoardingPoint,
    bookingDate,
    totalAmount,
    setTotalAmount,
    resetTicketSelection,
  } = useTicketStore();

  // Use the settings hook to get the Stripe key
  const {
    value: stripeKey,
    isLoading: isLoadingStripe,
    error: stripeError,
  } = useSettings("STRIPE_PUBLISHABLE_KEY");

  // Initialize Stripe when the key is available
  useEffect(() => {
    console.log("stripeKey", stripeKey);
    const initializeStripe = async () => {
      if (stripeKey) {
        try {
          const stripe = await loadStripe(stripeKey);
          console.log("stripeKey", stripeKey);

          setStripePromise(stripe);
        } catch (error) {
          console.error("Error initializing Stripe:", error);
          toast.error("Failed to initialize payment system");
        }
      }
    };

    initializeStripe();
  }, [stripeKey]);

  // console.log(selectedSeats);

  // Calculate total amount when seats change
  useEffect(() => {
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalAmount(total);
  }, [selectedSeats, setTotalAmount]);

  useEffect(() => {
    console.log("selectedVehicle", selectedVehicle);
    console.log(selectedVehicle?.user?.vendor?.userId);
    if (!selectedVehicle || !selectedSeats.length || !selectedBoardingPoint) {
      router.push("/");
    }
  }, [selectedVehicle, selectedSeats, selectedBoardingPoint, router]);

  // Initialize payment intent when selecting card payment
  const initializeStripePayment = async () => {
    try {
      setLoading(true);
      const bookingData = {
        vehicleId: selectedVehicle?.id,
        vendorId: selectedVehicle?.user?.vendor?.userId,
        routeId: selectedVehicle?.route?.id,
        boardingPointId: selectedBoardingPoint?.id,
        droppingPointId: selectedVehicle?.route?.droppingPoints?.[0]?.id,
        bookingDate: new Date(bookingDate).toISOString(),
        seatNumbers: selectedSeats,
        totalAmount: Number(totalAmount),
        discountAmount: 0,
        finalAmount: Number(totalAmount),
        currency: "usd",
      };

      const response = await api.post("/payments/create-intent", bookingData);

      if (response.data?.data) {
        setClientSecret(response.data.data.clientSecret);
        setPaymentIntentId(response.data.data.paymentIntentId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to initialize payment. Please try again."
      );
      setPaymentMethod("CASH"); // Reset to cash payment on error
    } finally {
      setLoading(false);
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = async (method) => {
    try {
      setPaymentMethod(method);
      if (method === "STRIPE") {
        await initializeStripePayment();
      } else {
        setClientSecret("");
        setPaymentIntentId("");
      }
    } catch (error) {
      console.error("Payment method change error:", error);
      toast.error("Failed to change payment method. Please try again.");
      setPaymentMethod("CASH");
    }
  };

  // Handle cash payment
  const handlePayment = async () => {
    try {
      setLoading(true);
      const bookingData = {
        vehicleId: selectedVehicle.id,
        vendorId: selectedVehicle.user.vendor.userId,
        routeId: selectedVehicle.route.id,
        boardingPointId: selectedBoardingPoint.id,
        droppingPointId: selectedVehicle.route.droppingPoints[0].id,
        bookingDate: new Date().toISOString(),
        seatNumbers: selectedSeats,
        totalAmount: totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        paymentMethod: "CASH",
      };

      const response = await api.post("/bookings", bookingData);
      if (response.data.success) {
        toast.success("Booking confirmed successfully!");
        resetTicketSelection();
        router.push("/users/bookings");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // Define the appearance configuration
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#eab308",
      colorBackground: "#18181b",
      colorText: "#ffffff",
      colorDanger: "#df1b41",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "6px",
      borderRadius: "4px",
    },
    rules: {
      ".Tab": {
        border: "1px solid #404040",
        boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.03)",
      },
      ".Tab:hover": {
        color: "#eab308",
      },
      ".Tab--selected": {
        borderColor: "#eab308",
        color: "#eab308",
      },
      ".Input": {
        border: "1px solid #404040",
      },
      ".Input:focus": {
        border: "1px solid #eab308",
      },
    },
  };

  // Show loading state while fetching the Stripe key
  if (isLoadingStripe) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state if there's an issue loading the Stripe key
  if (stripeError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Failed to load payment system</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash">Cash Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="STRIPE" id="card" />
                    <Label htmlFor="card">Card Payment</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {paymentMethod === "STRIPE" && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance,
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                amount={totalAmount}
              />
            </Elements>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-yellow-500 text-black hover:bg-yellow-600 h-12"
            >
              {loading
                ? "Processing..."
                : `Confirm Cash Payment ($${totalAmount})`}
            </Button>
          )}
        </div>

        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Info */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Bus className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">{selectedVehicle?.vehicleName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedVehicle?.user?.vendor?.businessName}
                </p>
              </div>
            </div>

            <Separator />

            {/* Boarding Point */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">Boarding Point</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedBoardingPoint?.locationName}
                </p>
                <p className="text-sm text-yellow-500">
                  {selectedBoardingPoint?.arrivalTime}
                </p>
              </div>
            </div>

            <Separator />

            {/* Selected Seats */}
            <div>
              <h3 className="font-medium mb-3">Selected Seats</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.key}
                    className="p-3 rounded-lg bg-yellow-500/10 text-sm"
                  >
                    <div className="font-medium">{seat.seatNumber}</div>
                    <div className="text-muted-foreground">
                      {seat.deck} DECK • {seat.type}
                    </div>
                    <div className="text-yellow-500 font-medium">
                      ${seat.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total Amount */}
            <div className="flex justify-between items-center font-medium">
              <span>Total Amount</span>
              <span className="text-xl text-yellow-500">${totalAmount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
