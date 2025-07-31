import { test, expect, Page } from '@playwright/test';
import { z } from 'zod';
import orderSchema from '../lib/zodvalidation';
import { Order, Resource } from '../types/prod';

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
        await expect(page.getByRole("table")).toContainText("Dummy Order");
        await expect(page.getByRole("table")).toContainText("0");
        await expect(page.getByRole("table")).toContainText("1");
        await expect(page.getByRole("table")).toContainText("Pending");
        await expect(page.getByRole("table")).toContainText("Mar 2, 2025");
        await expect(page.getByRole("table")).toContainText("Apr 2, 2025");
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

    test("Order Creation: test multiple order creation", async ({ page }) => {
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});
        await createOrderTest({page});

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toHaveLength(7);
        await expect(page.getByRole("table")).not.toContainText("Almost a");
    });

    test("Order Creation: test busy resource", async ({ page }) => {
        const busyTestOrders: FormData[] = [
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
        ];

        for (const order of busyTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-schedule").click(); 

        await page.goto("http://localhost:3000/orders/newOrder");
        await page.getByLabel("Order Title").fill("Data Mining");
        await page.getByLabel("Resource").selectOption("3");

        await expect(page.getByText("WARNING!!! THIS RESOURCE IS CURRENTLY BUSY!!!")).toBeVisible();
        await expect(page.getByText("CHECK THE ORDER TABLE!!!")).toBeVisible();

        await page.getByLabel("Start Time").fill('2025-03-02T05:15');
        await page.getByLabel("End Time").fill('2025-04-02T05:15');

        await page.getByRole("button", {name: "Create Order"}).click();
        
        await expect(page.getByText("This resource is already booked during that time.")).toBeVisible(); 
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
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-edit").click();
        await page.waitForTimeout(50);
        await expect(page.getByLabel("Title")).toHaveValue("Test Order 12");
        await expect(page.getByLabel("Resource")).toHaveValue("3");
        await expect(page.getByLabel("Start Time")).toHaveValue("2025-03-02T05:15");
        await expect(page.getByLabel("End Time")).toHaveValue("2025-05-04T05:15");
        await expect(page.getByText("Edit Order")).toBeVisible();
    });

    test("Edit Order: Editing existing order", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-edit").click();
        await page.waitForTimeout(50);

        await page.getByLabel("Title").clear();
        await page.getByLabel("Title").fill("Order 21");
        await page.getByLabel("Resource").selectOption("2");
        await page.getByLabel("Start Time").clear();
        await page.getByLabel("Start Time").fill("2025-05-04T05:15");
        await page.getByLabel("End Time").clear();
        await page.getByLabel("End Time").fill("2025-07-04T05:15");

        await page.getByRole("button", {name: "Edit Order"}).click();

        await expect(page.getByRole("table")).toContainText("Order 21");
        await expect(page.getByRole("table")).toContainText("0");
        await expect(page.getByRole("table")).toContainText("2");
        await expect(page.getByRole("table")).toContainText("May 4, 2025");
        await expect(page.getByRole("table")).toContainText("Jul 4, 2025");
    });

    test("Edit Order: Editing existing order to have invalid dates", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("2-edit").click();
        await page.waitForTimeout(50);

        await page.getByLabel("Start Time").clear();
        await page.getByLabel("Start Time").fill("2025-05-04T05:15");
        await page.getByLabel("End Time").clear();
        await page.getByLabel("End Time").fill("2025-03-04T05:15");

        await page.getByRole("button", {name: "Edit Order"}).click();
        await expect(page.getByText("Start Date and Time Must Be Before End Date and Time")).toBeVisible();
    });

    test("Edit Order: Editing Scheduled Order to Have Different Resource (1 Scheduled Order per Resource)", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("1-schedule").click();
        await page.getByRole("table").getByTestId("1-edit").click();
        await page.waitForTimeout(50);

        await page.getByLabel("Resource").selectOption("2");

        await page.getByRole("button", {name: "Edit Order"}).click();

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toContainEqual({orderId: "1", title: "Different Tracking", resourceId: "2", status: "Scheduled", startTime: "2025-01-02T05:15", endTime: "2025-04-02T05:15",});

        const resources : Resource[] = await page.evaluate("JSON.parse(localStorage.getItem('resources'))");
        expect(resources).toContainEqual({id: "1", name: "Machine 1", status: "Available",});
        expect(resources).toContainEqual({id: "2", name: "Assembly Line", status: "Busy",});
    });

    test("Edit Order: Editing Scheduled Order to Have Different Resource (>1 Scheduled Order per Resource)", async ({ page }) => {
        for (const order of editTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("1-schedule").click();
        await page.getByRole("table").getByTestId("2-schedule").click();
        await page.getByRole("table").getByTestId("1-edit").click();
        await page.waitForTimeout(50);

        await page.getByLabel("Resource").selectOption("2");

        await page.getByRole("button", {name: "Edit Order"}).click();

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toContainEqual({orderId: "1", title: "Different Tracking", resourceId: "2", status: "Scheduled", startTime: "2025-01-02T05:15", endTime: "2025-04-02T05:15",});

        const resources : Resource[] = await page.evaluate("JSON.parse(localStorage.getItem('resources'))");
        expect(resources).toContainEqual({id: "1", name: "Machine 1", status: "Busy",});
        expect(resources).toContainEqual({id: "2", name: "Assembly Line", status: "Busy",});
    });
});

