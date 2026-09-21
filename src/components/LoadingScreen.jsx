import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Image
            src="https://media.base44.com/images/public/6aa8016442ae2c535453ee79/68892e863_generated_image.png"
            alt="Budgey"
            fittingType="fit"
            className="h-16 w-auto"
          />
        </motion.div>
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-bold text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
}