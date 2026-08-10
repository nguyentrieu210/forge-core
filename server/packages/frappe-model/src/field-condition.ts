/**
 * A restricted evaluator for Frappe field conditions (`mandatory_depends_on`).
 *
 * Frappe writes these as JavaScript (`eval:doc.is_return == 1`). Running actual
 * JavaScript on the server to decide a validation rule would hand every DocType
 * author remote code execution, so this parses a small, closed grammar instead:
 *
 *     condition  := or-expression
 *     or-expression := and-expression ('||' and-expression)*
 *     and-expression := primary ('&&' primary)*
 *     primary    := clause | '(' condition ')'
 *     clause     := ['!'] 'doc.' field [ op value ]
 *     op         := '==' | '===' | '!=' | '!==' | '>' | '>=' | '<' | '<=' | 'in'
 *     value      := number | 'true' | 'false' | quoted string | array of those
 *
 * A bare `fieldname` (no `eval:`) is Frappe's shorthand for "that field is
 * truthy" and is supported too.
 *
 * Anything outside the grammar is REJECTED WHEN THE DOCTYPE IS SAVED rather than
 * ignored at runtime. Ignoring it would silently drop a business rule the author
 * believed was in force; refusing the metadata means the rule is either enforced
 * or visibly absent.
 *
 * Mixed `&&`/`||` at the same level is refused. Authors may use parentheses to
 * make the grouping explicit; those parentheses are parsed by this evaluator,
 * never handed to JavaScript.
 */

import { errors } from "../../core/src/index.js";
import type { JsonObject, JsonValue } from "../../contracts/src/index.js";

type Comparison = "==" | "!=" | ">" | ">=" | "<" | "<=" | "in";

interface Clause {
  negated: boolean;
  field: string;
  operator?: Comparison;
  value?: JsonValue;
}

interface ParsedCondition { root: ConditionNode; }
type ConditionNode =
  | { kind: "clause"; clause: Clause }
  | { kind: "and" | "or"; terms: ConditionNode[] };

const CLAUSE = /^(!?)\s*doc\.([A-Za-z_][A-Za-z0-9_]*)\s*(===|!==|==|!=|>=|<=|>|<|\bin\b)?\s*(.*)$/;

/** Parses a condition, throwing a validation error when it is outside the grammar. */
export function parseFieldCondition(expression: string): ParsedCondition {
  const trimmed = expression.trim();
  if (!trimmed) throw errors.validation("A field condition cannot be empty");

  if (!trimmed.startsWith("eval:")) {
    // Shorthand: a bare field name means "this other field has a value".
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
      throw errors.validation(`Unsupported field condition: ${expression}`);
    }
    return { root: { kind: "clause", clause: { negated: false, field: trimmed } } };
  }

  const body = trimmed.slice("eval:".length).trim();
  if (!body) throw errors.validation("A field condition cannot be empty");
  return { root: parseBooleanExpression(body, expression) };
}

function parseBooleanExpression(source: string, original: string): ConditionNode {
  const body = stripOuterParentheses(source.trim(), original);
  const topLevelOperators = operatorsAtTopLevel(body, original);
  if (topLevelOperators.has("&&") && topLevelOperators.has("||")) {
    throw errors.validation("A field condition cannot mix && and || without parentheses");
  }

  const orTerms = splitAtTopLevel(body, "||", original);
  if (orTerms.length > 1) return { kind: "or", terms: orTerms.map((term) => parseBooleanExpression(term, original)) };

  const andTerms = splitAtTopLevel(body, "&&", original);
  if (andTerms.length > 1) return { kind: "and", terms: andTerms.map((term) => parseBooleanExpression(term, original)) };

  return { kind: "clause", clause: parseClause(body, original) };
}

function stripOuterParentheses(source: string, original: string): string {
  let body = source;
  while (body.startsWith("(")) {
    const close = matchingClosingParen(body, 0, original);
    if (close !== body.length - 1) break;
    body = body.slice(1, -1).trim();
    if (!body) throw errors.validation(`Unsupported field condition: ${original}`);
  }
  return body;
}

