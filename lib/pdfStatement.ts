import {
  detectRecurringSubscriptions,
  parseAmount,
  parseDate,
  parseTypeIndicator,
  type ScanResult,
  type Tx,
} from "@/lib/detection";

export type PdfTextItem = {
  str: string;
  x: number;
  y: number;
  width?: number;
};

export type PdfTextPage = {
  items: PdfTextItem[];
};

export class PdfPasswordError extends Error {
  reason: "required" | "incorrect";

  constructor(reason: "required" | "incorrect") {
    super(
      reason === "incorrect"
        ? "That PDF password didn't match. Check the password and try again."
        : "This PDF statement is password-protected. Enter the PDF password to scan it locally."
    );
    this.name = "PdfPasswordError";
    this.reason = reason;
  }
}

type RowCell = {
  text: string;
  x: number;
  right: number;
  center: number;
};

type VisualRow = {
  y: number;
  cells: RowCell[];
  text: string;
};

type ColumnAnchor = {
  x: number;
  right: number;
  center: number;
};

type ColumnLayout = {
  date?: ColumnAnchor;
  desc?: ColumnAnchor;
  ref?: ColumnAnchor;
  debit?: ColumnAnchor;
  credit?: ColumnAnchor;
  amount?: ColumnAnchor;
  balance?: ColumnAnchor;
  type?: ColumnAnchor;
};

type MoneyToken = {
  value: number;
  signed: number;
  marker: "debit" | "credit" | null;
  x: number;
  right: number;
  center: number;
};

type RawTxBlock = {
  order: number;
  date: Date;
  descParts: string[];
  moneyTokens: MoneyToken[];
  explicitMarker: "debit" | "credit" | null;
};

const Y_TOLERANCE = 3;
const CELL_MERGE_GAP = 8;

