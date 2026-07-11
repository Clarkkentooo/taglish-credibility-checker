import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AnimatedBadge } from "@/components/beui/badge";
import { Checkbox } from "@/components/beui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/beui/radio";
import { Switch } from "@/components/beui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/beui/tabs";
import { Tooltip } from "@/components/beui/tooltip";
import { Button } from "@/components/ui/button";

describe("beUI migration primitives", () => {
  it("keeps button variants and disabled semantics through the wrapper", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="danger" disabled onClick={onClick}>
        Delete
      </Button>,
    );

    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders animated badge statuses", () => {
    render(<AnimatedBadge status="warning">Review needed</AnimatedBadge>);
    expect(screen.getByText(/review needed/i)).toBeInTheDocument();
  });

  it("updates tabs from mouse and keyboard activation", async () => {
    const user = userEvent.setup();

    function DemoTabs() {
      const [value, setValue] = useState("text");
      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList aria-label="Input type">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          <p>Selected: {value}</p>
        </Tabs>
      );
    }

    render(<DemoTabs />);
    await user.click(screen.getByRole("tab", { name: /image/i }));
    expect(screen.getByText(/selected: image/i)).toBeInTheDocument();
    screen.getByRole("tab", { name: /text/i }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/selected: text/i)).toBeInTheDocument();
  });

  it("toggles switch and checkbox state", async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn();
    const onCheckbox = vi.fn();

    render(
      <>
        <Switch checked={false} onCheckedChange={onSwitch} aria-label="Enable setting" />
        <Checkbox checked={false} onCheckedChange={onCheckbox} aria-label="Agree" />
      </>,
    );

    await user.click(screen.getByRole("switch", { name: /enable setting/i }));
    await user.click(screen.getByRole("checkbox", { name: /agree/i }));
    expect(onSwitch).toHaveBeenCalledWith(true);
    expect(onCheckbox).toHaveBeenCalledWith(true);
  });

  it("updates radio selection", async () => {
    const user = userEvent.setup();

    function DemoRadio() {
      const [value, setValue] = useState("one");
      return (
        <RadioGroup value={value} onValueChange={setValue} aria-label="Options">
          <RadioGroupItem value="one" aria-label="One" />
          <RadioGroupItem value="two" aria-label="Two" />
          <p>Selected: {value}</p>
        </RadioGroup>
      );
    }

    render(<DemoRadio />);
    await user.click(screen.getByRole("radio", { name: /two/i }));
    expect(screen.getByText(/selected: two/i)).toBeInTheDocument();
  });

  it("shows tooltip content on focus", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Explains this action">
        <button type="button">Info</button>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent(/explains this action/i);
  });
});
