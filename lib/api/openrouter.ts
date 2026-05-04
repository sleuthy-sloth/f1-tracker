/**
 * AI API Client
 * Server-side client supporting NVIDIA NIM (primary) and OpenRouter (fallback).
 * OpenAI-compatible — uses fetch directly, no SDK dependency.
 * Used to fetch real F1 data (fantasy driver stats, PU component usage) that
 * isn't available via the OpenF1 API.
 */

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'deepseek-ai/deepseek-v4-pro';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// ============================================================================
// Types
// ============================================================================

export interface AiClientConfig {
  apiKey: string;
  model?: string;
}

export interface WebSearchOptions {
  searchContextSize?: 'small' | 'medium' | 'large';
}

export interface AiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  source: 'nvidia' | 'openrouter' | 'cache';
  cachedAt?: string;
}

export interface ApiKeyStatus {
  configured: boolean;
  keyPreview?: string;
  provider: 'nvidia' | 'openrouter' | 'none';
}

// ============================================================================
// Client Interface
// ============================================================================

export interface AiClient {
  fetchStructuredData<T>(
    prompt: string,
    schema: Record<string, unknown>,
    options?: WebSearchOptions
  ): Promise<AiResponse<T>>;
  getApiKeyStatus(): ApiKeyStatus;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract JSON from a potentially messy response string
 */
function extractJsonFromResponse(content: string): string {
  // Try direct parse first
  try {
    JSON.parse(content);
    return content;
  } catch {
    // Not valid JSON, try to extract
  }

  // Try to find JSON block in markdown
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) return jsonMatch[1].trim();

  // Try to find JSON object in the content
  const objMatch = content.match(/\{[\s\S]*\}/);
  if (objMatch) return objMatch[0];

  return content;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Client Factory
// ============================================================================

/**
 * Create an AI client instance.
 *
 * Priority:
 * 1. NVIDIA (if NVIDIA_API_KEY env var is set)
 * 2. OpenRouter (if OPENROUTER_API_KEY env var is set)
 *
 * @param config - Optional configuration overrides
 * @returns AiClient instance
 *
 * @example
 * const client = createAiClient();
 * const result = await client.fetchStructuredData<DriverStats>(prompt, schema);
 */
export function createAiClient(config?: Partial<AiClientConfig>): AiClient {
  // Determine provider and credentials
  const nvidiaKey = config?.apiKey || process.env.NVIDIA_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';

  const useNvidia = nvidiaKey.length > 0;
  const effectiveKey = useNvidia ? nvidiaKey : openrouterKey;
  const baseUrl = useNvidia ? NVIDIA_BASE : OPENROUTER_BASE;
  const model = config?.model || (useNvidia ? NVIDIA_MODEL : OPENROUTER_MODEL);

  /**
   * Fetch structured data from the AI provider
   */
  async function fetchStructuredData<T>(
    prompt: string,
    schema: Record<string, unknown>,
    _options?: WebSearchOptions
  ): Promise<AiResponse<T>> {
    // Check API key
    if (!effectiveKey) {
      return {
        success: false,
        error: 'No AI API key configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY in .env.local',
        data: null,
        source: useNvidia ? 'nvidia' : 'openrouter',
      };
    }

    // Build system message
    const systemMessage =
      'You are a precise F1 data extraction assistant. Output ONLY valid JSON matching the provided schema. No markdown, no explanation, no extra text.';

    // Build user message with schema
    const schemaDescription = JSON.stringify(schema, null, 2);
    const userMessage = `${prompt}\n\nRespond with JSON matching this schema:\n${schemaDescription}`;

    // Build request payload
    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    };

    // NVIDIA doesn't support web_search tool — rely on model training instead
    // DeepSeek V4 Pro has strong knowledge of current F1 data

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${effectiveKey}`,
    };

    if (!useNvidia) {
      headers['HTTP-Referer'] = 'https://sectorone.app';
      headers['X-Title'] = 'SectorOne F1 Dashboard';
    }

    // Make request with retries
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        });

        // Handle rate limiting
        if (response.status === 429) {
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS);
            continue;
          }
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            data: null,
            source: useNvidia ? 'nvidia' : 'openrouter',
          };
        }

        // Handle payment required (OpenRouter)
        if (response.status === 402) {
          return {
            success: false,
            error: 'Insufficient credits.',
            data: null,
            source: 'openrouter',
          };
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const responseData = await response.json();

        // Extract content from response
        const content = responseData.choices?.[0]?.message?.content;

        if (!content) {
          return {
            success: false,
            error: 'No content in response',
            data: null,
            source: useNvidia ? 'nvidia' : 'openrouter',
          };
        }

        // Parse JSON from content
        const jsonString = extractJsonFromResponse(content);

        try {
          const parsedData = JSON.parse(jsonString) as T;
          return {
            success: true,
            data: parsedData,
            source: useNvidia ? 'nvidia' : 'openrouter',
          };
        } catch {
          return {
            success: false,
            error: 'Invalid JSON response from model',
            data: null,
            source: useNvidia ? 'nvidia' : 'openrouter',
          };
        }
      } catch (error) {
        lastError = error as Error;

        // Retry on network errors
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed after retries',
      data: null,
      source: useNvidia ? 'nvidia' : 'openrouter',
    };
  }

  /**
   * Get API key configuration status
   */
  function getApiKeyStatus(): ApiKeyStatus {
    if (!effectiveKey) {
      return { configured: false, provider: 'none' };
    }

    const preview =
      effectiveKey.length > 11
        ? `${effectiveKey.slice(0, 7)}...${effectiveKey.slice(-4)}`
        : '***';

    return {
      configured: true,
      keyPreview: preview,
      provider: useNvidia ? 'nvidia' : 'openrouter',
    };
  }

  return {
    fetchStructuredData,
    getApiKeyStatus,
  };
}
