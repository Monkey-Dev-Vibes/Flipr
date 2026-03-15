import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TradeResultToast } from "@/components/TradeResultToast";
import type { TradeResult } from "@/lib/types";

const successResult: TradeResult = {
  success: true,
  market_id: "mkt-001",
  intent: "yes",
  amount: 10,
  executed_price: 65.5,
  fee: 0.5,
  error: null,
};

const failureResult: TradeResult = {
  success: false,
  market_id: "mkt-001",
  intent: "no",
  amount: 10,
  executed_price: null,
  fee: null,
  error: "Slippage too high",
};

describe("TradeResultToast", () => {
  it("renders success state with trade details", () => {
    render(<TradeResultToast result={successResult} onDismiss={vi.fn()} />);
    expect(screen.getByText("Trade Executed")).toBeInTheDocument();
    expect(screen.getByText(/YES \$10.00 at 65.5%/)).toBeInTheDocument();
    expect(screen.getByText(/Fee: \$0.50/)).toBeInTheDocument();
  });

  it("renders failure state with error message", () => {
    render(<TradeResultToast result={failureResult} onDismiss={vi.fn()} />);
    expect(screen.getByText("Trade Failed")).toBeInTheDocument();
    expect(screen.getByText("Slippage too high")).toBeInTheDocument();
  });

  it("has alert role for accessibility", () => {
    render(<TradeResultToast result={successResult} onDismiss={vi.fn()} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("auto-dismisses after 4 seconds", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<TradeResultToast result={successResult} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("shows Unknown error when error is null on failure", () => {
    const noErrorResult = { ...failureResult, error: null };
    render(<TradeResultToast result={noErrorResult} onDismiss={vi.fn()} />);
    expect(screen.getByText("Unknown error")).toBeInTheDocument();
  });
});
