import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("Landing page", () => {
  it("links the primary CTA to the checker", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /analyze credibility/i })).toHaveAttribute("href", "/checker");
  });
});
