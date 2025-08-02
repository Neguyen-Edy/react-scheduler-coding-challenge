# React Scheduler Coding Challenge (Eddie Nguyen)

## Prequisites
- Git - [Installation](https://git-scm.com/downloads)
    - To verify installation, open a Command Prompt/Terminal and run `git --version`
- Visual Studio Code - [Installation](https://code.visualstudio.com/download)
- Node.js - [Installation](https://nodejs.org/en)
    - To verify installation, open a Command Prompt/Terminal and run `node -v` and then `npm -v`.

## Set Up
1. Clone the repo:

    HTTPS:
    ```
    git clone https://github.com/Neguyen-Edy/react-scheduler-coding-challenge.git
    ```
    SSH:
    ```
    git clone git@github.com:Neguyen-Edy/react-scheduler-coding-challenge.git
    ```
2. Open up a terminal or VSCode.
3. Navigate to the react-scheduler-next project folder

   ```
   cd react-scheduler-coding-challenge
   cd react-scheduler-next
   ```
4. Download and install the Node.js dependencies.

   ```
   npm install
   ```
5. Compile the project
   
   ```
   npm run build
   ```
7. Run the app

   ```
   npm start
   ```
If you want to run the development server, run this command

   ```
   npm run dev
   ```

## Features
1. Production Order Creation
    - Order Creation
       - Fill the Order Form with the title, resource, start date/time, and end date/time.
    - Order Validation
       - All orders must have a title, resource, start date/time, and end date/time. Any missing data results in an error. The start date/time must be before the end date/time. If this is not true, then an error pops up.
    - Resource/Time Conflict Error Management
       - If a resource is busy, a warning will pop to warn the user to check the table. The new order's start date/time and end date/time is checked for any conflicts. Any conflicts result in an error.
2. Order Table
    - Order Viewing
       - All created orders can be viewed.
     - Order Filtering
       - Users are able to filter orders by selecting an orders status. Users are also able to filter by text input. The table filters the orders based how similar are the titles are based on the input. You can use both filters simultaneously. 

   Each order are provided three buttons that allow the user to perform three actions on a single order:
    - Order Editing
       - Edit an order's title, resource, start date/time, and end date/time. Editing uses the same Order Form for Order Creation, but the input fields are filled in automatically. Validation and time conflict errors can still occur while editing.
    - Order Scheduling
       - Schedule a "pending" order. If there is a time conflict, a warning will pop up, stopping the order from being scheduled.
    - Order Deletion
       - Delete an order from table and storage.
3. Order Dashboard
    - Scheduled orders will appear on the dashboard as bars starting from an order's start date/time to end date/time.
    - Hovering over each bar provides a tool tip with the order's title and dates.
    - The dashboard comes with two buttons that allow the user to "zoom in" and "zoom out", changing how the time range is displayed.
    - Any edits and deletions to the orders are reflected on the dashboard in real time.

## Testing
1. Verify that Playwright is installed

   ```
   npx playwright --version
   ```
2. If you have not compiled and build your project yet, make sure you do. Otherwise, you can skip this step.

    ```
    npm run build
    ```
3. Run the following command
   ```
   npx playwright test
   ```
To use Playwright UI test viewer
   ```
   npx playwright test --ui
   ```
What is Covered:
 - Order Creation:
   - Creating a valid order
   - Trying to create an order with empty fields
   - Trying to create an order with invalid date/time
   - Creating multiple orders
   - Creating an order with a busy resource (w/ time conflict)
- Order Editing:
   - Viewing an existing order (form fields are already filled when editing)
   - Successfully editing an order
   - Editing an order to have invalid dates
   - Editing a scheduled order to have different resource (1 Scheduled Order per resource)
   - Editing a scheduled order to have different resource (>1 Scheduled Order per resource)
- Order Scheduling:
   - Changing order status to "Scheduled"
   - Scheduling an order with same resource (w/ time conflict)
   - Scheduling an order with same resource (no time conflict)
- Order Table Filtering:
   - Filtering based on existing order title
   - Filtering based on order title that doesn't exist
   - Filtering based on "Pending" status
   - Filtering based on "Scheduled" status
- Order Deletion:
   - Deleting an order
   - Deleting all orders
   - Delete a scheduled order that shares resource with another order
- Dashboard Chart:
   - No orders to display
   - Scheduling order is reflected on dashboard
   - Deleting an order is reflected on the dashboard
   - Editing an order is reflected on the dashboard

## Technical Decisions
For state management, I decided on using React useState and the Context API. The reason is that they were the ones that I am most comfortable using. To store the orders, I used localeStorage. This allowed for the state of orders and resources to persist after sessions and page reloads. For the order form, I used react-form-hook because I read that it was useful when working with React forms. react-form-hook easily integrates with zod and allows me to easily validate the order, display errors where they are needed, and automatically fill in the form when editing an order.

## Known Issues/Limitations
I found that for testing that the orders on the dashboard chart is rendered was difficult. Recharts does not allow for easy testing because `data-testid` can't be assigned to the individual bars and axes, causing the locators to be difficult to target. I had to use Playwright's Codegen to find the locators for the individual bars. 
Another limit I found is that scheduled orders with the same resource do not stack on the same line. Each scheduled order has to be on its own column. 
I also found that some Playwright's Firefox and Webkit tests fail when testing with the development server. Building my project first and running the server seems to pass the tests for Firefox and Webkit. 

## Bonus Features (if implemented)
 - Filtering based on existing title
 - Filtering based on title that doesn't exist
 - Deleting an order
 - Dashboard tool tips
