"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type FontSizePreference = "md" | "lg" | "xl";
export type ContrastPreference = "normal" | "high";
export type ReadingModePreference = "default" | "dyslexia";
export type MotionPreference = "normal" | "reduced";

type AccessibilitySettings = {
  fontSize: FontSizePreference;
  contrast: ContrastPreference;
  readingMode: ReadingModePreference;
  motion: MotionPreference;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  isReady: boolean;
  setFontSize: (fontSize: FontSizePreference) => void;
  setContrast: (contrast: ContrastPreference) => void;
  setReadingMode: (readingMode: ReadingModePreference) => void;
  setMotion: (motion: MotionPreference) => void;
  resetSettings: () => void;
};

const STORAGE_KEY = "hayattan-accessibility";
const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: "md",
  contrast: "normal",
  readingMode: "default",
  motion: "normal",
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.dataset.fontSize = settings.fontSize;
  root.dataset.contrast = settings.contrast;
  root.dataset.readingMode = settings.readingMode;
  root.dataset.motion = settings.motion;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
        setSettings({
          fontSize: parsed.fontSize === "lg" || parsed.fontSize === "xl" ? parsed.fontSize : "md",
          contrast: parsed.contrast === "high" ? "high" : "normal",
          readingMode: parsed.readingMode === "dyslexia" ? "dyslexia" : "default",
          motion: parsed.motion === "reduced" ? "reduced" : "normal",
        });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    applySettings(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [isReady, settings]);

  const value: AccessibilityContextValue = {
    settings,
    isReady,
    setFontSize: (fontSize) => setSettings((prev) => ({ ...prev, fontSize })),
    setContrast: (contrast) => setSettings((prev) => ({ ...prev, contrast })),
    setReadingMode: (readingMode) => setSettings((prev) => ({ ...prev, readingMode })),
    setMotion: (motion) => setSettings((prev) => ({ ...prev, motion })),
    resetSettings: () => setSettings(DEFAULT_SETTINGS),
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
