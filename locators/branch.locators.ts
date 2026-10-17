import { By } from "selenium-webdriver";

export class BranchLocators {
  // Navigation & Listing
  readonly branchesNavLink = By.xpath("//a[contains(@href, '/branches') or contains(., 'Branches')]");
  readonly addBranchButton = By.xpath("//button[contains(., 'Add Branch')] | //a[contains(@href, '/branches/add')]");
  readonly searchInput = By.css("input[placeholder*='Search']");

  branchRow(identifier: string) {
    return By.xpath(`//table//tbody//tr[contains(., '${identifier}')]`);
  }

  editButton(identifier: string) {
    return By.xpath(
      `//table//tbody//tr[contains(., '${identifier}')]//*[@title='Edit branch']`
    );
  }

  deleteButton(identifier: string) {
    return By.xpath(
      `//table//tbody//tr[contains(., '${identifier}')]//*[@title='Delete branch']`
    );
  }

  // Branch Form
  readonly nameInput = By.css("#name, input[name='name']");
  readonly slugInput = By.css("#slug, input[name='slug']");
  readonly phoneInput = By.xpath("(//input[contains(@placeholder, 'phone')])[1]");
  readonly emailInput = By.css("input#email, form input[name='email']");
  readonly addressInput = By.css("#address, input[name='address']");
  readonly statusDropdown = By.xpath("(//button[@role='combobox'])[1]");

  statusOption(status: string) {
    return By.xpath(`//*[@role='option' and contains(., '${status}')]`);
  }

  readonly saveChangesButton = By.xpath("//button[contains(., 'Save Changes')]");

  // Admin Form (for creation)
  readonly adminFirstNameInput = By.css("#admin_first_name, input[name='admin_first_name']");
  readonly adminLastNameInput = By.css("#admin_last_name, input[name='admin_last_name']");
  readonly adminEmailInput = By.css("#admin_email, input[name='admin_email']");
  readonly adminPasswordInput = By.css("input[name='admin_password'], input[placeholder*='••••']");
  readonly adminPhoneInput = By.xpath("(//input[contains(@placeholder, 'phone')])[last()]");

  // Delete Dialog
  readonly deleteConfirmationInput = By.css("input[placeholder*='Delete Branch']");
  readonly confirmDeleteButton = By.xpath("//div[@role='dialog']//button[contains(., 'Delete Branch')]");

  // Toasts / Status messages
  readonly toast = By.css("[data-sonner-toast], [role='status'], [role='alert'], .Toastify__toast-body, .Toastify__toast");
}
