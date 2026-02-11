"use client";

import { ReactNode, useState } from "react";
import { Icons } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

export function FormField({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {help && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              onClick={() => setShowHelp(!showHelp)}
              className="text-gray-400 hover:text-primary transition-colors focus:outline-none"
            >
              <Icons.Info className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl backdrop-blur-md"
                >
                  <p className="text-xs leading-relaxed text-gray-600">{help}</p>
                  <div className="absolute -top-1.5 left-1.5 h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-lg border border-[#e5e5dc] bg-white p-5">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
