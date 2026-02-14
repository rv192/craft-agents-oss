#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def translate_with_openai_api(text: str, api_key: str, model: str) -> str:
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "Translate GitHub release notes from English to Simplified Chinese. Keep markdown structure, code blocks, links, issue numbers, and version identifiers unchanged.",
            },
            {"role": "user", "content": text},
        ],
        "temperature": 0.2,
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)
        return data["choices"][0]["message"]["content"].strip()


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python scripts/release/translate-notes.py <english-input.md> <chinese-output.md>", file=sys.stderr)
        return 1

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    with open(input_path, "r", encoding="utf-8") as f:
        english_body = f.read().strip()

    if not english_body:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("")
        return 0

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    model = os.environ.get("RELEASE_TRANSLATION_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

    if not api_key:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(english_body)
        print("OPENAI_API_KEY not set. Fallback to English notes.")
        return 0

    try:
        translated = translate_with_openai_api(english_body, api_key, model)
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError, IndexError, json.JSONDecodeError) as exc:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(english_body)
        print(f"Translation failed ({exc}). Fallback to English notes.")
        return 0

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(translated)

    print(f"Translated notes written to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
