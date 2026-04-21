/**
 * Estimates the number of tokens in a text string.
 * Uses a rough heuristic: words × 1.3 (accounts for markdown formatting overhead).
 *
 * Note: This is an estimate. Actual token counts vary by tokenizer:
 * - GPT/Claude: ~0.75 words per token on average
 * - With markdown overhead, we use 1.3 multiplier for safety
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Split by whitespace and filter empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  // Apply 1.3x multiplier for markdown formatting overhead
  // and to be conservative with estimates
  return Math.ceil(wordCount * 1.3);
}

/**
 * Format a token count for display
 */
export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

/**
 * Check if token count exceeds common service limits
 */
export function checkTokenLimits(tokenCount: number): {
  claude3: boolean;
  claudeFree: boolean;
  chatgpt4: boolean;
  chatgpt4Turbo: boolean;
  perplexity: boolean;
} {
  return {
    claude3: tokenCount <= 200000, // Claude 3: 200K context
    claudeFree: tokenCount <= 25000, // Claude Free: ~25K limit
    chatgpt4: tokenCount <= 8000, // GPT-4: 8K context
    chatgpt4Turbo: tokenCount <= 128000, // GPT-4 Turbo: 128K context
    perplexity: tokenCount <= 32000, // Perplexity: ~32K limit
  };
}

/**
 * Get compatibility message for token count
 */
export function getTokenCompatibilityMessage(tokenCount: number): string {
  const limits = checkTokenLimits(tokenCount);
  const compatibleServices: string[] = [];
  const incompatibleServices: string[] = [];

  if (limits.claude3) compatibleServices.push('Claude 3 (200K)');
  else incompatibleServices.push('Claude 3');

  if (limits.claudeFree) compatibleServices.push('Claude Free (25K)');
  else incompatibleServices.push('Claude Free');

  if (limits.chatgpt4) compatibleServices.push('ChatGPT-4 (8K)');
  else incompatibleServices.push('ChatGPT-4');

  if (limits.chatgpt4Turbo) compatibleServices.push('ChatGPT-4 Turbo (128K)');
  else incompatibleServices.push('ChatGPT-4 Turbo');

  if (limits.perplexity) compatibleServices.push('Perplexity (32K)');
  else incompatibleServices.push('Perplexity');

  let message = `Estimated tokens: ${formatTokenCount(tokenCount)}\n\n`;

  if (compatibleServices.length > 0) {
    message += `✅ Compatible with:\n${compatibleServices.map((s) => `  • ${s}`).join('\n')}\n\n`;
  }

  if (incompatibleServices.length > 0) {
    message += `❌ May exceed limits for:\n${incompatibleServices.map((s) => `  • ${s}`).join('\n')}`;
  }

  return message;
}
