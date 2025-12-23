import puppeteer from 'puppeteer';
import { ICaptureService } from '@/application/ports/ICaptureService';

export class PuppeteerCaptureService implements ICaptureService {
  async capture(url: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true, // New headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport to standard desktop resolution
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate with timeout and strict waitUntil
      await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000 // 30s timeout
      });

      // Capture full page screenshot
      const buffer = await page.screenshot({
        type: 'png',
        fullPage: true 
      });

      return buffer as Buffer;
    } finally {
      await browser.close();
    }
  }
}
