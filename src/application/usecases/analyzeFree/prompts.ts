import { systemPromptFree, userPromptFree } from '@/config/prompts';
import type { PageType } from '@/domain/types/uxray';

const normalizePageType = (value: string): PageType => {
  const normalized = value.toLowerCase();
  if (normalized.includes('dashboard')) return 'dashboard';
  if (normalized.includes('app')) return 'app';
  return 'landing';
};

export const buildSystemPrompt = () => systemPromptFree;

export const buildUserPrompt = (params: {
  pageType: string;
  optionalContext?: string;
  inputType?: 'image' | 'url';
  url?: string;
}) => {
  return userPromptFree({ pageType: normalizePageType(params.pageType) });
};
