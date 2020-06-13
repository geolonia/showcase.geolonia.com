const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({width: 1200, height: 630})
  await page.goto('http://localhost:3000/')

  setTimeout(async () => {
    await page.screenshot({ path: 'screenshot.png' })
    await browser.close()
  }, 5000);
})();
