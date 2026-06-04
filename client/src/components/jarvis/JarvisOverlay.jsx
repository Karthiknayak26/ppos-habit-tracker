import React, { useEffect } from 'react';
import { Mic, MicOff, Sparkles, Cpu } from 'lucide-react';
import { useJarvis } from '../../context/JarvisContext';
import { motion, AnimatePresence } from 'framer-motion';

const JarvisOverlay = () => {
  const { isListening, toggleListening, transcript, jarvisResponse } = useJarvis();

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.7)] animate-pulse' 
            : 'bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--primary-color)] hover:bg-[var(--bg-color)]'
        }`}
        title="Toggle Jarvis (Ctrl+Shift+J)"
      >
        {isListening ? (
          <Cpu className="w-6 h-6 animate-spin-slow" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>

      {/* Futuristic Transcript Overlay */}
      <AnimatePresence>
        {(isListening || jarvisResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-[var(--surface-color)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden p-5"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 animate-gradient-x" />
            
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-cyan-400 w-5 h-5" />
              <h3 className="font-bold text-sm tracking-widest uppercase text-cyan-400">Jarvis Mode</h3>
              {isListening && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* User Transcript */}
              {transcript && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase mb-1">You</span>
                  <div className="bg-blue-600/20 text-blue-100 border border-blue-500/30 px-3 py-2 rounded-2xl rounded-tr-sm text-sm">
                    "{transcript}"
                  </div>
                </div>
              )}

              {/* Jarvis Response */}
              {jarvisResponse && !isListening && (
                <div className="flex flex-col items-start mt-2">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase mb-1">Jarvis</span>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--bg-color)] text-white border border-[var(--border-color)] px-3 py-2 rounded-2xl rounded-tl-sm text-sm"
                  >
                    {jarvisResponse}
                  </motion.div>
                </div>
              )}

              {/* Listening Placeholder */}
              {isListening && !transcript && (
                <div className="text-[var(--text-secondary)] text-sm italic text-center animate-pulse py-4">
                  Listening...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JarvisOverlay;
