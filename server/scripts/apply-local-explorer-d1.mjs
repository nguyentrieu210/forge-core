#!/usr/bin/env node
/** Apply a SQL file to the D1 instance held by the active local Wrangler worker. */
import { readFile } from "node:fs/promises";

const [sqlPath, endpoint = "http://127.0.0.1:8800"] = process.argv.slice(2);
if (!sqlPath) throw new Error("usage: node apply-local-explorer-d1.mjs <file.sql> [explorer-endpoint]");

function splitStatements(source) {
  const statements = [];
  let start = 0;
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== "'") {
      if (source[index] === ";" && !quoted) {
        const statement = source.slice(start, index).trim();
        if (statement) statements.push(statement);
        start = index + 1;
      }
      continue;
    }
    if (quoted && source[index + 1] === "'") {
      index += 1;
    } else {
      quoted = !quoted;
    }
  }
  const last = source.slice(start).trim();
  if (last) statements.push(last);
  if (quoted) throw new Error("Unterminated SQL string literal");
  return statements;
}

const explorer = `${endpoint.replace(/\/$/, "")}/cdn-cgi/explorer/api`;
const databases = await fetch(`${explorer}/d1/database`).then(async (response) => {
  if (!response.ok) throw new Error(`Cannot access local Explorer: ${response.status}`);
  return response.json();
});
const database = databases.result?.find((entry) => entry.name === "DB");
if (!database?.uuid) throw new Error("Active local worker has no DB binding");

const statements = splitStatements(await readFile(sqlPath, "utf8"));
let applied = 0;
for (let index = 0; index < statements.length; index += 20) {
  const batch = statements.slice(index, index + 20).map((sql) => ({ sql }));
  const response = await fetch(`${explorer}/d1/database/${database.uuid}/raw`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ batch }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success || payload.result?.some((result) => !result.success)) {
    throw new Error(`Batch ${Math.floor(index / 20) + 1} failed: ${JSON.stringify(payload)}`);
  }
  applied += batch.length;
}

console.log(JSON.stringify({ database: database.uuid, statements: applied }));
