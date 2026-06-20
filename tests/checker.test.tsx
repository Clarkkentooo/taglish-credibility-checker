import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckerWorkspace } from "@/components/checker/CheckerWorkspace";

describe("Checker workspace", () => {
  it("validates text length and shows character counts", async () => {
    render(<CheckerWorkspace />);
    const editor = screen.getByPlaceholderText(/paste a taglish/i);
    await userEvent.type(editor, "short");
    expect(screen.getByText(/5 characters/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run suspiciousness check/i })).toBeDisabled();
  });

  it("runs the mock analysis flow from input to result", async () => {
    render(<CheckerWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: /load sample/i }));
    await userEvent.click(screen.getByRole("button", { name: /run suspiciousness check/i }));
    expect(screen.getByText(/analyzing misinformation-associated signals/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/automated estimate/i).length).toBeGreaterThan(0), { timeout: 3000 });
    expect(screen.getByText(/This result is an automated estimate/i)).toBeInTheDocument();
  });
});
