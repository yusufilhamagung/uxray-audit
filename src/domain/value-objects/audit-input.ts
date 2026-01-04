import type { PageType } from '@/domain/entities/audit-report';

export type ImageInput = {
  type: 'image';
  pageType: PageType;
  file?: File;
  imageBase64?: string;
  imageType?: string;
  context?: string;
};

export type UrlInput = {
  type: 'url';
  pageType: PageType;
  url: string;
  context?: string;
  imageBase64?: string;
  imageType?: string;
};

export type AuditInput = ImageInput | UrlInput;
