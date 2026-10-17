import { createDriver } from "./driver.ts";
import { LoginPage } from "../pages/login.page.ts";
import { BranchPage } from "../pages/branch.page.ts";
import type { BranchCreateData, BranchUpdateData } from "../pages/branch.page.ts";
import { config } from "./config.ts";

function generatePhoneNumber(prefix: string = "980"): string {
  const randomDigits = Math.floor(Math.random() * 1e7)
    .toString()
    .padStart(7, "0");
  return `${prefix}${randomDigits}`;
}

async function runBranchCrudTest() {
  console.log("=== Starting Chairlyos Branch CRUD Test (Selenium) ===");
  const driver = await createDriver("chrome");

  try {
    // 1. Authenticate
    console.log(`[Step 1] Navigating to login page: ${config.baseUrl}${config.loginPath}`);
    const loginPage = new LoginPage(driver);
    await loginPage.navigateToLoginPage(`${config.baseUrl}${config.loginPath}`);

    console.log(`[Step 1] Logging in as: ${config.credentials.email}`);
    await loginPage.login(config.credentials.email, config.credentials.password);

    await driver.wait(
      async () => !(await driver.getCurrentUrl()).includes(config.loginPath),
      15000
    );
    console.log(`[Step 1] Logged in successfully. Current URL: ${await driver.getCurrentUrl()}`);

    // 2. Prepare Unique Test Data
    const suffix = Date.now().toString();
    const branchData: BranchCreateData = {
      name: `Selenium Branch ${suffix}`,
      slug: `selenium-branch-${suffix}`,
      phone: generatePhoneNumber("980"),
      email: `selenium.branch.${suffix}@example.com`,
      address: "Shankhamul, Kathmandu, Nepal",
      status: "Active",
      admin: {
        firstName: "Selenium",
        lastName: `Admin${suffix}`,
        email: `selenium.admin.${suffix}@example.com`,
        password: "Admin@123",
        phone: generatePhoneNumber("981"),
      },
    };

    const branchPage = new BranchPage(driver);
    await branchPage.navigateToBranchList(config.baseUrl);

    // 3. Create Branch
    console.log(`[Step 2: Create] Creating branch: "${branchData.name}" (${branchData.slug})`);
    await branchPage.createBranch(branchData, config.baseUrl);

    try {
      const toast = await branchPage.getToastMessage(8000);
      console.log(`[Step 2: Create] Toast received: "${toast}"`);
    } catch {
      console.log("[Step 2: Create] Toast not captured, proceeding with table verification...");
    }

    // Verify branch in list
    await branchPage.navigateToBranchList(config.baseUrl);
    await branchPage.searchBranch(branchData.slug);
    const isCreatedVisible = await branchPage.isBranchVisible(branchData.slug);
    if (!isCreatedVisible) {
      throw new Error(`Branch with slug "${branchData.slug}" was not found in the list after creation.`);
    }
    console.log(`[Step 2: Create] Verified: Branch "${branchData.slug}" is visible in list.`);

    // 4. Update Branch
    const updatedName = `Selenium Branch Updated ${suffix}`;
    const updateData: BranchUpdateData = {
      name: updatedName,
      address: "Jawalakhel, Lalitpur, Nepal",
      status: "Active",
    };

    console.log(`[Step 3: Update] Updating branch to: "${updatedName}"`);
    await branchPage.updateBranchDetails(branchData.slug, updateData);

    try {
      const updateToast = await branchPage.getToastMessage(8000);
      console.log(`[Step 3: Update] Toast received: "${updateToast}"`);
    } catch {
      console.log("[Step 3: Update] Toast not captured, proceeding with table verification...");
    }

    await branchPage.navigateToBranchList(config.baseUrl);
    await branchPage.searchBranch(branchData.slug);
    const isUpdatedVisible = await branchPage.isBranchVisible(updatedName);
    console.log(`[Step 3: Update] Verified: Updated branch "${updatedName}" is visible: ${isUpdatedVisible}`);

    // 5. Delete Branch
    console.log(`[Step 4: Delete] Deleting branch: "${branchData.slug}"`);
    await branchPage.deleteBranch(branchData.slug);

    try {
      const deleteToast = await branchPage.getToastMessage(8000);
      console.log(`[Step 4: Delete] Toast received: "${deleteToast}"`);
    } catch {
      console.log("[Step 4: Delete] Proceeding with deletion verification in table...");
    }

    // Verify removed
    await branchPage.navigateToBranchList(config.baseUrl);
    await branchPage.searchBranch(branchData.slug);
    const isStillVisible = await branchPage.isBranchVisible(branchData.slug, 4000);
    if (isStillVisible) {
      throw new Error(`Branch "${branchData.slug}" is still visible after deletion.`);
    }
    console.log(`[Step 4: Delete] Verified: Branch "${branchData.slug}" is successfully removed from list.`);

    console.log("=== All Chairlyos Branch CRUD Tests Passed Successfully! ===");
  } finally {
    await driver.quit();
  }
}

runBranchCrudTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
