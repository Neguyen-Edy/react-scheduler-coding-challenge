import { test, expect, Page } from '@playwright/test';
import { z } from 'zod';
import orderSchema from '../lib/zodvalidation';
import { Order } from '../types/prod';

type FormData = z.infer<typeof orderSchema>;

const createOrderTest = async ({ page, orderOverride = {} }: { page: Page; orderOverride?: Partial<FormData>; }) => {
    await page.goto("http://localhost:3000/orders/newOrder");
    await page.getByLabel("Order Title").fill(orderOverride.title || "Dummy Order");
    await page.getByLabel("Resource").selectOption(orderOverride.resourceId || "1");
    await page.getByLabel("Start Time").fill(orderOverride.startTime || '2025-03-02T05:15');
    await page.getByLabel("End Time").fill(orderOverride.endTime || '2025-04-02T05:15');
    await page.getByRole("button", {name: "Create Order"}).click();
};

test.describe("Order Creation Tests", () => {
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
        const testOrder: FormData = {
            title: "Test Order 1",
            resourceId: "3",
            startTime: "2025-03-02T05:15",
            endTime: "2025-01-02T05:15"
        };

        await createOrderTest({ page, orderOverride: testOrder });
        await expect(page.getByText("Start Date and Time Must Be Before End Date and Time")).toBeVisible();
    });

    test("Order Creation: testing multiple order creation", async ({ page }) => {
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toHaveLength(7);
        await expect(page.locator("table")).not.toContainText("Almost a");
    });
});

test.describe("Order Editing Tests", () => {
    const editTestOrders: FormData[] = [
        {
            title: "Test Order 12",
            resourceId: "3",
            startTime: "2025-03-02T05:15",
            endTime: "2025-05-04T05:15",
        },
        {
            title: "Different Tracking",
            resourceId: "1",
            startTime: "2025-01-02T05:15",
            endTime: "2025-04-02T05:15",
        },
        {
            title: "Data Mining",
            resourceId: "1",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T05:15",
        },
    ];

    test("Edit Order: Viewing existing order", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(200);
        }

        await page.locator("table").getByTestId("0").click();
        await page.waitForTimeout(200);
        await expect(page.getByLabel("Title")).toHaveValue("Test Order 12");
        await expect(page.getByLabel("Resource")).toHaveValue("3");
        await expect(page.getByLabel("Start Time")).toHaveValue("2025-03-02T05:15");
        await expect(page.getByLabel("End Time")).toHaveValue("2025-05-04T05:15");
        await expect(page.getByText("Edit Order")).toBeVisible();
    });

    test("Edit Order: Editing existing order", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(200);
        }

        await page.locator("table").getByTestId("0-edit").click();
        await page.waitForTimeout(200);

        await page.getByLabel("Title").clear();
        await page.getByLabel("Title").fill("Order 21");
        await page.getByLabel("Resource").selectOption("2");
        await page.getByLabel("Start Time").clear();
        await page.getByLabel("Start Time").fill("2025-05-04T05:15");
        await page.getByLabel("End Time").clear();
        await page.getByLabel("End Time").fill("2025-07-04T05:15");

        await page.getByRole("button", {name: "Edit Order"}).click();

        await expect(page.locator("table")).toContainText("Order 21");
        await expect(page.locator("table")).toContainText("0");
        await expect(page.locator("table")).toContainText("2");
        await expect(page.locator("table")).toContainText("May 4, 2025");
        await expect(page.locator("table")).toContainText("Jul 4, 2025");
    });

    test("Edit Order: Editing existing order to have invalid dates", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(200);
        }

        await page.locator("table").getByTestId("2-edit").click();
        await page.waitForTimeout(200);

        await page.getByLabel("Start Time").clear();
        await page.getByLabel("Start Time").fill("2025-05-04T05:15");
        await page.getByLabel("End Time").clear();
        await page.getByLabel("End Time").fill("2025-03-04T05:15");

        await page.getByRole("button", {name: "Edit Order"}).click();
        await expect(page.getByText("Start Date and Time Must Be Before End Date and Time")).toBeVisible();
    });

});

test.describe("Order Table Filtering Tests", () => {
    const filterTestOrders: FormData[] = [
        {
            title: "Test Order 1",
            resourceId: "3",
            startTime: "2025-03-02T05:15",
            endTime: "2025-05-04T05:15",
        },
        {
            title: "Different Title",
            resourceId: "1",
            startTime: "2025-01-02T05:15",
            endTime: "2025-04-02T05:15",
        },
        {
            title: "Data Collection",
            resourceId: "1",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Test Order 2",
            resourceId: "4",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Changing Status",
            resourceId: "3",
            startTime: "2025-08-02T05:15",
            endTime: "2025-08-02T08:15",
        },
        {
            title: "Title 3",
            resourceId: "4",
            startTime: "2025-08-05T05:15",
            endTime: "2025-09-08T05:15",
        },
        
    ];

    test("Table Filtering: title found in table", async ({ page }) => {
        for (const order of filterTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(200);
        }


        await page.getByRole("textbox", {name: "Search Order"}).fill("Test");

        await expect(page.locator("table")).toContainText("Test Order 1");
        await expect(page.locator("table")).toContainText("0");
        await expect(page.locator("table")).toContainText("3");
        await expect(page.locator("table")).toContainText("Mar 2, 2025");
        await expect(page.locator("table")).toContainText("May 4, 2025");

        await expect(page.locator("table")).toContainText("Test Order 2");
        await expect(page.locator("table")).toContainText("3");
        await expect(page.locator("table")).toContainText("4");
        await expect(page.locator("table")).toContainText("Aug 2, 2025");
        await expect(page.locator("table")).toContainText("Sep 2, 2025");
        await expect(page.locator("table")).not.toContainText("Changing Status");

        await page.getByRole("textbox", {name: "Search Order"}).clear();

        await page.getByRole("textbox", {name: "Search Order"}).fill("Title");

        await expect(page.locator("table")).toContainText("Different Title");
        await expect(page.locator("table")).toContainText("1");
        await expect(page.locator("table")).toContainText("Jan 2, 2025");
        await expect(page.locator("table")).toContainText("Apr 2, 2025");

        await expect(page.locator("table")).toContainText("Title 3");
        await expect(page.locator("table")).toContainText("5");
        await expect(page.locator("table")).toContainText("4");
        await expect(page.locator("table")).toContainText("Aug 5, 2025");
        await expect(page.locator("table")).toContainText("Sep 8, 2025");
        await expect(page.locator("table")).toContainText("Title 3"); 
        await expect(page.locator("table")).not.toContainText("Data Collection");
    });

    test("Table Filtering: title not found in table", async ({ page }) => {
        for (const order of filterTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(200);
        }

        await page.getByRole("textbox", {name: "Search Order"}).fill("Not In Table");
        await expect(page.locator("table")).toContainText("No Orders Found");
        await expect(page.locator("table")).not.toContainText("Different Title");
    });
});