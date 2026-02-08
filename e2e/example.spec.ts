import { expect, test } from '@playwright/test';

test('users list → user todos → add todo', async ({ page }) => {
  // Stub the public APIs so the test is deterministic and fast.
  const users = [
    { id: 1, name: 'Ada Lovelace', username: 'ada', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', username: 'alan', email: 'alan@example.com' },
  ];
  const todos = [
    { userId: 1, id: 1, title: 'Write notes', completed: false },
    { userId: 1, id: 2, title: 'Ship v1', completed: true },
    { userId: 2, id: 3, title: 'Review PRs', completed: false },
  ];

  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    await route.fulfill({ json: users });
  });
  await page.route('https://jsonplaceholder.typicode.com/users/*', async (route) => {
    const url = new URL(route.request().url());
    const id = Number(url.pathname.split('/').pop());
    const user = users.find((u) => u.id === id);
    await route.fulfill({ json: user ?? {}, status: user ? 200 : 404 });
  });
  await page.route('https://jsonplaceholder.typicode.com/todos', async (route) => {
    await route.fulfill({ json: todos });
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/Pollinate Frontend Task/);

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await page.getByRole('link', { name: /View to-dos for Ada Lovelace/ }).click();

  await expect(page.getByRole('heading', { name: /Ada Lovelace/ })).toBeVisible();
  await expect(page.getByText('Write notes')).toBeVisible();

  await page.getByLabel('Title').fill('Buy milk');
  await page.getByRole('button', { name: 'Add to-do' }).click();
  await expect(page.getByText('Buy milk')).toBeVisible();
});
