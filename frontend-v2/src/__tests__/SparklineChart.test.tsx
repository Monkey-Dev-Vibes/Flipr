import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparklineChart } from "@/components/SparklineChart";
import type { SparklinePoint } from "@/lib/types";

describe("SparklineChart", () => {
  const sampleData: SparklinePoint[] = [
    { t: 1000, p: 40 },
    { t: 2000, p: 55 },
    { t: 3000, p: 48 },
    { t: 4000, p: 62 },
    { t: 5000, p: 58 },
  ];

  it("renders an SVG element", () => {
    const { container } = render(<SparklineChart data={sampleData} id="test" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a polyline with correct number of points", () => {
    const { container } = render(<SparklineChart data={sampleData} id="test" />);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    const points = polyline!.getAttribute("points")!.split(" ");
    expect(points).toHaveLength(5);
  });

  it("returns null for fewer than 2 data points", () => {
    const { container } = render(
      <SparklineChart data={[{ t: 1000, p: 50 }]} id="test-single" />,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("uses provided color for the stroke", () => {
    const { container } = render(
      <SparklineChart data={sampleData} id="test-color" color="#FF0000" />,
    );
    const polyline = container.querySelector("polyline");
    expect(polyline).toHaveAttribute("stroke", "#FF0000");
  });

  it("renders a gradient fill polygon", () => {
    const { container } = render(<SparklineChart data={sampleData} id="test" />);
    expect(container.querySelector("polygon")).toBeInTheDocument();
    expect(container.querySelector("linearGradient#sparkFill-test")).toBeInTheDocument();
  });
});
