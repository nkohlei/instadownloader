"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Check, Video, Image as ImageIcon } from "lucide-react";
import { scaleIn } from "@/lib/animations";
import { clsx } from "clsx";

interface SelectionItem {
    id: string;
    url: string;
    thumbnail: string;
    is_video: boolean;
}

interface SelectionGridProps {
    isOpen: boolean;
    onClose: () => void;
    items: SelectionItem[];
    onDownload: (selectedIndices: number[]) => void;
    title?: string;
}

export default function SelectionGrid({ isOpen, onClose, items, onDownload, title = "Select Items" }: SelectionGridProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleDownload = () => {
        onDownload(selectedIndices);
        onClose();
        setSelectedIndices([]); // Reset after download
    };

    const toggleAll = () => {
        if (selectedIndices.length === items.length) {
            setSelectedIndices([]);
        } else {
            setSelectedIndices(items.map((_, i) => i));
        }
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
                        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-card z-10">
                            <div>
                                <h3 className="text-xl font-semibold">{title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedIndices.length} selected
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleAll}
                                    className="text-sm font-medium text-insta-purple hover:text-insta-pink transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                                >
                                    {selectedIndices.length === items.length ? "Deselect All" : "Select All"}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {items.map((item, index) => {
                                    const isSelected = selectedIndices.includes(index);
                                    return (
                                        <div
                                            key={item.id || index}
                                            onClick={() => toggleSelection(index)}
                                            className={clsx(
                                                "relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all",
                                                isSelected ? "border-insta-purple" : "border-transparent hover:border-muted-foreground/30"
                                            )}
                                        >
                                            <img
                                                src={item.thumbnail}
                                                alt={`Item ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />

                                            {/* Type Indicator */}
                                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-lg text-white">
                                                {item.is_video ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                            </div>

                                            {/* Selection Overlay */}
                                            <div className={clsx(
                                                "absolute inset-0 transition-colors flex items-center justify-center",
                                                isSelected ? "bg-insta-purple/20" : "bg-black/0 group-hover:bg-black/10"
                                            )}>
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all transform",
                                                    isSelected ? "bg-insta-purple text-white scale-100" : "bg-white/30 text-transparent scale-90 opacity-0 group-hover:opacity-100"
                                                )}>
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/30">
                            <button
                                onClick={handleDownload}
                                disabled={selectedIndices.length === 0}
                                className="w-full py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Selected ({selectedIndices.length})</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