const DATE_PREFIX_PATTERNS: RegExp[] = [
  /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/,
  /^\d{1,2}[-/.]\d{1,2}[-/.](?:\d{4}|\d{2})\b/,
  /^\d{1,2}[ \-/][A-Za-z]{3,9}[ ,.'\-/]+(?:\d{4}|\d{2})\b/,
  /^[A-Za-z]{3,9}\.? \d{1,2},? (?:\d{4}|\d{2})\b/,
];

const CHROME_LINE_RE =
  /^(page\s+\d+(?:\s*(?:of|\/)\s*\d+)?\s*$|statement\s+(?:of\s+account|summary|period)\b|account\s+(?:no|number|name|type|summary|branch|status)\b|branch\s*:|ifsc\s*:|micr\s*:|ckyc\s*:|nominee\s*:|opening\s+balance\b|closing\s+balance\b|brought\s+forward\b|carried\s+forward\b|available\s+balance\b|credit\s+limit\b|minimum\s+amount\s+due\b|payment\s+due\s+date\b|total\s+(?:debits?|credits?|amount|withdrawals?|deposits?)\b|grand\s+total\b|generated\s+on\b|\*{2,}\s*(?:end|continued|continue)\b|this\s+is\s+a\s+computer\s+generated\b|customer\s+care\b|toll\s+free\b|registered\s+office\b)/i;

function estimateWidth(text: string): number {
  return Math.max(4, text.length * 4.5);
}

function buildVisualRows(items: PdfTextItem[]): VisualRow[] {
  const clean = items
    .map((item) => ({
      str: item.str.replace(/\u00a0/g, " ").trim(),
      x: Number.isFinite(item.x) ? item.x : 0,
      y: Number.isFinite(item.y) ? item.y : 0,
      width:
        typeof item.width === "number" && item.width > 0
          ? item.width
          : estimateWidth(item.str.trim()),
    }))
    .filter((item) => item.str.length > 0);

  if (!clean.length) return [];

  // Sort top-to-bottom (descending PDF y), then left-to-right (ascending x).
  clean.sort((a, b) => {
    if (Math.abs(b.y - a.y) > Y_TOLERANCE) return b.y - a.y;
    return a.x - b.x;
  });

  const grouped: { anchorY: number; items: typeof clean }[] = [];
  for (const item of clean) {
    const last = grouped[grouped.length - 1];
    if (last && Math.abs(last.anchorY - item.y) <= Y_TOLERANCE) {
      last.items.push(item);
    } else {
      grouped.push({ anchorY: item.y, items: [item] });
    }
  }

  return grouped.map((group) => {
    group.items.sort((a, b) => a.x - b.x);
    const cells: RowCell[] = [];

    for (const item of group.items) {
      const right = item.x + item.width;
      const prev = cells[cells.length - 1];
      const gap = prev ? item.x - prev.right : Infinity;

      if (prev && gap <= CELL_MERGE_GAP) {
        const directJoin =
          gap <= 1.2 ||
          prev.text.endsWith(".") ||
          prev.text.endsWith("/") ||
          prev.text.endsWith("-") ||
          item.str.startsWith(".") ||
          item.str.startsWith(",");
        prev.text = directJoin ? `${prev.text}${item.str}` : `${prev.text} ${item.str}`;
        prev.right = Math.max(prev.right, right);
        prev.center = (prev.x + prev.right) / 2;
      } else {
        cells.push({
          text: item.str,
          x: item.x,
          right,
          center: (item.x + right) / 2,
        });
      }
    }

    return {
      y: group.anchorY,
      cells,
      text: cells.map((c) => c.text).join(" ").trim(),
    };
  });
}

function normHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function detectHeaderLayout(cells: RowCell[]): ColumnLayout | null {
  const layout: ColumnLayout = {};
  let hits = 0;

  for (const cell of cells) {
    const h = normHeader(cell.text);
    if (!h) continue;
    const anchor: ColumnAnchor = {
      x: cell.x,
      right: cell.right,
      center: cell.center,
    };

    if (/^(txn|transaction|tran|posting|post)?\s*(date|dt)$/.test(h) && !layout.date) {
      layout.date = anchor;
      hits++;
    } else if (
      /\b(narration|description|particulars|merchant|payee|remarks|details|memo)\b/.test(
        h
      ) &&
      !layout.desc
    ) {
      layout.desc = anchor;
      hits++;
    } else if (/\b(chq|cheque|ref|reference|utr|rrn)\b/.test(h) && !layout.ref) {
      layout.ref = anchor;
      hits++;
    } else if (
      /^(dr cr|cr dr|debit credit|credit debit|type)(\s+(indicator|flag|type))?$/.test(h)
    ) {
      layout.type = anchor;
      hits++;
    } else if (
      (/\b(debit|withdrawal|withdrawals|withdrawn|paid out|money out|debited)\b/.test(
        h
      ) &&
        !/\b(credit|cr)\b/.test(h)) ||
      /^dr(\s+amt|\s+amount)?$/.test(h)
    ) {
      layout.debit = anchor;
      hits++;
    } else if (
      (/\b(credit|deposit|deposits|paid in|money in|credited)\b/.test(h) &&
        !/\b(debit|dr)\b/.test(h)) ||
      /^cr(\s+amt|\s+amount)?$/.test(h)
    ) {
      layout.credit = anchor;
      hits++;
    } else if (/\b(balance|closing bal)\b/.test(h)) {
      layout.balance = anchor;
      hits++;
    } else if (/\bamount\b|^amt$/.test(h) && !/balance/.test(h)) {
      layout.amount = anchor;
      hits++;
    }
  }

  const hasNumericHeader = Boolean(
    layout.debit || layout.credit || layout.amount || layout.balance
  );
  if (hits >= 3 || (hasNumericHeader && (layout.date || layout.desc) && hits >= 2)) {
    return layout;
  }
  return null;
}

function matchDatePrefix(text: string): { date: Date; rest: string } | null {
  const trimmed = text.trim();
  for (const pattern of DATE_PREFIX_PATTERNS) {
    const m = trimmed.match(pattern);
    if (!m) continue;
    const date = parseDate(m[0]);
    if (date) {
      const rest = trimmed
        .slice(m[0].length)
        .replace(/^\s+\d{1,2}:\d{2}(:\d{2})?\s*(?:am|pm)?\b/i, "")
        .trim();
      return { date, rest };
    }
  }
  return null;
}

function isStandaloneMoneyString(
  raw: string,
  allowPlainInteger: boolean
): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/[a-z]{3,}/i.test(s.replace(/\b(rs|inr|usd|cr|dr)\b/gi, ""))) {
    return false;
  }

  const hasCurrencyOrDecimalOrCommasOrMarker =
    /[₹$€£]|\b(?:rs|inr|usd)\b/i.test(s) ||
    /\d+\.\d{1,2}\b/.test(s) ||
    /\d{1,3}(?:,\d{2,3})+/.test(s) ||
    /(?:cr|dr)\.?$/i.test(s) ||
    /^\(.*\)$/.test(s) ||
    /^-/.test(s);

  if (!hasCurrencyOrDecimalOrCommasOrMarker && !allowPlainInteger) {
    return false;
  }

  const parsed = parseAmount(s);
  if (!parsed) return false;
  if (Math.abs(parsed.value) > 50_000_000) return false;
  return true;
}

