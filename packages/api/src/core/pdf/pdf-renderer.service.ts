import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'puppeteer';

// Tailwind v2 compiled CSS, injected into every rendered page — the exact
// mechanism Invoify uses, so ported templates render pixel-identically without
// any build-time CSS pipeline in this package.
export const TAILWIND_CSS_URL =
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';

// Generic HTML → PDF rendering over a lazily-launched, reused headless Chromium.
// Knows nothing about documents or domains (core/ rule): callers hand it markup,
// they get bytes back. Templates live with the modules that own the documents.
@Injectable()
export class PdfRendererService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfRendererService.name);
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;

  async renderHtmlToPdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, {
        // networkidle0 lets the Google-Fonts + CDN stylesheet requests finish so
        // documents render with full typography; puppeteer's public type for
        // setContent narrows this union even though runtime supports it.
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'] as unknown as 'load',
        timeout: 45_000,
      });
      await page.addStyleTag({ url: TAILWIND_CSS_URL });
      const pdf = await page.pdf({
        format: 'a4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  // Launch once on first use so booting/tests never pay the Chromium cost.
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }
    this.launching ??= (async () => {
      const puppeteer = (await import('puppeteer')).default;
      const launched = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true,
      });
      this.logger.log('Headless browser ready for PDF rendering');
      return launched;
    })();
    try {
      this.browser = await this.launching;
      return this.browser;
    } catch (error) {
      this.launching = null;
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
      this.launching = null;
    }
  }
}
