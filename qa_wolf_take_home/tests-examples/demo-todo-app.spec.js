const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment'
];

test.describe('New Todo', () => {
  test('should allow me to add todo items', async ({ page }) => {
    // Create 1st todo.
    await page.getByPlaceholder('What needs to be done?').fill(TODO_ITEMS[0]);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    await checkNumberOfTodosInLocalStorage(page, 1);

    // Create 2nd todo.
    await page.getByPlaceholder('What needs to be done?').fill(TODO_ITEMS[1]);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await checkNumberOfTodosInLocalStorage(page, 2);

    // Create 3rd todo.
    await page.getByPlaceholder('What needs to be done?').fill(TODO_ITEMS[2]);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Make sure the list now has three todo items.
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should clear text input field when an item is added', async ({ page }) => {
    // Create one todo item.
    await page.getByPlaceholder('What needs to be done?').fill(TODO_ITEMS[0]);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Check that input is empty.
    await expect(page.getByPlaceholder('What needs to be done?')).toBeEmpty();
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should append new items to the bottom of the list', async ({ page }) => {
    // Create 3 items.
    await createDefaultTodos(page);

    // Check test using different methods.
    await expect(page.getByText(TODO_ITEMS[0])).toBeVisible();
    await expect(page.getByText(TODO_ITEMS[1])).toBeVisible();
    await expect(page.getByText(TODO_ITEMS[2])).toBeVisible();

    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should show #main and #footer when items added', async ({ page }) => {
    await createDefaultTodos(page);

    await expect(page.locator('.main')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();

    await checkNumberOfTodosInLocalStorage(page, 3);
  });
});

test.describe('Mark all as completed', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test.afterEach(async ({ page }) => {
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow me to mark all items as completed', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);

    // Ensure the element is interactable
    const toggleAll = page.getByLabel('Mark all as complete');
    await toggleAll.waitFor({ state: 'visible' });

    // Complete all todos
    await toggleAll.check();

    // Ensure all todos have 'completed' class
    await expect(page.getByTestId('todo-item')).toHaveClass(['completed', 'completed', 'completed']);
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
  });

  test('should allow me to clear the complete state of all items', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);

    // Ensure the element is interactable
    const toggleAll = page.getByLabel('Mark all as complete');
    await toggleAll.waitFor({ state: 'visible' });

    // Check and then immediately uncheck
    await toggleAll.check();
    await toggleAll.uncheck();

    // Should be no completed classes
    await expect(page.getByTestId('todo-item')).toHaveClass(['', '', '']);
  });

  test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);

    // Ensure the element is interactable
    const toggleAll = page.getByLabel('Mark all as complete');
    await toggleAll.waitFor({ state: 'visible' });

    await toggleAll.check();
    await expect(toggleAll).toBeChecked();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Uncheck first todo
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').uncheck();

    // Reuse toggleAll locator and make sure it's not checked
    await expect(toggleAll).not.toBeChecked();

    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Assert the toggle all is checked again
    await expect(toggleAll).toBeChecked();
  });
});

test.describe('Item', () => {
  test('should allow me to mark items as complete', async ({ page }) => {
    // Create two items.
    await createDefaultTodos(page);

    // Check first item.
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();

    // Ensure the first item has 'completed' class.
    await expect(firstTodo).toHaveClass('completed');

    // Check second item.
    const secondTodo = page.getByTestId('todo-item').nth(1);
    await secondTodo.getByRole('checkbox').check();

    // Ensure the second item has 'completed' class.
    await expect(secondTodo).toHaveClass('completed');
  });

  test('should allow me to un-mark items as complete', async ({ page }) => {
    // Create two items.
    await createDefaultTodos(page);

    const firstTodo = page.getByTestId('todo-item').nth(0);
    const secondTodo = page.getByTestId('todo-item').nth(1);
    await firstTodo.getByRole('checkbox').check();
    await secondTodo.getByRole('checkbox').check();

    // Ensure items have 'completed' class.
    await expect(firstTodo).toHaveClass('completed');
    await expect(secondTodo).toHaveClass('completed');

    await firstTodo.getByRole('checkbox').uncheck();
    await secondTodo.getByRole('checkbox').uncheck();

    // Ensure items do not have 'completed' class.
    await expect(firstTodo).not.toHaveClass('completed');
    await expect(secondTodo).not.toHaveClass('completed');
  });

  test('should allow me to edit an item', async ({ page }) => {
    await createDefaultTodos(page);

    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await expect(secondTodo.getByRole('textbox', { name: 'Edit' })).toHaveValue(TODO_ITEMS[1]);
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    // Explicitly assert the new text value.
    await expect(todoItems).toHaveText([TODO_ITEMS[0], 'buy some sausages', TODO_ITEMS[2]]);
  });
});

