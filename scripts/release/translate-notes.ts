import { readFileSync, writeFileSync } from 'node:fs';

export function resolveChatCompletionsEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    return 'https://api.openai.com/v1/chat/completions';
  }

  const normalized = trimmed.replace(/\/+$/, '');
  if (normalized.endsWith('/chat/completions')) {
    return normalized;
  }

  return `${normalized}/chat/completions`;
}

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

async function translateWithApi(params: {
  text: string;
  apiKey: string;
  model: string;
  endpoint: string;
}): Promise<string> {
  const { text, apiKey, model, endpoint } = params;

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'Translate GitHub release notes from English to Simplified Chinese. Keep markdown structure, code blocks, links, issue numbers, and version identifiers unchanged.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.2,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const data = (await response.json()) as ChatCompletionsResponse;
  const translated = data.choices?.[0]?.message?.content?.trim();

  if (!translated) {
    throw new Error('Translation response did not include content');
  }

  return translated;
}

async function main(): Promise<void> {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath || !outputPath) {
    console.error('Usage: bun run scripts/release/translate-notes.ts <english-input.md> <chinese-output.md>');
    process.exit(1);
  }

  const englishBody = readFileSync(inputPath, 'utf-8').trim();
  if (!englishBody) {
    writeFileSync(outputPath, '', 'utf-8');
    return;
  }

  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.RELEASE_TRANSLATION_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini';
  const endpoint = resolveChatCompletionsEndpoint(process.env.RELEASE_TRANSLATION_BASE_URL || '');

  if (!apiKey) {
    writeFileSync(outputPath, englishBody, 'utf-8');
    console.log('OPENAI_API_KEY not set. Fallback to English notes.');
    return;
  }

  try {
    const translated = await translateWithApi({
      text: englishBody,
      apiKey,
      model,
      endpoint,
    });
    writeFileSync(outputPath, translated, 'utf-8');
    console.log(`Translated notes written to ${outputPath}`);
  } catch (error) {
    writeFileSync(outputPath, englishBody, 'utf-8');
    console.log(`Translation failed (${String(error)}). Fallback to English notes.`);
  }
}

if (import.meta.main) {
  await main();
}
