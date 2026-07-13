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
    await userEvent.click(screen.getAllByRole("button", { name: /load sample/i })[0]);
    await userEvent.click(screen.getByRole("button", { name: /run suspiciousness check/i }));
    expect(screen.getAllByText(/analyzing misinformation-associated signals/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByText(/classifier verdict/i).length).toBeGreaterThan(0), { timeout: 3000 });
    await userEvent.click(screen.getAllByRole("button", { name: /responsible use/i })[0]);
    expect(screen.getAllByText(/This result is an automated estimate/i).length).toBeGreaterThan(0);
  });

  it("opens and closes the results drawer without clearing results", async () => {
    render(<CheckerWorkspace />);
    await userEvent.click(screen.getAllByRole("button", { name: /load sample/i })[0]);
    await userEvent.click(screen.getByRole("button", { name: /run suspiciousness check/i }));
    await waitFor(() => expect(screen.getByLabelText(/new results available/i)).toBeInTheDocument(), { timeout: 3000 });
    await userEvent.click(screen.getByRole("button", { name: /show results/i }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: /analysis results/i })).toBeInTheDocument(), { timeout: 3000 });

    await userEvent.click(screen.getByRole("button", { name: /^close results$/i }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /analysis results/i })).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /show results/i }));

    expect(screen.getByRole("dialog", { name: /analysis results/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/classifier verdict/i).length).toBeGreaterThan(0));
  });
});
