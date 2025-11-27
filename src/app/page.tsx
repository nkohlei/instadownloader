"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/LoadingScreen";
import DownloaderCard from "@/components/modules/DownloaderCard";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative z-10">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl flex flex-col items-center gap-12"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                InstaDownloader
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
                Download Instagram Reels, Posts, and Stories in high quality.
                Simple, fast, and free.
              </p>
            </div>

            <DownloaderCard />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
