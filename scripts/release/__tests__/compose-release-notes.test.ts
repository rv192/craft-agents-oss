import { describe, expect, it } from 'bun:test';
import { composeBilingualReleaseNotes } from '../compose-release-notes';

describe('composeBilingualReleaseNotes', () => {
  it('builds bilingual markdown with upstream metadata and both sections', () => {
    const output = composeBilingualReleaseNotes({
      version: 'v1.2.3',
      upstreamRepo: 'lukilabs/craft-agents-oss',
      upstreamReleaseUrl: 'https://github.com/lukilabs/craft-agents-oss/releases/tag/v1.2.3',
      englishBody: '## Added\n\n- Feature A',
      chineseBody: '## 新增\n\n- 功能 A',
    });

    expect(output).toContain('# v1.2.3 (Bilingual Release)');
    expect(output).toContain('Upstream repository: `lukilabs/craft-agents-oss`');
    expect(output).toContain('## English (Official)');
    expect(output).toContain('## Added');
    expect(output).toContain('## 中文（自动翻译）');
    expect(output).toContain('## 新增');
  });
});