function operatorsAtTopLevel(source: string, original: string): Set<"&&" | "||"> {
  const operators = new Set<"&&" | "||">();
  visitTopLevel(source, original, (index) => {
    const token = source.slice(index, index + 2);
    if (token === "&&" || token === "||") operators.add(token);
  });
  return operators;
}

function splitAtTopLevel(source: string, operator: "&&" | "||", original: string): string[] {
  const parts: string[] = [];
  let cursor = 0;
  visitTopLevel(source, original, (index) => {
    if (source.slice(index, index + 2) !== operator) return;
    const part = source.slice(cursor, index).trim();
    if (!part) throw errors.validation(`Unsupported field condition: ${original}`);
    parts.push(part);
    cursor = index + 2;
  });
  const finalPart = source.slice(cursor).trim();
  if (!finalPart) throw errors.validation(`Unsupported field condition: ${original}`);
  parts.push(finalPart);
  return parts;
}

function visitTopLevel(source: string, original: string, onOperator: (index: number) => void): void {
  let parentheses = 0;
  let brackets = 0;
  let quote: "'" | '"' | null = null;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!;
    if (quote) {
      if (character === "\\") { index += 1; continue; }
      if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"') { quote = character; continue; }
    if (character === "[") { brackets += 1; continue; }
    if (character === "]") { brackets -= 1; if (brackets < 0) throw errors.validation(`Unsupported field condition: ${original}`); continue; }
    if (character === "(") { parentheses += 1; continue; }
    if (character === ")") { parentheses -= 1; if (parentheses < 0) throw errors.validation(`Unsupported field condition: ${original}`); continue; }
    if (parentheses === 0 && brackets === 0 && (source.startsWith("&&", index) || source.startsWith("||", index))) onOperator(index);
  }
  if (quote || parentheses !== 0 || brackets !== 0) throw errors.validation(`Unsupported field condition: ${original}`);
}

function matchingClosingParen(source: string, start: number, original: string): number {
  let depth = 0;
  let quote: "'" | '"' | null = null;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index]!;
    if (quote) {
      if (character === "\\") { index += 1; continue; }
      if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"') { quote = character; continue; }
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) return index;
      if (depth < 0) break;
    }
  }
  throw errors.validation(`Unsupported field condition: ${original}`);
}

function parseClause(part: string, original: string): Clause {
  const match = CLAUSE.exec(part.trim());
  if (!match) throw errors.validation(`Unsupported field condition: ${original}`);
  const [, bang, field, rawOperator, rawValue] = match;
  const negated = bang === "!";

  if (!rawOperator) {
    if (rawValue && rawValue.trim()) throw errors.validation(`Unsupported field condition: ${original}`);
    return { negated, field: field! };
  }
  const operator = normalizeOperator(rawOperator);
  const value = parseLiteral(rawValue ?? "", original);
  if (operator === "in" && !Array.isArray(value)) {
    throw errors.validation(`The "in" operator needs a list: ${original}`);
  }
  return { negated, field: field!, operator, value };
}

function normalizeOperator(raw: string): Comparison {
  const trimmed = raw.trim();
  if (trimmed === "===") return "==";
  if (trimmed === "!==") return "!=";
  return trimmed as Comparison;
}

