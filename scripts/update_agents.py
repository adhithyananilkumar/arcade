import os

dirs = ["apps", "domains", "infrastructure", "shared", "docs"]

append_text = """

## Architecture Protection & Agent Behavior
- **Architecture is complete.** Do NOT reorganize folders or move code unless explicitly requested.
- **When uncertain, ask instead of assuming.** If a change appears to require an architectural modification or bypassing a boundary, ask for explicit approval before proceeding.
- **Do not invent abstractions.** Prefer extending existing patterns.
- Treat any structural change as requiring explicit approval.
"""

for d in dirs:
    filepath = f"{d}/AGENTS.md"
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if "Architecture Protection & Agent Behavior" not in content:
            with open(filepath, 'a', encoding='utf-8') as f:
                f.write(append_text)
            print(f"Updated {filepath}")
        else:
            print(f"Already updated {filepath}")
    else:
        print(f"File not found: {filepath}")
