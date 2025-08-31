"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowLeft, CloudSun, CloudMoon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return null; // or a loading placeholder
  }

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  const busVariants = {
    initial: { x: -1000, rotate: 0 },
    animate: {
      x: 1000,
      rotate: [0, -2, 2, -2, 0],
      transition: {
        x: {
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        },
        rotate: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        },
      },
    },
  };

  const cloudVariants = {
    animate: {
      x: [-20, 20, -20],
      y: [-10, 10, -10],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-yellow-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full text-center relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-0 left-10 text-yellow-400 dark:text-yellow-500"
          variants={cloudVariants}
          animate="animate"
        >
          {theme === "dark" ? (
            <CloudMoon className="w-12 h-12 opacity-50" />
          ) : (
            <CloudSun className="w-12 h-12 opacity-50" />
          )}
        </motion.div>
        <motion.div
          className="absolute top-20 right-10 text-yellow-400 dark:text-yellow-500"
          variants={cloudVariants}
          animate="animate"
        >
          {theme === "dark" ? (
            <CloudMoon className="w-8 h-8 opacity-30" />
          ) : (
            <CloudSun className="w-8 h-8 opacity-30" />
          )}
        </motion.div>

        {/* Main content */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-400 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-700 dark:text-zinc-300">
            Ой! Щось пішло не так
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Здається, що сторінка відсутня :(
          </p>
        </motion.div>

        {/* Animated bus scene */}
        <motion.div className="relative h-32 mb-8 overflow-hidden">
          {/* Road */}
          <div className="absolute bottom-0 w-full h-2 bg-yellow-200 dark:bg-yellow-900/30 rounded-full" />

          {/* Bus */}
          <motion.div
            variants={busVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-2"
          >
            <div className="w-24 h-12 bg-gradient-to-b from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-lg relative shadow-xl">
              {/* Windows */}
              <div className="absolute top-1.5 left-12 right-1.5 h-4 bg-sky-200/90 dark:bg-sky-400/20 rounded-lg grid grid-cols-3 gap-0.5 p-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-sky-100 dark:bg-sky-300/10 rounded"
                  />
                ))}
              </div>
              {/* Front window */}
              <div className="absolute top-1.5 left-1.5 w-8 h-4 bg-sky-200/90 dark:bg-sky-400/20 rounded-lg" />
              {/* Wheels */}
              <div className="absolute -bottom-1.5 left-3 w-4 h-4 bg-zinc-800 dark:bg-zinc-700 rounded-full animate-spin" />
              <div className="absolute -bottom-1.5 right-3 w-4 h-4 bg-zinc-800 dark:bg-zinc-700 rounded-full animate-spin" />
            </div>
          </motion.div>
        </motion.div>

        {/* Action button */}
        <motion.div variants={itemVariants}>
          <Link href="/">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на головну
            </Button>
          </Link>
        </motion.div>

        {/* Location marker */}
        <motion.div
          variants={itemVariants}
          className="mt-8 inline-flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400"
        >
          <MapPin className="h-4 w-4" />
          <span>Схоже, що ми загубилсь :(</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
