import { buildMockAnalysis, mockAnalyses } from "@/lib/mocks/analyses";
import type { AnalysisResult, FeedbackPayload } from "@/types/analysis";

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export async function analyzeText(sourceText: string): Promise<AnalysisResult> {
  if (!useMockApi) {
    return request<AnalysisResult>("/api/v1/analyze", {
      method: "POST",
      body: JSON.stringify({ sourceText }),
    });
  }

  await wait();
  if (sourceText.toLowerCase().includes("simulate error")) {
    throw new Error("The mock analyzer could not complete this request. Please try again.");
  }
  return buildMockAnalysis(sourceText);
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  if (!useMockApi) return request<AnalysisResult[]>("/api/v1/analyses");
  await wait(250);
  return mockAnalyses;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  if (!useMockApi) return request<AnalysisResult>(`/api/v1/analyses/${id}`);
  await wait(250);
  const result = mockAnalyses.find((analysis) => analysis.id === id);
  if (!result) throw new Error("Analysis not found.");
  return result;
}

export async function sendFeedback(id: string, payload: FeedbackPayload): Promise<{ ok: true }> {
  if (!useMockApi) {
    return request<{ ok: true }>(`/api/v1/analyses/${id}/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  await wait(250);
  return { ok: true };
}

export async function deleteAnalysis(id: string): Promise<{ ok: true }> {
  if (!useMockApi) {
    return request<{ ok: true }>(`/api/v1/analyses/${id}`, { method: "DELETE" });
  }
  await wait(250);
  return { ok: true };
}
