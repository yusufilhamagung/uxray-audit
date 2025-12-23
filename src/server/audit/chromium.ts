import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { serverEnv } from '@/lib/env/server';

export type ChromiumFailureCode =
  | 'AUDIT_EDGE_RUNTIME'
  | 'AUDIT_CHROMIUM_ASSETS_MISSING'
  | 'AUDIT_CHROMIUM_NOT_FOUND';

export class ChromiumUnavailableError extends Error {
  code: ChromiumFailureCode;
  constructor(code: ChromiumFailureCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ChromiumUnavailableError';
    this.code = code;
    if (cause) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export const isChromiumUnavailableError = (error: unknown): error is ChromiumUnavailableError =>
  error instanceof ChromiumUnavailableError ||
  (typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'ChromiumUnavailableError');

const isEdgeRuntime = () =>
  process.env.NEXT_RUNTIME === 'edge' ||
  typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== 'undefined';

async function ensureExecutablePath(executablePath: string) {
  try {
    await access(executablePath, constants.X_OK);
  } catch {
    throw new ChromiumUnavailableError(
      'AUDIT_CHROMIUM_NOT_FOUND',
      `Chromium executable not found at ${executablePath}. ` +
        'Set CHROME_EXECUTABLE_PATH or PUPPETEER_EXECUTABLE_PATH, or configure AUDIT_WORKER_URL.'
    );
  }
}

async function resolveExecutablePath() {
  if (isEdgeRuntime()) {
    throw new ChromiumUnavailableError(
      'AUDIT_EDGE_RUNTIME',
      'Chromium cannot run in Edge runtime. Use Node.js runtime or set AUDIT_WORKER_URL.'
    );
  }

  const overridePath = serverEnv.chromeExecutablePath || serverEnv.puppeteerExecutablePath;
  if (overridePath) {
    await ensureExecutablePath(overridePath);
    return overridePath;
  }

  try {
    const executablePath = await chromium.executablePath();
    if (!executablePath) {
      throw new ChromiumUnavailableError(
        'AUDIT_CHROMIUM_ASSETS_MISSING',
        'Chromium executable path could not be resolved. Ensure @sparticuz/chromium is bundled or set AUDIT_WORKER_URL.'
      );
    }
    await ensureExecutablePath(executablePath);
    return executablePath;
  } catch (error) {
    if (isChromiumUnavailableError(error)) {
      throw error;
    }
    throw new ChromiumUnavailableError(
      'AUDIT_CHROMIUM_ASSETS_MISSING',
      'Chromium assets are missing from the serverless bundle. Ensure output tracing includes @sparticuz/chromium/bin or set AUDIT_WORKER_URL.',
      error
    );
  }
}

export async function launchBrowser() {
  const executablePath = await resolveExecutablePath();
  const headlessMode = chromium.headless === 'shell' ? 'shell' : true;

  return puppeteer.launch({
    executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: headlessMode
  });
}
