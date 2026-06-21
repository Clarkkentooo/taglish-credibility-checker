import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { mockAnalyses } from "@/lib/mocks/analyses";

describe("Analysis results", () => {
  it("supports keyboard highlight interaction and advanced disclosure", async () => {
    render(<AnalysisResults result={mockAnalyses[1]} />);
    const highlight = screen.getByRole("button", { name: /candidate a/i });
    highlight.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText(/relative weight/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /advanced model comparison/i }));
    expect(screen.getByText(/RoBERTa-Tagalog/i)).toBeInTheDocument();
  });

  it("submits feedback dialog", async () => {
    render(<AnalysisResults result={mockAnalyses[0]} />);
    await userEvent.click(screen.getByRole("button", { name: /report an incorrect result/i }));
    await userEvent.type(screen.getByLabelText(/optional note/i), "Needs more context from official sources.");
    await userEvent.click(screen.getByRole("button", { name: /submit report/i }));
    expect(await screen.findByText(/report submitted/i)).toBeInTheDocument();
  });
});
