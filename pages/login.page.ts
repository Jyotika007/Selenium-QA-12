import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { LoginLocators } from '../locators/login.locator.ts';

export class LoginPage {
  private readonly driver: WebDriver;
  private readonly locators: LoginLocators;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.locators = new LoginLocators();
  }

  async navigateToLoginPage(url: string): Promise<void> {
    await this.driver.get(url);
    await this.findVisible(this.locators.emailInput);
  }

  async login(email: string, password: string): Promise<void> {
    await (await this.findVisible(this.locators.emailInput)).sendKeys(email);
    await (await this.findVisible(this.locators.passwordInput)).sendKeys(password);
    await (await this.findVisible(this.locators.loginButton)).click();
  }

  async getToastMessage(): Promise<string> {
    const toast = await this.driver.findElement(this.locators.toastMessage);
    return toast.getText();
  }

  private async findVisible(locator: By): Promise<WebElement> {
    const element = await this.driver.wait(until.elementLocated(locator), 15000);
    return this.driver.wait(until.elementIsVisible(element), 15000);
  }
}
