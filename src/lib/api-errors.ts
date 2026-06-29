/**
 * Standard API error types for handling various failure modes.
 */
export type ApiErrorType = 
  | 'UNAUTHORIZED' // Invalid API key
  | 'QUOTA_EXCEEDED' // Rate limit reached
  | 'SAFETY_BLOCKED' // Content blocked by safety filters
  | 'NETWORK_ERROR' // Connection issues
  | 'INTERNAL_ERROR' // Server-side issues
  | 'UNKNOWN';

/**
 * Maps error types to user-friendly feedback messages.
 */
export const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  UNAUTHORIZED: "Our AI keys seem to have expired! Please check developer settings.",
  QUOTA_EXCEEDED: "Wow, we're trending! Our AI is at capacity. Take a breather and try in a minute.",
  SAFETY_BLOCKED: "Whoops! The AI algorithmic safety guard flagged that request. Let's keep it safe/original.",
  NETWORK_ERROR: "Connection lost in the cloud. Check your internet and let's try again.",
  INTERNAL_ERROR: "Our neuro-engine hit a snag. We're rebooting the trend modules now.",
  UNKNOWN: "An unexpected glitch occurred in the matrix. Our team has been alerted."
};

/**
 * Helper to categorize standard Error objects into ApiErrorType
 */
export function categorizeGeminiError(error: any): ApiErrorType {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('api key') || message.includes('401') || message.includes('unauthorized')) {
    return 'UNAUTHORIZED';
  }
  
  if (message.includes('quota') || message.includes('429') || message.includes('too many requests')) {
    return 'QUOTA_EXCEEDED';
  }
  
  if (message.includes('safety') || message.includes('candidate was blocked')) {
    return 'SAFETY_BLOCKED';
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'NETWORK_ERROR';
  }
  
  if (message.includes('500') || message.includes('internal')) {
    return 'INTERNAL_ERROR';
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'INTERNAL_ERROR'; // Or custom error type if needed, but INTERNAL_ERROR fits the rebooting vibe
  }
  
  return 'UNKNOWN';
}
