"use client";

import { motion } from "framer-motion";
import { Users, Bus, MapPin, Star } from "lucide-react";

const stats = [
  {
    icon: <Users className="h-8 w-8 text-yellow-500" />,
    value: "50K+",
    label: "Happy Customers",
    description: "Satisfied travelers who trust our service",
  },
  {
    icon: <Bus className="h-8 w-8 text-yellow-500" />,
    value: "500+",
    label: "Buses",
    description: "Modern and well-maintained fleet",
  },
  {
    icon: <MapPin className="h-8 w-8 text-yellow-500" />,
    value: "100+",
    label: "Destinations",
    description: "Routes covering major cities and towns",
  },
  {
    icon: <Star className="h-8 w-8 text-yellow-500" />,
    value: "4.8",
    label: "Rating",
    description: "Average customer satisfaction score",
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

export default function Stats() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative space-y-4 text-center p-6">
                <div className="w-16 h-16 mx-auto rounded-xl bg-yellow-500/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-yellow-500">
                    {stat.label}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