function isNearRefColumn(cell: RowCell, layout: ColumnLayout | null): boolean {
  if (!layout?.ref) return false;
  return (
    Math.abs(cell.center - layout.ref.center) <= 40 ||
    Math.abs(cell.x - layout.ref.x) <= 30
  );
}

function isNearTypeColumn(cell: RowCell, layout: ColumnLayout | null): boolean {
  if (!layout?.type) return false;
  return (
    Math.abs(cell.center - layout.type.center) <= 35 ||
    Math.abs(cell.x - layout.type.x) <= 25
  );
}

function isNearNumericColumn(cell: RowCell, layout: ColumnLayout | null): boolean {
  if (!layout) return false;
  if (isNearRefColumn(cell, layout)) return false;
  const cols = [layout.debit, layout.credit, layout.amount, layout.balance].filter(
    (c): c is ColumnAnchor => Boolean(c)
  );
  return cols.some(
    (col) =>
      Math.abs(cell.center - col.center) <= 55 ||
      Math.abs(cell.right - col.right) <= 55
  );
}

function splitTrailingMoneyFromCell(cell: RowCell): {
  descPart: string;
  trailingTokens: MoneyToken[];
} {
  // Some PDFs concatenate narration and trailing amounts inside a single text chunk:
  // e.g. "UPI/NETFLIX/123456 649.00 10,000.00"
  const trailingRe =
    /(?:^|\s)((?:[₹$€£]|rs\.?|inr)?\s*[-+(]?\s*(?:\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+\.\d{1,2})\s*\)?(?:\s*(?:cr|dr)\.?)?)$/i;

  let working = cell.text.trim();
  const extracted: { raw: string; parsed: NonNullable<ReturnType<typeof parseAmount>> }[] = [];

  for (let i = 0; i < 3; i++) {
    const m = working.match(trailingRe);
    if (!m) break;
    const raw = m[1].trim();
    const parsed = parseAmount(raw);
    if (!parsed || Math.abs(parsed.value) > 50_000_000) break;

    const before = working.slice(0, working.length - m[0].length).trim();
    if (!before) break; // whole cell is numeric, handled elsewhere
    extracted.unshift({ raw, parsed });
    working = before;
  }

  if (!extracted.length) {
    return { descPart: cell.text, trailingTokens: [] };
  }

  const totalLen = Math.max(1, cell.text.length);
  const cellWidth = Math.max(4, cell.right - cell.x);
  const tokens: MoneyToken[] = [];
  let cursor = working.length;

  for (const item of extracted) {
    cursor += 1;
    const startRatio = Math.min(1, cursor / totalLen);
    const endRatio = Math.min(1, (cursor + item.raw.length) / totalLen);
    const x = cell.x + cellWidth * startRatio;
    const right = cell.x + cellWidth * endRatio;
    tokens.push({
      value: Math.abs(item.parsed.value),
      signed: item.parsed.value,
      marker: item.parsed.marker,
      x,
      right,
      center: (x + right) / 2,
    });
    cursor += item.raw.length;
  }

  return { descPart: working, trailingTokens: tokens };
}

