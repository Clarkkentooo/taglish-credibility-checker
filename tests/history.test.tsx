import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryClient } from "@/components/history/HistoryClient";
import { mockAnalyses } from "@/lib/mocks/analyses";

describe("History", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("searches and filters demo analyses", async () => {
    window.localStorage.setItem("tsek_session_mode", "demo");
    render(<HistoryClient />);
    await waitFor(() => expect(screen.getAllByText(/official results reminder/i).length).toBeGreaterThan(0));
    await userEvent.type(screen.getByLabelText(/search/i), "secret count");
    expect(screen.getAllByText(/viral thread warning/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/official results reminder/i)).toHaveLength(0);
  });

  it("shows local history for normal users", async () => {
    window.localStorage.setItem("tsek_session_mode", "user");
    window.localStorage.setItem("tsek_analysis_history", JSON.stringify([mockAnalyses[0]]));
    render(<HistoryClient />);
    await waitFor(() => expect(screen.getAllByText(/official results reminder/i).length).toBeGreaterThan(0));
  });
});
