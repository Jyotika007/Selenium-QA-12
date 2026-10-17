import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";
import edge from "selenium-webdriver/edge.js";
import { config } from "./config.ts";

export async function createDriver(
  browser: "chrome" | "firefox" | "edge" = "chrome"
): Promise<WebDriver> {
  const isHeadless = config.headless;
  const builder = new Builder().forBrowser(browser);

  if (browser === "chrome") {
    const options = new chrome.Options();
    if (isHeadless) {
      options.addArguments("--headless=new");
    }
    options.addArguments("--window-size=1920,1080");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    builder.setChromeOptions(options);
  } else if (browser === "firefox") {
    const options = new firefox.Options();
    if (isHeadless) {
      options.addArguments("-headless");
    }
    builder.setFirefoxOptions(options);
  } else if (browser === "edge") {
    const options = new edge.Options();
    if (isHeadless) {
      options.addArguments("--headless=new");
    }
    builder.setEdgeOptions(options);
  }

  const driver = await builder.build();
  await driver.manage().window().setRect({ width: 1920, height: 1080 });
  return driver;
}