function classifyColumn(
  token: MoneyToken,
  layout: ColumnLayout | null
): "debit" | "credit" | "amount" | "balance" | null {
  if (!layout) return null;
  const candidates: {
    key: "debit" | "credit" | "amount" | "balance";
    anchor: ColumnAnchor;
  }[] = [];

  if (layout.debit) candidates.push({ key: "debit", anchor: layout.debit });
  if (layout.credit) candidates.push({ key: "credit", anchor: layout.credit });
  if (layout.amount) candidates.push({ key: "amount", anchor: layout.amount });
  if (layout.balance) candidates.push({ key: "balance", anchor: layout.balance });

  if (!candidates.length) return null;

  let best: (typeof candidates)[number] | null = null;
  let bestDist = Infinity;

  for (const cand of candidates) {
    const dist = Math.min(
      Math.abs(token.right - cand.anchor.right),
      Math.abs(token.center - cand.anchor.center)
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = cand;
    }
  }

  if (!best || bestDist > 90) return null;
  return best.key;
}

function looksLikeFooterContinuation(text: string): boolean {
  if (CHROME_LINE_RE.test(text.trim())) return true;
  if (text.length > 160) return true;
  return false;
}

type ResolvedBlock = {
  order: number;
  date: Date;
  merchant: string;
  amount: number | null;
  signed: number;
  marker: "debit" | "credit" | null;
  balance: number | null;
  candidateAmounts: MoneyToken[];
};

function resolveBlocks(
  blocks: RawTxBlock[],
  layout: ColumnLayout | null
): Tx[] {
  const resolved: ResolvedBlock[] = blocks.map((block) => {
    const merchant = block.descParts.join(" ").replace(/\s+/g, " ").trim();
    const nonZeroTokens = block.moneyTokens.filter((t) => t.value > 0);
    let marker = block.explicitMarker;
    let amount: number | null = null;
    let signed = 0;
    let balance: number | null = null;

    if (
      layout &&
      (layout.debit || layout.credit || layout.amount || layout.balance)
    ) {
      let debitTok: MoneyToken | null = null;
      let creditTok: MoneyToken | null = null;
      let amtTok: MoneyToken | null = null;
      let balTok: MoneyToken | null = null;

      for (const tok of block.moneyTokens) {
        const col = classifyColumn(tok, layout);
        if (col === "debit" && tok.value > 0) debitTok = tok;
        else if (col === "credit" && tok.value > 0) creditTok = tok;
        else if (col === "amount" && tok.value > 0) amtTok = tok;
        else if (col === "balance") balTok = tok;
      }

      if (balTok) balance = balTok.value;

      if (debitTok) {
        amount = debitTok.value;
        signed = -debitTok.value;
        marker = "debit";
      } else if (creditTok) {
        amount = creditTok.value;
        signed = creditTok.value;
        marker = "credit";
      } else if (amtTok) {
        amount = amtTok.value;
        signed = amtTok.signed;
        marker = marker ?? amtTok.marker;
      }
    }

    // Fallback positional extraction when header columns didn't cleanly match.
    if (amount === null && nonZeroTokens.length > 0) {
      const sorted = [...nonZeroTokens].sort((a, b) => a.x - b.x);
      if (sorted.length >= 2) {
        const balCand = sorted[sorted.length - 1];
        const amtCand = sorted[sorted.length - 2];
        balance = balCand.value;
        amount = amtCand.value;
        signed = amtCand.signed;
        marker = marker ?? amtCand.marker;
      } else {
        const single = sorted[0];
        amount = single.value;
        signed = single.signed;
        marker = marker ?? single.marker;
      }
    }

    return {
      order: block.order,
      date: block.date,
      merchant,
      amount,
      signed,
      marker,
      balance,
      candidateAmounts: nonZeroTokens,
    };
  });

  // Use consecutive running-balance differences to infer debit vs credit on
  // rows that don't have explicit Dr/Cr or header columns. Handles both
  // chronological (oldest->newest) and reverse-chronological statements.
  for (let i = 1; i < resolved.length; i++) {
    const prev = resolved[i - 1];
    const curr = resolved[i];
    if (prev.balance === null || curr.balance === null) continue;

    const ascending = prev.date.getTime() <= curr.date.getTime();
    if (ascending && curr.marker === null && curr.amount !== null) {
      if (Math.abs(prev.balance - curr.amount - curr.balance) <= 0.15) {
        curr.marker = "debit";
      } else if (Math.abs(prev.balance + curr.amount - curr.balance) <= 0.15) {
        curr.marker = "credit";
      }
    } else if (!ascending && prev.marker === null && prev.amount !== null) {
      // Newest first: curr is older than prev -> prev.bal = curr.bal +/- prev.amt
      if (Math.abs(curr.balance - prev.amount - prev.balance) <= 0.15) {
        prev.marker = "debit";
      } else if (Math.abs(curr.balance + prev.amount - prev.balance) <= 0.15) {
        prev.marker = "credit";
      }
    }
  }

  const negativesCount = resolved.filter(
    (r) => r.amount !== null && r.marker === null && r.signed < 0
  ).length;

  const txs: Tx[] = [];
  for (const row of resolved) {
    if (!row.merchant || row.amount === null || row.amount <= 0) continue;
    if (row.marker === "credit") continue;
    if (row.marker === null && negativesCount > 0 && row.signed >= 0) continue;
    txs.push({
      date: row.date,
      merchant: row.merchant,
      amount: row.amount,
    });
  }

  return txs;
}

