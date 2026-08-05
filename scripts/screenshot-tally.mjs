import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(
  "https://tally.so/embed/dW8jKN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1",
  { waitUntil: "networkidle", timeout: 45000 }
);
await page.waitForTimeout(1500);
await page.screenshot({ path: "ui-screenshots/tally-qualify-form.png", fullPage: true });
await browser.close();
console.log("done");
