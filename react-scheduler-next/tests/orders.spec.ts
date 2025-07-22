import { test, expect, Page } from '@playwright/test';
import { z } from 'zod';
import orderSchema from '../lib/zodvalidation';

type FormData = z.infer<typeof orderSchema>;

const createOrderTest = async ({ page, orderOverride = {} }: { page: Page; orderOverride?: Partial<FormData>; }) => {
    await page.goto("http://localhost:3000/orders/newOrder");
    await page.getByLabel("Order Title").fill(orderOverride.title || "Dummy Order");
    await page.getByLabel("Resource").selectOption(orderOverride.resourceId || "1");
    await page.getByLabel("Start Time").fill(orderOverride.startTime || '2025-03-02T05:15');
    await page.getByLabel("End Time").fill(orderOverride.endTime || '2025-04-02T05:15');
    await page.getByRole("button", {name: "Create Order"}).click();
};

test.describe("Order Tests", () => {
    test("Order Creation: valid order", async ({ page }) => {
        await createOrderTest({page});
        await expect(page).toHaveURL('http://localhost:3000/orders');
        await expect(page.locator("table")).toContainText("Dummy Order");
        await expect(page.locator("table")).toContainText("0");
        await expect(page.locator("table")).toContainText("1");
        await expect(page.locator("table")).toContainText("Pending");
        await expect(page.locator("table")).toContainText("Mar 2, 2025");
        await expect(page.locator("table")).toContainText("Apr 2, 2025");
    });

    test("Order Creation: test empty errors", async ({ page }) => {
        await page.goto("http://localhost:3000/orders/newOrder");
        await page.getByRole("button", {name: "Create Order"}).click();
        await expect(page.getByText("Required Title")).toBeVisible();
        await expect(page.getByText("Required Resource")).toBeVisible();
        await expect(page.getByText("Required Start Date")).toBeVisible();
        await expect(page.getByText("Required End Date")).toBeVisible();
    });

    test("Order Creation: test invalid dates", async ({ page }) => {
        const testOrder: Partial<FormData> = {
            title: "Test Order 1",
            resourceId: "3",
            startTime: "2025-03-02T05:15",
            endTime: "2025-01-02T05:15"
        };

        await page.goto("http://localhost:3000/orders/newOrder");
        await createOrderTest({ page, orderOverride: testOrder });
        await expect(page.getByText("Start Date and Time Must Be Before End Date and Time")).toBeVisible();
    });
});