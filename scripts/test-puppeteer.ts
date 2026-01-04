import { launchBrowser } from '@/infrastructure/audit/chromium';

async function run() {
  console.log('Launching Chromium...');
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.goto('about:blank');
  } finally {
    await browser.close();
  }

  console.log('Chromium launched and closed successfully.');
}

run().catch((error) => {
  console.error('Puppeteer test failed:', error);
  process.exit(1);
});
