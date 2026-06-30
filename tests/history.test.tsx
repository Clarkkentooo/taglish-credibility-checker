import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryClient } from "@/components/history/HistoryClient";

describe("History", () => {
  it("searches and filters analyses", async () => {
    render(<HistoryClient />);
    await waitFor(() => expect(screen.getAllByText(/official results reminder/i).length).toBeGreaterThan(0));
    await userEvent.type(screen.getByLabelText(/search/i), "secret count");
    expect(screen.getAllByText(/viral thread warning/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/official results reminder/i)).toHaveLength(0);
  });
});
