/**
 * Renders a branded share card to a canvas and returns a Blob.
 * Used for both trade win shares and portfolio milestone shares.
 */

export interface ShareCardData {
  type: "trade-win" | "portfolio";
  /** Market question (trade-win only) */
  question?: string;
  /** YES or NO */
  intent?: "yes" | "no";
  /** Percentage gain */
  percentGain: number;
  /** Dollar amount won or total portfolio value */
  amount: number;
  /** Win streak count */
  winStreak?: number;
  /** Share URL to embed as text */
  shareUrl?: string;
}

const CARD_WIDTH = 600;
const CARD_HEIGHT = 400;
const BG_COLOR = "#1A1A1A";
const CARD_BG = "#222222";
const GREEN = "#8AE600";
const RED = "#D45847";
const WHITE = "#FFFFFF";
const GRAY = "#999999";

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Inner card with rounded corners
  drawRoundedRect(ctx, 20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40, 20, CARD_BG);

  // Accent gradient bar at top
  const gradient = ctx.createLinearGradient(20, 20, CARD_WIDTH - 20, 20);
  gradient.addColorStop(0, GREEN);
  gradient.addColorStop(1, "#A3FF1A");
  ctx.fillStyle = gradient;
  drawRoundedRectTop(ctx, 20, 20, CARD_WIDTH - 40, 6, 20);

  // Brand name
  ctx.fillStyle = WHITE;
  ctx.font = "bold 24px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("flipr", 48, 68);

  // Win streak badge
  if (data.winStreak && data.winStreak >= 2) {
    ctx.fillStyle = GREEN;
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText(`🔥 x${data.winStreak}`, 120, 68);
  }

  if (data.type === "trade-win" && data.question) {
    // Market question
    ctx.fillStyle = WHITE;
    ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif";
    wrapText(ctx, data.question, 48, 120, CARD_WIDTH - 96, 28);

    // Intent badge
    const intentColor = data.intent === "yes" ? GREEN : RED;
    const intentText = data.intent === "yes" ? "YES" : "NO";
    ctx.fillStyle = intentColor;
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(intentText, 48, 200);
  }

  // Big percentage gain
  const gainColor = data.percentGain >= 0 ? GREEN : RED;
  const gainSign = data.percentGain >= 0 ? "+" : "";
  ctx.fillStyle = gainColor;
  ctx.font = "bold 56px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    `${gainSign}${data.percentGain.toFixed(1)}%`,
    CARD_WIDTH / 2,
    data.type === "trade-win" ? 270 : 220,
  );

  // Amount
  ctx.fillStyle = WHITE;
  ctx.font = "24px 'JetBrains Mono', monospace";
  ctx.fillText(
    `$${data.amount.toFixed(2)}`,
    CARD_WIDTH / 2,
    data.type === "trade-win" ? 310 : 260,
  );
  ctx.textAlign = "left";

  // CTA
  ctx.fillStyle = GRAY;
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    data.shareUrl ?? "Join Flipr — Predict. Trade. Win.",
    CARD_WIDTH / 2,
    CARD_HEIGHT - 48,
  );
  ctx.textAlign = "left";

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoundedRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
