import { describe, expect, it } from 'bun:test';

import { resolveChatCompletionsEndpoint } from '../translate-notes';

describe('resolveChatCompletionsEndpoint', () => {
  it('uses OpenAI default endpoint when BASE_URL is empty', () => {
    expect(resolveChatCompletionsEndpoint('')).toBe('https://api.openai.com/v1/chat/completions');
  });

  it('normalizes compatible BASE_URL and appends /chat/completions', () => {
    expect(resolveChatCompletionsEndpoint('https://openrouter.ai/api/v1')).toBe(
      'https://openrouter.ai/api/v1/chat/completions',
    );
    expect(resolveChatCompletionsEndpoint('https://example.com/v1/')).toBe('https://example.com/v1/chat/completions');
  });

  it('keeps /chat/completions if already provided', () => {
    expect(resolveChatCompletionsEndpoint('https://example.com/v1/chat/completions')).toBe(
      'https://example.com/v1/chat/completions',
    );
  });
});