/**
 * Pure parser for pre-extracted PDF page text items. Kept independent from
 * DOM/Worker globals so both browser scans and unit tests share one path.
 */
export function analyzePdfPages(pages: PdfTextPage[]): ScanResult {
  const totalChars = pages.reduce(
    (sum, page) =>
      sum + page.items.reduce((s, it) => s + it.str.replace(/\s+/g, "").length, 0),
    0
  );

  if (totalChars < 30) {
    throw new Error(
      "This PDF appears to be a scanned image without selectable text. Download a digital PDF or CSV statement from your bank instead."
    );
  }

  let activeLayout: ColumnLayout | null = null;
  const blocks: RawTxBlock[] = [];
  let currentBlock: RawTxBlock | null = null;
  let order = 0;

  for (const page of pages) {
    const rows = buildVisualRows(page.items);
    // Do not merge a wrapped narration across page boundaries.
    currentBlock = null;

    for (const row of rows) {
      if (!row.text) continue;

      const header = detectHeaderLayout(row.cells);
      if (header) {
        activeLayout = header;
        currentBlock = null;
        continue;
      }

      if (CHROME_LINE_RE.test(row.text)) {
        currentBlock = null;
        continue;
      }

      const firstCell = row.cells[0];
      const leadingDate = firstCell ? matchDatePrefix(firstCell.text) : null;

      if (leadingDate) {
        const nextBlock: RawTxBlock = {
          order: order++,
          date: leadingDate.date,
          descParts: [],
          moneyTokens: [],
          explicitMarker: null,
        };

        // Process cells on the leading-date line, consuming optional Value Date right after Txn Date.
        let consumedValueDate = false;
        let startCells: RowCell[] = [];

        if (leadingDate.rest) {
          const secondDate = matchDatePrefix(leadingDate.rest);
          if (secondDate) {
            consumedValueDate = true;
            if (secondDate.rest) {
              startCells.push({
                text: secondDate.rest,
                x: firstCell.x,
                right: firstCell.right,
                center: firstCell.center,
              });
            }
          } else {
            startCells.push({
              text: leadingDate.rest,
              x: firstCell.x,
              right: firstCell.right,
              center: firstCell.center,
            });
          }
          startCells = startCells.concat(row.cells.slice(1));
        } else {
          startCells = row.cells.slice(1);
        }

        for (let idx = 0; idx < startCells.length; idx++) {
          const cell = startCells[idx];
          if (!consumedValueDate && idx === 0) {
            const valDate = matchDatePrefix(cell.text);
            if (valDate) {
              consumedValueDate = true;
              if (!valDate.rest) continue;
              cell.text = valDate.rest;
            }
          }

          const typeFlag = isNearTypeColumn(cell, activeLayout)
            ? parseTypeIndicator(cell.text)
            : /^(cr|credit|dr|debit)$/i.test(cell.text.trim())
              ? parseTypeIndicator(cell.text)
              : null;
          if (typeFlag) {
            nextBlock.explicitMarker = typeFlag;
            continue;
          }

          if (isNearRefColumn(cell, activeLayout)) {
            continue;
          }

          const allowInt = isNearNumericColumn(cell, activeLayout);
          if (isStandaloneMoneyString(cell.text, allowInt)) {
            const parsed = parseAmount(cell.text);
            if (parsed) {
              nextBlock.moneyTokens.push({
                value: Math.abs(parsed.value),
                signed: parsed.value,
                marker: parsed.marker,
                x: cell.x,
                right: cell.right,
                center: cell.center,
              });
              continue;
            }
          }

          const split = splitTrailingMoneyFromCell(cell);
          if (split.descPart) nextBlock.descParts.push(split.descPart);
          if (split.trailingTokens.length) {
            nextBlock.moneyTokens.push(...split.trailingTokens);
          }
        }

        blocks.push(nextBlock);
        currentBlock = nextBlock;
        continue;
      }

      // Continuation row on the same page for multi-line wrapped descriptions.
      if (currentBlock && !looksLikeFooterContinuation(row.text)) {
        for (const cell of row.cells) {
          const typeFlag = isNearTypeColumn(cell, activeLayout)
            ? parseTypeIndicator(cell.text)
            : /^(cr|credit|dr|debit)$/i.test(cell.text.trim())
              ? parseTypeIndicator(cell.text)
              : null;
          if (typeFlag) {
            currentBlock.explicitMarker = typeFlag;
            continue;
          }

          if (isNearRefColumn(cell, activeLayout)) {
            continue;
          }

          const allowInt = isNearNumericColumn(cell, activeLayout);
          if (isStandaloneMoneyString(cell.text, allowInt)) {
            const parsed = parseAmount(cell.text);
            if (parsed) {
              currentBlock.moneyTokens.push({
                value: Math.abs(parsed.value),
                signed: parsed.value,
                marker: parsed.marker,
                x: cell.x,
                right: cell.right,
                center: cell.center,
              });
              continue;
            }
          }

          const split = splitTrailingMoneyFromCell(cell);
          if (split.descPart) currentBlock.descParts.push(split.descPart);
          if (split.trailingTokens.length) {
            currentBlock.moneyTokens.push(...split.trailingTokens);
          }
        }
      }
    }
  }

  const txs = resolveBlocks(blocks, activeLayout);

  return detectRecurringSubscriptions(
    txs,
    "Could not extract spending transactions with dates and debit amounts from this PDF. If your bank uses a non-tabular layout, export a CSV statement instead."
  );
}

