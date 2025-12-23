import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { serverEnv } from '@/lib/env/server';

async function ensureExecutablePath(executablePath: string) {
  try {
    await access(executablePath, constants.X_OK);
  } catch {
    const message =
      `Chromium executable not found at ${executablePath}. ` +
      'Set PUPPETEER_EXECUTABLE_PATH or ensure @sparticuz/chromium is available in your runtime.';
    console.error(message);
    throw new Error(message);
  }
}

async function resolveExecutablePath() {
  if (serverEnv.puppeteerExecutablePath) {
    await ensureExecutablePath(serverEnv.puppeteerExecutablePath);
    return serverEnv.puppeteerExecutablePath;
  }

  const bundledBinPath = path.join(
    process.cwd(),
    'node_modules',
    '@sparticuz',
    'chromium',
    'bin'
  );

  // In serverless runtimes, __dirname can resolve to a bundled chunk path (e.g. .next/server/chunks),
  // so point chromium to the package bin directory explicitly to avoid .next/server/bin lookups.
  const executablePath = await chromium.executablePath(bundledBinPath);
  if (!executablePath) {
    const message =
      'Chromium executable path could not be resolved. ' +
      'Ensure @sparticuz/chromium is installed or set PUPPETEER_EXECUTABLE_PATH.';
    console.error(message);
    throw new Error(message);
  }

  await ensureExecutablePath(executablePath);
  return executablePath;
}

export async function launchBrowser() {
  const executablePath = await resolveExecutablePath();
  const headlessMode = chromium.headless === 'shell' ? 'shell' : true;

  // Use @sparticuz/chromium defaults for Linux/CI and disable sandbox for container compatibility.
  return puppeteer.launch({
    executablePath,
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chromium.defaultViewport,
    headless: headlessMode
  });
}
