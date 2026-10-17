import { createDriver } from "./driver.ts";
import { LoginPage } from "../pages/login.page.ts";
import { config } from "./config.ts";


async function main() {
    const driver = await createDriver("chrome");

    try {
        const loginPage = new LoginPage(driver);
        await loginPage.navigateToLoginPage(`${config.baseUrl}${config.loginPath}`);
        await loginPage.login(config.credentials.email, config.credentials.password);

       
        await driver.wait(
            async () => !(await driver.getCurrentUrl()).includes(config.loginPath),
            15000
        );

        const url = await driver.getCurrentUrl();
        console.log(`Login successful. Redirected to: ${url}`);
    } finally {
        await driver.quit();
    }
}

main().catch((err) => {
    console.error("Login failed:", err);
    process.exit(1);
});
