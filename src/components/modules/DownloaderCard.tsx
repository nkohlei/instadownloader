"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, AlertCircle, Loader2, ArrowRight, Download, Play, X, Instagram } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { clsx } from "clsx";

export default function DownloaderCard() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mediaInfo, setMediaInfo] = useState<any | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string>("");
    const [downloadStatus, setDownloadStatus] = useState<'idle' | 'starting'>('idle');

    const handleFetchInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMediaInfo(null);
        setIsLoading(true);
        setDownloadStatus('idle');

        if (!url.includes("instagram.com")) {
            setError("Please enter a valid Instagram URL.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch media info");
            }

            if (data.type === 'single' && data.items.length > 0) {
                const item = data.items[0];
                setMediaInfo(item);
                // Default to highest quality
                if (item.qualities && item.qualities.length > 0) {
                    setSelectedQuality(item.qualities[0].height.toString());
                } else {
                    setSelectedQuality(""); // Default/Best
                }
            } else {
                setError("This appears to be a carousel or story list. Currently only Reels are supported in this mode.");
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const executeDownload = () => {
        if (!mediaInfo) return;

        const link = document.createElement('a');
        let href = `/api/download?url=${encodeURIComponent(url)}&format=mp4`;
        if (selectedQuality) {
            href += `&quality=${selectedQuality}`;
        }
        link.href = href;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset status after a delay to allow the user to see "Starting..."
        setTimeout(() => {
            setDownloadStatus('idle');
        }, 3000);
    };

    const startDownload = () => {
        if (!mediaInfo) return;
        setDownloadStatus('starting');

        // Simulate "preparing" delay for better UX
        setTimeout(() => {
            executeDownload();
        }, 1500);
    };

    return (
        <motion.div
            variants={fadeInUp}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
                {/* Decorative Gradient Line */}
                <div className="h-1 w-full bg-gradient-insta opacity-80" />

                <div className="p-8 relative">
                    <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-tight drop-shadow-lg">
                        Instagram Reels Downloader
                    </h2>

                    {/* Input Form */}
                    <form onSubmit={handleFetchInfo} className="relative z-10 mb-8">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-insta-purple transition-colors">
                                <Link2 className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Paste Instagram Reel link here..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    if (mediaInfo) setMediaInfo(null);
                                }}
                                className="w-full pl-12 pr-32 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-insta-purple/50 focus:border-insta-purple/50 transition-all text-white placeholder:text-slate-500 shadow-inner backdrop-blur-sm"
                            />

                            {/* Clear Button */}
                            {url && (
                                <button
                                    type="button"
                                    onClick={() => setUrl("")}
                                    className="absolute right-24 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors z-20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !url}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-white text-black rounded-lg font-bold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Searching...</span>
                                    </div>
                                ) : (
                                    <span>Check</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                            >
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Preview & Download Section */}
                    <AnimatePresence>
                        {mediaInfo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative overflow-hidden rounded-3xl shadow-2xl"
                            >
                                {/* Liquid Chrome Background for Info Box */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-slate-300" />

                                {/* Metallic Sheen Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50 pointer-events-none" />

                                <div className="relative p-6 flex flex-col md:flex-row gap-8 items-center z-10">
                                    {/* Video Preview with Persistent Loading Animation */}
                                    <div className="relative group">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative w-48 h-80 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/40 bg-black"
                                        >
                                            {/* Persistent Thumbnail Background */}
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${mediaInfo.thumbnail})` }}
                                            />

                                            {/* Persistent Loading Animation (Scanning Line) */}
                                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                                                <motion.div
                                                    animate={{ top: ["-100%", "200%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent -skew-y-12 blur-sm"
                                                />
                                            </div>

                                            {/* Instagram Logo Overlay */}
                                            <div className="absolute top-3 right-3 z-20 text-white drop-shadow-lg pointer-events-none">
                                                <Instagram
                                                    className="w-6 h-6 text-white drop-shadow-md"
                                                />
                                            </div>

                                            {/* Auto-playing Video */}
                                            <video
                                                src={mediaInfo.url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover z-0"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Info & Controls (Dark Text for Chrome Background) */}
                                    <div className="flex-1 w-full space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight">
                                                {mediaInfo.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 mt-2 flex items-center gap-2 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                Ready to download
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                Select Quality
                                            </label>
                                            <div className="flex flex-wrap gap-3">
                                                {mediaInfo.qualities && mediaInfo.qualities.length > 0 ? (
                                                    mediaInfo.qualities.map((q: any) => (
                                                        <button
                                                            key={q.height}
                                                            onClick={() => setSelectedQuality(q.height.toString())}
                                                            className={clsx(
                                                                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                                                                selectedQuality === q.height.toString()
                                                                    ? "text-white shadow-lg shadow-insta-purple/25 scale-105"
                                                                    : "bg-slate-200/50 text-slate-600 hover:bg-white hover:scale-105 border border-slate-300/50 hover:border-slate-400"
                                                            )}
                                                        >
                                                            {selectedQuality === q.height.toString() && (
                                                                <motion.div
                                                                    layoutId="activeQuality"
                                                                    className="absolute inset-0 bg-gradient-insta"
                                                                    initial={false}
                                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                                />
                                                            )}
                                                            <span className="relative z-10">{q.label}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-slate-500">Best Quality Available</div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={startDownload}
                                            disabled={downloadStatus === 'starting'}
                                            className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-black/80 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden shadow-xl"
                                        >
                                            <AnimatePresence mode="wait">
                                                {downloadStatus === 'starting' ? (
                                                    <motion.div
                                                        key="starting"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: -20, opacity: 0 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>Starting Download...</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="download-text"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: -20, opacity: 0 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        <span>Download Reel</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fun Loading Animation for Cover Photo (Placeholder) */}
                    <AnimatePresence>
                        {isLoading && !mediaInfo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mt-8 flex flex-col items-center justify-center gap-4 py-12"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 rounded-full border-4 border-t-transparent border-l-cyan-400 border-b-purple-500 border-r-pink-500"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Instagram className="w-6 h-6 text-white" />
                                    </motion.div>
                                </div>
                                <p className="text-white/80 font-medium animate-pulse">Finding your Reel...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <p className="text-center text-slate-400 mt-8 text-sm opacity-60">
                Paste a link, preview the video, and choose your quality.
            </p>
        </motion.div>
    );
}
