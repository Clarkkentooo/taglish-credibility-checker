import type { AnalysisResult } from "@/types/analysis";

const HISTORY_KEY = "tsek_analysis_history";

function readRawHistory(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as AnalysisResult[] : [];
  } catch {
    return [];
  }
}

function writeRawHistory(items: AnalysisResult[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function getLocalHistory() {
  return readRawHistory();
}

export function getLocalAnalysis(id: string) {
  return readRawHistory().find((item) => item.id === id) ?? null;
}

export function saveLocalAnalysis(result: AnalysisResult) {
  const current = readRawHistory().filter((item) => item.id !== result.id);
  writeRawHistory([result, ...current].slice(0, 50));
}

export function deleteLocalAnalysis(id: string) {
  writeRawHistory(readRawHistory().filter((item) => item.id !== id));
}

export function renameLocalAnalysis(id: string, title: string) {
  writeRawHistory(readRawHistory().map((item) => item.id === id ? { ...item, title } : item));
}

export function clearLocalHistory() {
  writeRawHistory([]);
}
