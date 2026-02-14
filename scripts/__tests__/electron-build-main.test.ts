import { describe, expect, it } from 'bun:test';

import { resolveMcpBuildMode } from '../electron-build-main';

describe('resolveMcpBuildMode', () => {
  it('uses source mode when source entry exists', () => {
    const mode = resolveMcpBuildMode({
      sourceEntryExists: true,
      bundledEntryExists: true,
    });

    expect(mode).toBe('source');
  });

  it('falls back to bundled mode when source is missing but bundled entry exists', () => {
    const mode = resolveMcpBuildMode({
      sourceEntryExists: false,
      bundledEntryExists: true,
    });

    expect(mode).toBe('bundled');
  });

  it('fails when both source and bundled entries are missing', () => {
    const mode = resolveMcpBuildMode({
      sourceEntryExists: false,
      bundledEntryExists: false,
    });

    expect(mode).toBe('missing');
  });
});
