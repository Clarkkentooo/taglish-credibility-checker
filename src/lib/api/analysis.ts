import { buildMockAnalysis, mockAnalyses } from "@/lib/mocks/analyses";
import type { AnalysisResult, FeedbackPayload } from "@/types/analysis";

/** When true, analyzeText() uses mock data instead of the real model. */
const useMockAnalyze = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function saveToLocalStorage(result: AnalysisResult) {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem("tsektxt_analyses");
    const list: AnalysisResult[] = existing ? JSON.parse(existing) : [];
    // Avoid duplicates
    if (!list.some((item) => item.id === result.id)) {
      list.unshift(result);
      localStorage.setItem("tsektxt_analyses", JSON.stringify(list));
    }
  } catch (e) {
    console.error("Failed to save analysis to localStorage:", e);
  }
}

export async function analyzeText(sourceText: string): Promise<AnalysisResult> {
  let result: AnalysisResult;
  if (!useMockAnalyze) {
    // Call the Next.js server-side route, which proxies to FastAPI + Groq
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Analysis request failed." }));
      throw new Error((err as { error?: string }).error ?? `Request failed with ${response.status}`);
    }
    result = await response.json() as AnalysisResult;
  } else {
    await wait();
    if (sourceText.toLowerCase().includes("simulate error")) {
      throw new Error("The mock analyzer could not complete this request. Please try again.");
    }
    result = buildMockAnalysis(sourceText);
  }

  saveToLocalStorage(result);
  return result;
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult & { extractedText: string }> {
  let result: AnalysisResult & { extractedText: string };
  if (!useMockAnalyze) {
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, mimeType }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Image analysis failed." }));
      throw new Error((err as { error?: string }).error ?? `Request failed with ${response.status}`);
    }
    result = await response.json() as AnalysisResult & { extractedText: string };
  } else {
    await wait();
    const mock = buildMockAnalysis(`[Image analysis mock for ${mimeType}]`);
    result = { ...mock, extractedText: mock.sourceText };
  }

  saveToLocalStorage(result);
  return result;
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  await wait(250);
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("tsektxt_analyses");
      const localList: AnalysisResult[] = existing ? JSON.parse(existing) : [];
      // Combine local checks first, then mockAnalyses
      const mockFiltered = mockAnalyses.filter(mockItem => !localList.some(localItem => localItem.id === mockItem.id));
      return [...localList, ...mockFiltered];
    } catch (e) {
      console.error("Failed to load local analyses:", e);
    }
  }
  return mockAnalyses;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  await wait(250);
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("tsektxt_analyses");
      const localList: AnalysisResult[] = existing ? JSON.parse(existing) : [];
      const localResult = localList.find((analysis) => analysis.id === id);
      if (localResult) return localResult;
    } catch (e) {
      console.error("Failed to load local analysis by id:", e);
    }
  }
  const result = mockAnalyses.find((analysis) => analysis.id === id);
  if (!result) throw new Error("Analysis not found.");
  return result;
}

export async function sendFeedback(id: string, payload: FeedbackPayload): Promise<{ ok: true }> {
  await wait(250);
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("tsektxt_analyses");
      const localList: AnalysisResult[] = existing ? JSON.parse(existing) : [];
      const idx = localList.findIndex((analysis) => analysis.id === id);
      if (idx !== -1) {
        localList[idx] = { ...localList[idx], ...payload };
        localStorage.setItem("tsektxt_analyses", JSON.stringify(localList));
      }
    } catch (e) {
      console.error("Failed to save feedback locally:", e);
    }
  }
  return { ok: true };
}

export async function deleteAnalysis(id: string): Promise<{ ok: true }> {
  await wait(250);
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("tsektxt_analyses");
      const localList: AnalysisResult[] = existing ? JSON.parse(existing) : [];
      const updated = localList.filter((analysis) => analysis.id !== id);
      localStorage.setItem("tsektxt_analyses", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete analysis locally:", e);
    }
  }
  return { ok: true };
}

export async function renameAnalysis(id: string, title: string): Promise<{ ok: true }> {
  await wait(100);
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("tsektxt_analyses");
      const localList: AnalysisResult[] = existing ? JSON.parse(existing) : [];
      const idx = localList.findIndex((analysis) => analysis.id === id);
      if (idx !== -1) {
        localList[idx] = { ...localList[idx], title };
        localStorage.setItem("tsektxt_analyses", JSON.stringify(localList));
      }
    } catch (e) {
      console.error("Failed to rename analysis locally:", e);
    }
  }
  return { ok: true };
}
