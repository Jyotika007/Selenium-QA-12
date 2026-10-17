import { By, Key, until, WebDriver, WebElement } from "selenium-webdriver";
import { BranchLocators } from "../locators/branch.locators.ts";

export interface BranchAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface BranchCreateData {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
  admin: BranchAdminData;
}

export interface BranchUpdateData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: "Active" | "Inactive";
}

export class BranchPage {
  private readonly driver: WebDriver;
  private readonly locators: BranchLocators;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.locators = new BranchLocators();
  }

  async navigateToBranchList(baseUrl: string): Promise<void> {
    await this.driver.get(`${baseUrl}/`);
    await this.waitForPageLoad();
  }

  async openAddBranchForm(baseUrl?: string): Promise<void> {
    try {
      const btn = await this.findVisible(this.locators.addBranchButton, 3000);
      await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
      await this.driver.executeScript("arguments[0].click();", btn);
      await this.sleep(1000);
    } catch {
      // If button click is skipped or intercepted, direct navigation fallback
    }

    const currentUrl = await this.driver.getCurrentUrl();
    if (!currentUrl.includes("/branches/add")) {
      const target = baseUrl ? `${baseUrl}/branches/add` : "https://qa03.stage.chairlyo.com/branches/add";
      await this.driver.get(target);
    }
    await this.findVisible(this.locators.nameInput);
  }

  private async setInputValue(element: WebElement, value: string): Promise<void> {
    await this.driver.executeScript(`
      const el = arguments[0];
      const val = arguments[1];
      el.scrollIntoView({block: 'center'});
      el.focus();
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') ?
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set : null;
      if (nativeSetter) {
        nativeSetter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    `, element, value);
  }

  private async fillPhoneNumber(element: WebElement, phoneNumber: string): Promise<void> {
    const cleanDigits = phoneNumber.replace(/^\+?977\s*/, "");
    const fullPhone = `+977 ${cleanDigits}`;
    await this.setInputValue(element, fullPhone);
  }

  private async selectStatus(status: "Active" | "Inactive"): Promise<void> {
    try {
      const dropdown = await this.findVisible(this.locators.statusDropdown, 5000);
      await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", dropdown);
      await this.driver.executeScript(
        "arguments[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); arguments[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); arguments[0].click();",
        dropdown
      );
      await this.sleep(400);

      const option = await this.findVisible(this.locators.statusOption(status), 5000);
      await this.driver.executeScript(
        "arguments[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); arguments[0].click();",
        option
      );
      await this.sleep(500);
      await this.driver.executeScript("document.body.style.pointerEvents = 'auto';");
    } catch {
      await this.driver.executeScript(
        `const s = document.querySelector("select"); if (s) { s.value = arguments[0]; s.dispatchEvent(new Event('change', { bubbles: true })); } document.body.style.pointerEvents = 'auto';`,
        status
      );
    }
  }

  async createBranch(data: BranchCreateData, baseUrl?: string): Promise<void> {
    await this.openAddBranchForm(baseUrl);

    // Fill Branch details
    const nameEl = await this.findVisible(this.locators.nameInput);
    await this.setInputValue(nameEl, data.name);

    const slugEl = await this.findVisible(this.locators.slugInput);
    await this.setInputValue(slugEl, data.slug);

    const phoneEl = await this.findVisible(this.locators.phoneInput);
    await this.fillPhoneNumber(phoneEl, data.phone);

    const emailEl = await this.findVisible(this.locators.emailInput);
    await this.setInputValue(emailEl, data.email);

    const addressEl = await this.findVisible(this.locators.addressInput);
    await this.setInputValue(addressEl, data.address);

    await this.selectStatus(data.status);

    // Fill Branch Admin details
    const adminFirstEl = await this.findVisible(this.locators.adminFirstNameInput);
    await this.setInputValue(adminFirstEl, data.admin.firstName);

    const adminLastEl = await this.findVisible(this.locators.adminLastNameInput);
    await this.setInputValue(adminLastEl, data.admin.lastName);

    const adminEmailEl = await this.findVisible(this.locators.adminEmailInput);
    await this.setInputValue(adminEmailEl, data.admin.email);

    const adminPasswordEl = await this.findVisible(this.locators.adminPasswordInput);
    await this.setInputValue(adminPasswordEl, data.admin.password);

    const adminPhoneEl = await this.findVisible(this.locators.adminPhoneInput);
    await this.fillPhoneNumber(adminPhoneEl, data.admin.phone);

    // Submit
    const saveBtn = await this.findVisible(this.locators.saveChangesButton);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveBtn);
    await this.driver.executeScript("arguments[0].click();", saveBtn);
  }

  async searchBranch(query: string): Promise<void> {
    const searchEl = await this.findVisible(this.locators.searchInput);
    await searchEl.sendKeys(Key.CONTROL, "a");
    await searchEl.sendKeys(Key.BACK_SPACE);
    await searchEl.sendKeys(query);
    await this.sleep(1500); // Allow frontend search debounce to filter rows
  }

  async isBranchVisible(identifier: string, timeoutMs: number = 10000): Promise<boolean> {
    try {
      const row = await this.driver.wait(
        until.elementLocated(this.locators.branchRow(identifier)),
        timeoutMs
      );
      return await row.isDisplayed();
    } catch {
      return false;
    }
  }

  async openEditBranch(identifier: string): Promise<void> {
    const editBtn = await this.findVisible(this.locators.editButton(identifier));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editBtn);
    await this.driver.executeScript("arguments[0].click();", editBtn);

    // Ensure we transitioned to edit page
    try {
      await this.driver.wait(
        async () => (await this.driver.getCurrentUrl()).includes("/branches/edit"),
        6000
      );
    } catch {
      await editBtn.click().catch(() => {});
      await this.driver.wait(
        async () => (await this.driver.getCurrentUrl()).includes("/branches/edit"),
        6000
      );
    }

    await this.findVisible(this.locators.nameInput);
    await this.sleep(1000); // Wait for form hydration
  }

  async updateBranchDetails(identifier: string, data: BranchUpdateData): Promise<void> {
    await this.openEditBranch(identifier);

    if (data.name) {
      const nameEl = await this.findVisible(this.locators.nameInput);
      await this.setInputValue(nameEl, data.name);
    }

    if (data.address) {
      const addressEl = await this.findVisible(this.locators.addressInput);
      await this.setInputValue(addressEl, data.address);
    }

    if (data.status) {
      await this.selectStatus(data.status);
    }

    const saveBtn = await this.findVisible(this.locators.saveChangesButton);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveBtn);
    await this.driver.executeScript("arguments[0].click();", saveBtn);
  }

  async deleteBranch(identifier: string): Promise<void> {
    const delBtn = await this.findVisible(this.locators.deleteButton(identifier));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", delBtn);
    await this.driver.executeScript("arguments[0].click();", delBtn);

    // Confirm dialog
    const confirmInput = await this.findVisible(this.locators.deleteConfirmationInput);
    await this.setInputValue(confirmInput, "Delete Branch");

    const confirmBtn = await this.findVisible(this.locators.confirmDeleteButton);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", confirmBtn);
    await this.driver.executeScript("arguments[0].click();", confirmBtn);
  }

  async getToastMessage(timeoutMs: number = 10000): Promise<string> {
    const toast = await this.driver.wait(
      until.elementLocated(this.locators.toast),
      timeoutMs
    );
    await this.driver.wait(until.elementIsVisible(toast), timeoutMs);
    return toast.getText();
  }

  private async findVisible(locator: By, timeoutMs: number = 15000): Promise<WebElement> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const elements = await this.driver.findElements(locator);
        for (const el of elements) {
          try {
            if (await el.isDisplayed()) {
              return el;
            }
          } catch {
            // Stale element, skip
          }
        }
      } catch {
        // Driver interaction glitch, retry
      }
      await this.sleep(200);
    }
    const currentUrl = await this.driver.getCurrentUrl().catch(() => "unknown");
    console.error(`[findVisible TIMEOUT] URL: "${currentUrl}" locator:`, locator);
    throw new Error(`Timeout waiting for visible element with locator: ${locator.toString()}`);
  }

  private async waitForPageLoad(): Promise<void> {
    await this.driver.wait(
      async () => (await this.driver.executeScript("return document.readyState")) === "complete",
      15000
    );
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
