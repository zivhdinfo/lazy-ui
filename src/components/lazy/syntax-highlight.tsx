import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "type",
  "interface",
  "if",
  "else",
  "for",
  "while",
  "new",
  "typeof",
  "as",
  "async",
  "await",
]);

type Token = { cls: string | null; text: string };

const PATTERN = new RegExp(
  [
    "(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)",
    "(?<str>\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)",
    "(?<ident>[A-Za-z_$][A-Za-z0-9_$]*)",
    "(?<num>\\b\\d+(?:\\.\\d+)?\\b)",
    "(?<other>[^A-Za-z_$\"'`/0-9]+|.)",
  ].join("|"),
  "g",
);

function classify(token: string, groups: Record<string, string | undefined>): string | null {
  if (groups.comment) return "c";
  if (groups.str) return "s";
  if (groups.ident) {
    if (KEYWORDS.has(token)) return "k";
    // Type-like (PascalCase) → t
    if (/^[A-Z]/.test(token)) return "t";
    // booleans / null / undefined
    if (token === "true" || token === "false" || token === "null" || token === "undefined") {
      return "v";
    }
    return null;
  }
  return null;
}

export function HighlightTsx({ source }: { source: string }): ReactNode {
  const out: Token[] = [];
  for (const match of source.matchAll(PATTERN)) {
    const groups = (match.groups ?? {}) as Record<string, string | undefined>;
    const text = match[0];
    out.push({ cls: classify(text, groups), text });
  }
  return (
    <>
      {out.map((t, i) =>
        t.cls ? (
          <span key={i} className={t.cls}>
            {t.text}
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        ),
      )}
    </>
  );
}