function parseLiteral(raw: string, original: string): JsonValue {
  const text = raw.trim();
  if (!text) throw errors.validation(`Field condition is missing a value: ${original}`);
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (/^["'].*["']$/.test(text)) return text.slice(1, -1);
  if (text.startsWith("[")) {
    // Single quotes are legal in JavaScript but not JSON; normalising them keeps
    // real-world expressions working without accepting arbitrary syntax.
    try {
      return JSON.parse(text.replace(/'/g, '"')) as JsonValue;
    } catch {
      throw errors.validation(`Field condition list is malformed: ${original}`);
    }
  }
  throw errors.validation(`Unsupported field condition value: ${original}`);
}

/**
 * Evaluates a condition against a document.
 *
 * `submitted` is the incoming payload and `existing` the stored document; a field
 * absent from the payload falls back to its stored value, so a partial save is
 * judged against the document as it will be, not as the request happened to
 * describe it.
 */
export function evaluateFieldCondition(expression: string, submitted: JsonObject, existing?: JsonObject): boolean {
  let parsed: ParsedCondition;
  try {
    parsed = parseFieldCondition(expression);
  } catch {
    // Unreachable for stored metadata: `assertFieldConditionSupported` rejects an
    // unparseable expression when the DocType is saved. Treated as "no condition"
    // rather than throwing, so a legacy row can never make a document unsavable.
    return false;
  }
  return evaluateNode(parsed.root, submitted, existing);
}

function evaluateNode(node: ConditionNode, submitted: JsonObject, existing?: JsonObject): boolean {
  if (node.kind === "clause") return evaluateClause(node.clause, submitted, existing);
  if (node.kind === "and") return node.terms.every((term) => evaluateNode(term, submitted, existing));
  return node.terms.some((term) => evaluateNode(term, submitted, existing));
}

function evaluateClause(clause: Clause, submitted: JsonObject, existing?: JsonObject): boolean {
  const raw = clause.field in submitted ? submitted[clause.field] : existing?.[clause.field];
  const outcome = clause.operator ? compare(clause.operator, raw, clause.value) : truthy(raw);
  return clause.negated ? !outcome : outcome;
}

function compare(operator: Comparison, left: JsonValue | undefined, right: JsonValue | undefined): boolean {
  if (operator === "in") {
    const list = Array.isArray(right) ? right : [];
    return list.some((entry) => looseEquals(left, entry));
  }
  if (operator === "==") return looseEquals(left, right);
  if (operator === "!=") return !looseEquals(left, right);

  const a = numeric(left);
  const b = numeric(right);
  // A non-numeric comparison is neither true nor false in any useful sense; the
  // condition simply does not apply, which is the same answer JavaScript's NaN
  // comparisons would give.
  if (a === null || b === null) return false;
  if (operator === ">") return a > b;
  if (operator === ">=") return a >= b;
  if (operator === "<") return a < b;
  return a <= b;
}

/**
 * Frappe stores checkboxes as 0/1 and often compares them to `1` or `true`, and
 * numbers arriving from a query string are strings. Comparison is therefore loose
 * across those representations — strictly comparing would make ordinary
 * conditions silently never fire.
 */
function looseEquals(left: JsonValue | undefined, right: JsonValue | undefined): boolean {
  if (left === right) return true;
  if (left === undefined || left === null) return right === undefined || right === null || right === "" || right === false || right === 0;
  if (typeof left === "boolean" || typeof right === "boolean") return boolish(left) === boolish(right);
  const a = numeric(left);
  const b = numeric(right);
  if (a !== null && b !== null) return a === b;
  return String(left) === String(right);
}

function truthy(value: JsonValue | undefined): boolean {
  if (value === undefined || value === null || value === "" || value === false || value === 0) return false;
  if (value === "0") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function boolish(value: JsonValue | undefined): boolean {
  return truthy(value);
}

function numeric(value: JsonValue | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

/**
 * Validates a condition at DocType-save time.
 *
 * This is the gate that makes runtime evaluation safe: a condition the server
 * cannot enforce is never allowed into stored metadata, so nobody can define a
 * rule that appears to exist but is quietly ignored.
 */
export function assertFieldConditionSupported(expression: string, fieldname: string, property: string): void {
  try {
    parseFieldCondition(expression);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unsupported";
    throw errors.validation(`${fieldname}.${property} cannot be enforced by the server: ${detail}`, { fieldname });
  }
}