/**
 * Extracts text items from a PDF File strictly inside the user's browser
 * using pdfjs-dist and a local same-origin worker, then detects recurring charges.
 */
export async function analyzePdfFile(
  file: File,
  password?: string
): Promise<ScanResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await import("pdfjs-dist");

  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const loadingTask = pdfjs.getDocument({
    data: bytes,
    ...(password ? { password } : {}),
  });

  let doc: Awaited<typeof loadingTask.promise>;
  try {
    doc = await loadingTask.promise;
  } catch (err) {
    await loadingTask.destroy().catch(() => {});
    const e = err as { name?: string; code?: number; message?: string } | null;
    if (
      e?.name === "PasswordException" ||
      e?.code === 1 ||
      e?.code === 2 ||
      /password/i.test(e?.message ?? "")
    ) {
      const incorrect = e?.code === 2 || /incorrect/i.test(e?.message ?? "");
      throw new PdfPasswordError(incorrect ? "incorrect" : "required");
    }
    throw new Error(
      "Could not open this PDF file. Check that it isn't corrupted or export a CSV statement instead."
    );
  }

  try {
    const pages: PdfTextPage[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const items: PdfTextItem[] = [];

      for (const rawItem of content.items) {
        if (!rawItem || typeof rawItem !== "object" || !("str" in rawItem)) {
          continue;
        }
        const item = rawItem as {
          str?: string;
          transform?: number[];
          width?: number;
        };
        const str = typeof item.str === "string" ? item.str : "";
        if (!str.trim()) continue;
        const transform = Array.isArray(item.transform) ? item.transform : [];
        const x = typeof transform[4] === "number" ? transform[4] : 0;
        const y = typeof transform[5] === "number" ? transform[5] : 0;
        items.push({
          str,
          x,
          y,
          width: typeof item.width === "number" ? item.width : undefined,
        });
      }

      pages.push({ items });
    }

    return analyzePdfPages(pages);
  } finally {
    await doc.cleanup().catch(() => {});
    await loadingTask.destroy().catch(() => {});
  }
}
