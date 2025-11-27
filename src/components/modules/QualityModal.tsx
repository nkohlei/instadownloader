"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Music, Video, Image as ImageIcon } from "lucide-react";
import { scaleIn } from "@/lib/animations";

interface QualityModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "video" | "image" | "story";
    onDownload: (format: string, quality: string) => void;
}

export default function QualityModal({ isOpen, onClose, type, onDownload }: QualityModalProps) {
    const handleSelection = (format: string, quality: string) => {
        onDownload(format, quality);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">Select Quality</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {type === "video" && (
                                    <>
                                        <button
                                            onClick={() => handleSelection("mp4", "1080p")}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-insta-purple hover:bg-muted/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-gradient-insta group-hover:text-white transition-colors">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium">High Quality (1080p)</div>
                                                    <div className="text-xs text-muted-foreground">MP4 • ~15MB</div>
                                                </div>
                                            </div>
                                            <Download className="w-5 h-5 text-muted-foreground group-hover:text-insta-purple transition-colors" />
                                        </button>

                                        <button
                                            onClick={() => handleSelection("mp3", "audio")}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-insta-purple hover:bg-muted/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-gradient-insta group-hover:text-white transition-colors">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium">Audio Only</div>
                                                    <div className="text-xs text-muted-foreground">MP3 • ~3MB</div>
                                                </div>
                                            </div>
                                            <Download className="w-5 h-5 text-muted-foreground group-hover:text-insta-purple transition-colors" />
                                        </button>
                                    </>
                                )}

                                {(type === "image" || type === "story") && (
                                    <button
                                        onClick={() => handleSelection("jpg", "original")}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-insta-purple hover:bg-muted/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-gradient-insta group-hover:text-white transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">Original Quality</div>
                                                <div className="text-xs text-muted-foreground">JPG • Max Res</div>
                                            </div>
                                        </div>
                                        <Download className="w-5 h-5 text-muted-foreground group-hover:text-insta-purple transition-colors" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border-t border-border text-center text-xs text-muted-foreground">
                            By downloading, you agree to our Terms of Service.
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
