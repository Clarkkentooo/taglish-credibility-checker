import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/beui/drawer";

function DrawerDemo({ controlled = false }: { controlled?: boolean }) {
  const [open, setOpen] = useState(false);
  const drawerProps = controlled ? { open, onOpenChange: setOpen } : {};

  return (
    <Drawer {...drawerProps}>
      <DrawerTrigger asChild>
        <button type="button">Open drawer</button>
      </DrawerTrigger>
      <DrawerContent side="left" data-testid="drawer-panel">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Dashboard navigation</DrawerDescription>
        </DrawerHeader>
        <button type="button">First action</button>
        <DrawerClose aria-label="Close drawer" />
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer primitive", () => {
  it("opens from the trigger with accessible title and side", async () => {
    const user = userEvent.setup();
    render(<DrawerDemo />);

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    expect(screen.getByRole("dialog", { name: /navigation/i })).toBeInTheDocument();
    expect(screen.getByTestId("drawer-panel")).toHaveClass("left-0");
  });

  it("closes from close button, overlay, and escape", async () => {
    const user = userEvent.setup();
    render(<DrawerDemo />);

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    await user.click(screen.getByRole("button", { name: /^close drawer$/i }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /navigation/i })).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    await user.click(screen.getByRole("button", { name: /close drawer overlay/i }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /navigation/i })).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /navigation/i })).not.toBeInTheDocument());
  });

  it("restores focus to the trigger after close", async () => {
    const user = userEvent.setup();
    render(<DrawerDemo />);

    const trigger = screen.getByRole("button", { name: /open drawer/i });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /^close drawer$/i }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("supports controlled state", async () => {
    const user = userEvent.setup();
    render(<DrawerDemo controlled />);

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    expect(screen.getByRole("dialog", { name: /navigation/i })).toBeInTheDocument();
  });
});
