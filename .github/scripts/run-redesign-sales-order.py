from pathlib import Path

workflow = Path('.github/workflows/one-off-redesign-sales-order-backend-driven.yml')
text = workflow.read_text(encoding='utf-8')
start_marker = "          python - <<'PY'\n"
end_marker = "\n          PY\n"
start = text.find(start_marker)
end = text.find(end_marker, start + len(start_marker))
if start < 0 or end < 0:
    raise SystemExit('embedded patch script not found')
body = text[start + len(start_marker):end]
lines = []
for line in body.splitlines():
    lines.append(line[10:] if line.startswith('          ') else line)
script = '\n'.join(lines) + '\n'
exec(compile(script, '<sales-order-redesign>', 'exec'), {'__name__': '__main__'})
