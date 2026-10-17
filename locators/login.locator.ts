import { By } from "selenium-webdriver";

export class LoginLocators {
  readonly emailInput = By.css("input#email, input[name='email'], input[type='email']");
  readonly passwordInput = By.css("input[name='password'], input[type='password']");
  readonly loginButton = By.css("button[type='submit']");
  readonly toastMessage = By.css("[data-sonner-toast], [role='status'], [role='alert'], .Toastify__toast-body");
}
