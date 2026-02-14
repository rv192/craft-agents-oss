import { readFileSync, writeFileSync } from 'node:fs';

export function composeBilingualReleaseNotes(params: {
  version: string;
  upstreamRepo: string;
  upstreamReleaseUrl: string;
  englishBody: string;
  chineseBody: string;
}): string {
  const { version, upstreamRepo, upstreamReleaseUrl, englishBody, chineseBody } = params;

  const normalizedEnglish = englishBody.trim();
  const normalizedChinese = chineseBody.trim();

  return [
    `# ${version} (Bilingual Release)`,
    '',
    `- Upstream repository: \`${upstreamRepo}\``,
    `- Upstream release: ${upstreamReleaseUrl}`,
    '',
    '> Chinese section is machine-translated and reviewed in this fork workflow.',
    '',
    '---',
    '',
    '## English (Official)',
    '',
    normalizedEnglish,
    '',
    '---',
    '',
    '## 中文（自动翻译）',
    '',
    normalizedChinese,
    '',
  ].join('\n');
}

function main(): void {
  const [version, upstreamRepo, upstreamReleaseUrl, englishFile, chineseFile, outputFile] = process.argv.slice(2);

  if (!version || !upstreamRepo || !upstreamReleaseUrl || !englishFile || !chineseFile || !outputFile) {
    console.error(
      'Usage: bun run scripts/release/compose-release-notes.ts <version> <upstream-repo> <upstream-release-url> <english.md> <chinese.md> <output.md>',
    );
    process.exit(1);
  }

  const englishBody = readFileSync(englishFile, 'utf-8');
  const chineseBody = readFileSync(chineseFile, 'utf-8');
  const output = composeBilingualReleaseNotes({
    version,
    upstreamRepo,
    upstreamReleaseUrl,
    englishBody,
    chineseBody,
  });

  writeFileSync(outputFile, output, 'utf-8');
  console.log(`Wrote bilingual release notes to ${outputFile}`);
}

if (import.meta.main) {
  main();
}
