"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
    onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 1500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-insta blur-xl opacity-20 rounded-full" />
                        <Loader2 className="w-16 h-16 text-foreground animate-spin relative z-10" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-8 text-2xl font-light tracking-widest uppercase text-foreground/80"
                    >
                        Insta<span className="font-bold text-gradient-insta">Downloader</span>
                    </motion.h1>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