test.describe('Editing', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
  });

  test('should hide other controls when editing', async ({ page }) => {
    const todoItem = page.getByTestId('todo-item').nth(1);
    await todoItem.dblclick();
    await expect(todoItem.getByRole('checkbox')).not.toBeVisible();
    await expect(todoItem.getByRole('button')).not.toBeVisible();
  });

  test('should save edits on blur', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).dispatchEvent('blur');

    await expect(todoItems).toHaveText([TODO_ITEMS[0], 'buy some sausages', TODO_ITEMS[2]]);
  });

  test('should trim entered text', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('    buy some sausages    ');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(todoItems).toHaveText([TODO_ITEMS[0], 'buy some sausages', TODO_ITEMS[2]]);
  });

  test('should remove the item if an empty text string was entered', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should cancel edits on escape', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Escape');
    await expect(todoItems).toHaveText(TODO_ITEMS);
  });
});

test.describe('Counter', () => {
  test('should display the current number of todo items', async ({ page }) => {
    await createDefaultTodos(page);
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
    await checkNumberOfTodosInLocalStorage(page, 3);
  });
});

test.describe('Clear completed button', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
  });

  test('should display the correct text', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('should remove completed items when clicked', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByText(TODO_ITEMS[0])).not.toBeVisible();
    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should be hidden when there are no items that are completed', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeHidden();
  });
});

test.describe('Persistence', () => {
  test('should persist its data', async ({ page }) => {
    // Create two items.
    await createDefaultTodos(page);

    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await expect(firstTodo).toHaveClass('completed');

    // Ensure there is 1 completed item.
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Ensure there are 2 items.
    await checkNumberOfTodosInLocalStorage(page, 2);

    // Reload page.
    await page.reload();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);

    const firstTodoAfterReload = page.getByTestId('todo-item').nth(0);
    await expect(firstTodoAfterReload).toHaveClass('completed');
    await expect(firstTodoAfterReload.getByRole('checkbox')).toBeChecked();

    const secondTodoAfterReload = page.getByTestId('todo-item').nth(1);
    await expect(secondTodoAfterReload).not.toHaveClass('completed');
    await expect(secondTodoAfterReload.getByRole('checkbox')).not.toBeChecked();
  });
});

test.describe('Routing', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow me to display active items', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByText(TODO_ITEMS[1])).toBeVisible();
    await expect(page.getByText(TODO_ITEMS[2])).toBeVisible();
  });

  test('should respect the back button', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await page.goBack();
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
  });

  test('should allow me to display completed items', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
  });

  test('should allow me to display all items', async ({ page }) => {
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
  });

  test('should highlight the currently applied filter', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'All' })).toHaveClass('selected');
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByRole('link', { name: 'Active' })).toHaveClass('selected');
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByRole('link', { name: 'Completed' })).toHaveClass('selected');
  });
});

/**
 * @param {import('@playwright/test').Page} page
 */
async function createDefaultTodos(page) {
  const newTodo = page.getByPlaceholder('What needs to be done?');
  for (const item of TODO_ITEMS) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} expected
 */
async function checkNumberOfTodosInLocalStorage(page, expected) {
  return await page.waitForFunction(e => {
    const todos = JSON.parse(localStorage['react-todos']);
    console.log('Current todos:', todos); // Add logging
    return todos.length === e;
  }, expected, { timeout: 120000 }); // Increased timeout to 120 seconds
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} expected
 */
async function checkNumberOfCompletedTodosInLocalStorage(page, expected) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).filter(i => i.completed).length === e;
  }, expected, { timeout: 60000 });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} title
 */
async function checkTodosInLocalStorage(page, title) {
  return await page.waitForFunction(t => {
    return JSON.parse(localStorage['react-todos']).map(i => i.title).includes(t);
  }, title, { timeout: 60000 });
}