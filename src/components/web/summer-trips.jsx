"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

const trips = [
  {
    id: 1,
    title: "Cox's Bazar Beach Tour",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    price: "2,999",
    duration: "3 Days",
    maxPeople: "30",
    destination: "Cox's Bazar",
  },
  {
    id: 2,
    title: "Sundarbans Mangrove Forest",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5",
    price: "4,999",
    duration: "4 Days",
    maxPeople: "20",
    destination: "Khulna",
  },
  {
    id: 3,
    title: "Sajek Valley Adventure",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    price: "3,499",
    duration: "2 Days",
    maxPeople: "25",
    destination: "Rangamati",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function SummerTrips() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Featured
              <span className="text-yellow-500"> Summer Trips</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Discover our most popular summer destinations and book your next
              adventure with special seasonal discounts.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {trips.map((trip) => (
              <motion.div key={trip.id} variants={itemVariants}>
                <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${trip.image})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      ${trip.price}
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {trip.title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-yellow-500" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span>{trip.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span>Max {trip.maxPeople} people</span>
                      </div>
                    </div>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center pt-8">
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              View All Destinations
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
