import { ICaptureService } from '@/application/ports/ICaptureService';
import { launchBrowser } from '@/server/chromium/launch';

export class PuppeteerCaptureService implements ICaptureService {
  async capture(url: string): Promise<Buffer> {
    let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;
    try {
      // Use shared launcher to support server/CI environments.
      browser = await launchBrowser();
    } catch (error) {
      console.error('Failed to launch Chromium for capture.', error);
      throw error;
    }

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
      if (browser) {
        await browser.close();
      }
    }
  }
}
