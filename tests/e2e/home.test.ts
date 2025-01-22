import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bolt/);
  });

  test('should have main navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for the presence of key UI elements
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Verify the chat input is present
    const chatInput = page.getByRole('textbox');
    await expect(chatInput).toBeVisible();
  });

  test('should be able to type in chat input', async ({ page }) => {
    await page.goto('/');
    
    const chatInput = page.getByRole('textbox');
    await chatInput.click();
    await chatInput.fill('Hello, Bolt!');
    await expect(chatInput).toHaveValue('Hello, Bolt!');
  });
}); 