test.describe("Order Scheduling Tests", () => {
    const scheduleTestOrders: FormData[] = [
        {
            title: "Test 1",
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
            resourceId: "2",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Test Order 2",
            resourceId: "4",
            startTime: "2025-09-02T05:15",
            endTime: "2025-09-05T05:15",
        },
        {
            title: "Test Order 3",
            resourceId: "4",
            startTime: "2025-08-02T05:15",
            endTime: "2025-10-02T05:15",
        },
        {
            title: "Test 1.2",
            resourceId: "3",
            startTime: "2025-06-02T05:15",
            endTime: "2025-07-04T05:15",
        },
    ];

    test("Order Scheduling: Changing Order Status to Scheduled", async({ page }) => {
        for (const order of scheduleTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-schedule").click(); 
        await expect(page.getByRole("table")).toContainText("Scheduled");

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toContainEqual({orderId: "0", title: "Test 1", resourceId: "3", status: "Scheduled", startTime: "2025-03-02T05:15", endTime: "2025-05-04T05:15",});

        const resources : Resource[] = await page.evaluate("JSON.parse(localStorage.getItem('resources'))");
        expect(resources).toContainEqual({id: "3", name: "3D Printer", status: "Busy"});

        await page.goto("http://localhost:3000/dashboard");
        await expect(page.getByTestId("orders-chart")).toBeVisible();
    });

    test("Order Scheduling: Scheduling an Order with same resource (time conflict)", async({ page }) => {
        for (const order of scheduleTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("3-schedule").click(); 

        await page.getByRole("table").getByTestId("4-schedule").click(); 

        page.on("dialog", async dialog => {
            console.log(dialog.message());
            expect(dialog.message()).toBe("Resource Is Currently Busy");
            await dialog.accept();
        });

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toContainEqual({orderId: "4", title: "Test Order 3", resourceId: "4", status: "Pending", startTime: "2025-08-02T05:15", endTime: "2025-10-02T05:15",});
    });

    test("Order Scheduling: Scheduling an Order with same resource (no time conflicts)", async({ page }) => {
        for (const order of scheduleTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-schedule").click(); 

        await page.getByRole("table").getByTestId("5-schedule").click();

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toContainEqual({orderId: "0", title: "Test 1", resourceId: "3", status: "Scheduled", startTime: "2025-03-02T05:15", endTime: "2025-05-04T05:15",});
        expect(orders).toContainEqual({orderId: "5", title: "Test 1.2", resourceId: "3", status: "Scheduled", startTime: "2025-06-02T05:15", endTime: "2025-07-04T05:15",});
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
            await page.waitForTimeout(50);
        }

        await page.getByRole("textbox", {name: "Search Order"}).fill("Test");

        await expect(page.getByRole("table")).toContainText("Test Order 1");
        await expect(page.getByRole("table")).toContainText("0");
        await expect(page.getByRole("table")).toContainText("3");
        await expect(page.getByRole("table")).toContainText("Mar 2, 2025");
        await expect(page.getByRole("table")).toContainText("May 4, 2025");

        await expect(page.getByRole("table")).toContainText("Test Order 2");
        await expect(page.getByRole("table")).toContainText("3");
        await expect(page.getByRole("table")).toContainText("4");
        await expect(page.getByRole("table")).toContainText("Aug 2, 2025");
        await expect(page.getByRole("table")).toContainText("Sep 2, 2025");
        await expect(page.getByRole("table")).not.toContainText("Changing Status");

        await page.getByRole("textbox", {name: "Search Order"}).clear();

        await page.getByRole("textbox", {name: "Search Order"}).fill("Title");

        await expect(page.getByRole("table")).toContainText("Different Title");
        await expect(page.getByRole("table")).toContainText("1");
        await expect(page.getByRole("table")).toContainText("Jan 2, 2025");
        await expect(page.getByRole("table")).toContainText("Apr 2, 2025");

        await expect(page.getByRole("table")).toContainText("Title 3");
        await expect(page.getByRole("table")).toContainText("5");
        await expect(page.getByRole("table")).toContainText("4");
        await expect(page.getByRole("table")).toContainText("Aug 5, 2025");
        await expect(page.getByRole("table")).toContainText("Sep 8, 2025");
        await expect(page.getByRole("table")).toContainText("Title 3"); 
        await expect(page.getByRole("table")).not.toContainText("Data Collection");
    });

    test("Table Filtering: title not found in table", async ({ page }) => {
        for (const order of filterTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("textbox", {name: "Search Order"}).fill("Not In Table");
        await expect(page.getByRole("table")).toContainText("No Orders Found");
        await expect(page.getByRole("table")).not.toContainText("Different Title");
    });

    test("Table Filtering: Pending status", async ({ page }) => {
        for (const order of filterTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-schedule").click();
        await page.getByRole("table").getByTestId("3-schedule").click();
        await page.getByRole("table").getByTestId("1-schedule").click();
        await page.getByRole("table").getByTestId("4-schedule").click();

        await page.getByRole("combobox").selectOption("Pending");
        await expect(page.getByRole("table")).toContainText("Title 3");
        await expect(page.getByRole("table")).toContainText("Data Collection");
    })

    test("Table Filtering: Scheduled status", async ({ page }) => {
        for (const order of filterTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId("0-schedule").click();
        await page.getByRole("table").getByTestId("3-schedule").click();
        await page.getByRole("table").getByTestId("1-schedule").click();
        await page.getByRole("table").getByTestId("4-schedule").click();

        await page.getByRole("combobox").selectOption("Scheduled");
        await expect(page.getByRole("table")).toContainText("Test Order 1");
        await expect(page.getByRole("table")).toContainText("Different Title");
        await expect(page.getByRole("table")).toContainText("Test Order 2");
        await expect(page.getByRole("table")).toContainText("Changing Status");
    })
});

test.describe("Order Deletion Tests", () => {
    const deleteTestOrders: FormData[] = [
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
            startTime: "2025-08-01T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Test Order 2",
            resourceId: "4",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T07:15",
        },
        {
            title: "Changing Status",
            resourceId: "3",
            startTime: "2025-08-05T05:15",
            endTime: "2025-08-09T08:15",
        },
        {
            title: "Title 3",
            resourceId: "2",
            startTime: "2025-08-05T05:15",
            endTime: "2025-09-08T05:15",
        },
        
    ];

    test("Order Deletion Test: Delete Order", async ({ page }) => {
        for (const order of deleteTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId('3-schedule').click(); 
        await page.getByRole("table").getByTestId('3-delete').click();

        expect(page.getByText("Test Order 2")).not.toBeVisible();
        expect(page.getByText("Scheduled")).not.toBeVisible();
        expect(page.getByText("2025-08-02T05:15")).not.toBeVisible();
        expect(page.getByText("2025-09-02T07:15")).not.toBeVisible();

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toHaveLength(5);

        const resources : Resource[] = await page.evaluate("JSON.parse(localStorage.getItem('resources'))");
        expect(resources).toContainEqual({id: "3", name: "3D Printer", status: "Available"});
    });

    test("Order Deletion Test: All Orders", async ({ page }) => {
        for (const order of deleteTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        for (let i = 0; i < deleteTestOrders.length; ++i) {
            await page.getByRole("table").getByTestId(`${i}-delete`).click(); 
        }

        await expect(page.getByText("No Orders Found")).toBeVisible();

        const orders : Order[] = await page.evaluate("JSON.parse(localStorage.getItem('orders'))");
        expect(orders).toHaveLength(0);
    });

    test("Order Deletion Test: Delete Scheduled Order that Shares Resource with Another", async ({ page }) => {
        for (const order of deleteTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId(`0-schedule`).click(); 
        await page.getByRole("table").getByTestId(`4-schedule`).click(); 

        await page.getByRole("table").getByTestId(`0-delete`).click(); 

        const resources : Resource[] = await page.evaluate("JSON.parse(localStorage.getItem('resources'))");
        expect(resources).toContainEqual({id: "3", name: "3D Printer", status: "Busy"});
    });

});

test.describe("Dashboard Chart Tests", () => {
    const dashboardTestOrders: FormData[] = [
        {
            title: "Test Order 1",
            resourceId: "3",
            startTime: "2025-07-02T05:15",
            endTime: "2025-08-04T05:15",
        },
        {
            title: "Different Title",
            resourceId: "1",
            startTime: "2025-06-02T05:15",
            endTime: "2025-07-02T05:15",
        },
        {
            title: "Data Collection",
            resourceId: "1",
            startTime: "2025-07-02T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Test Order 2",
            resourceId: "4",
            startTime: "2025-08-02T05:15",
            endTime: "2025-09-02T05:15",
        },
        {
            title: "Title 3",
            resourceId: "4",
            startTime: "2025-09-05T05:15",
            endTime: "2025-09-08T05:15",
        },
    ];

    test("Dashboard Test: No orders", async ({ page }) => {
        await page.goto("http://localhost:3000/dashboard");

        await expect(page.getByText("No Orders To Display")).toBeVisible();
    });

    test("Dashboard Test: Scheduling all orders", async ({ page }) => {
        for (const order of dashboardTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        for (let i = 0; i < dashboardTestOrders.length; ++i) {
            await page.getByRole("table").getByTestId(`${i}-schedule`).click(); 
        }

        await page.goto("http://localhost:3000/dashboard");

        await expect(page.getByTestId("orders-chart")).toBeVisible();

        const bar0 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g > .recharts-rectangle').first();
        const bar1 = page.locator('g:nth-child(2) > .recharts-rectangle')
        const bar2 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g:nth-child(3) > .recharts-rectangle');
        const bar3 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g:nth-child(4) > .recharts-rectangle');
        const bar4 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g:nth-child(5) > .recharts-rectangle');

        await expect(bar0).toBeVisible();
        await expect(bar1).toBeVisible();
        await expect(bar2).toBeVisible();
        await expect(bar3).toBeVisible();
        await expect(bar4).toBeVisible();

        await expect(page.getByText("Resource:3DPrinter(Order0)")).toBeVisible();
        await expect(page.getByText("Resource:Machine1(Order1)")).toBeVisible();
        await expect(page.getByText("Resource:Machine1(Order2)")).toBeVisible();
        await expect(page.getByText("Resource:Machine2(Order3)")).toBeVisible();
        await expect(page.getByText("Resource:Machine2(Order4)")).toBeVisible();
        await expect(page.getByText("Resource:AssemblyLine")).toBeVisible();
        await expect(page.getByText("Resource:Printer")).toBeVisible();
    });

    test("Dashboard Test: Delete order", async ({ page }) => {
        for (const order of dashboardTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId(`0-schedule`).click();
        await page.getByRole("table").getByTestId(`2-schedule`).click(); 
        await page.getByRole("table").getByTestId(`3-schedule`).click(); 

        await page.goto("http://localhost:3000/dashboard");

        const bar0 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g > .recharts-rectangle').first();
        const bar1 = page.locator('g:nth-child(2) > .recharts-rectangle')
        const bar2 = page.locator('g:nth-child(8) > .recharts-layer.recharts-bar-rectangles > g > g:nth-child(3) > .recharts-rectangle');

        await expect(bar0).toBeVisible();
        await expect(bar1).toBeVisible();
        await expect(bar2).toBeVisible();

        await expect(page.getByText("Resource:Machine1(Order2)")).toBeVisible();
        await expect(page.getByText("Resource:Machine2(Order3)")).toBeVisible();
        await expect(page.getByText("Resource:3DPrinter(Order0)")).toBeVisible();

        await page.goto("http://localhost:3000/orders");

        await page.getByRole("table").getByTestId(`0-delete`).click(); 

        await page.goto("http://localhost:3000/dashboard");

        await expect(page.getByText("Resource:Machine1(Order2)")).toBeVisible();
        await expect(page.getByText("Resource:Machine2(Order3)")).toBeVisible();
        await expect(page.getByText("Resource:3DPrinter")).toBeVisible();
    });

    test("Dashboard Test: Edit order (different resource)", async ({ page }) => {
        for (const order of dashboardTestOrders) {
            await createOrderTest({ page, orderOverride: order });
            await page.waitForTimeout(50);
        }

        await page.getByRole("table").getByTestId(`1-schedule`).click();
        await page.getByRole("table").getByTestId(`4-schedule`).click(); 

        await page.goto("http://localhost:3000/orders");

        await page.getByRole("table").getByTestId(`1-edit`).click();

        await page.getByLabel("Resource").selectOption("4");

        await page.getByRole("button", {name: "Edit Order"}).click();

        await page.waitForTimeout(50);

        await page.goto("http://localhost:3000/dashboard");

        await expect(page.getByText("Resource:Machine2(Order1)")).toBeVisible();
        await expect(page.getByText("Resource:Machine2(Order4)")).toBeVisible(); 
    });
})