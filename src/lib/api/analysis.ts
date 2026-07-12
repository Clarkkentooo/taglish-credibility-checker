import { buildMockAnalysis, mockAnalyses } from "@/lib/mocks/analyses";
import { deleteLocalAnalysis, getLocalAnalysis, getLocalHistory, renameLocalAnalysis, saveLocalAnalysis } from "@/lib/local-history";
import { isDemoMode } from "@/lib/session";
import type { AnalysisResult, FeedbackPayload } from "@/types/analysis";

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeText(sourceText: string): Promise<AnalysisResult> {
  if (!useMockApi) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Analysis failed with status ${response.status}.`);
    }
    const result = await response.json() as AnalysisResult;
    if (!isDemoMode()) saveLocalAnalysis(result);
    return result;
  }

  await wait();
  if (sourceText.toLowerCase().includes("simulate error")) {
    throw new Error("The mock analyzer could not complete this request. Please try again.");
  }
  const result = buildMockAnalysis(sourceText);
  if (!isDemoMode()) saveLocalAnalysis(result);
  return result;
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult & { extractedText: string }> {
  if (useMockApi) {
    await wait();
    const mock = buildMockAnalysis(`[Image analysis mock for ${mimeType}]`);
    return { ...mock, extractedText: mock.sourceText };
  }

  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Image analysis failed with status ${response.status}.`);
  }
  const result = await response.json() as AnalysisResult & { extractedText: string };
  if (!isDemoMode()) saveLocalAnalysis(result);
  return result;
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  if (!isDemoMode()) return getLocalHistory();
  await wait(250);
  return mockAnalyses;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  if (!isDemoMode()) {
    const result = getLocalAnalysis(id);
    if (!result) throw new Error("Analysis not found.");
    return result;
  }
  await wait(250);
  const result = mockAnalyses.find((analysis) => analysis.id === id);
  if (!result) throw new Error("Analysis not found.");
  return result;
}

export async function sendFeedback(id: string, payload: FeedbackPayload): Promise<{ ok: true }> {
  void id;
  void payload;
  await wait(250);
  return { ok: true };
}

export async function deleteAnalysis(id: string): Promise<{ ok: true }> {
  if (!isDemoMode()) deleteLocalAnalysis(id);
  await wait(250);
  return { ok: true };
}

export async function renameAnalysis(id: string, title: string): Promise<{ ok: true }> {
  if (!isDemoMode()) renameLocalAnalysis(id, title);
  await wait(100);
  return { ok: true };
}
