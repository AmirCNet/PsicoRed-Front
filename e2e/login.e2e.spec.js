// @ts-check
import { test, expect } from '@playwright/test'

// URL del endpoint de login del Backend
const LOGIN_URL = '**/api/auth/login'

// Mock de respuesta exitosa — rol 'administrador' 
const USUARIO_MOCK = {
  token: 'mock-jwt-token.payload.signature',
  usuario: { id: 'u1', email: 'test@mail.com', rol: 'administrador' }
}

// Limpia la sesión antes de cada test usando addInitScript para que se ejecute
// antes de que Vue/el router monten y lean el localStorage.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('perfilCompleto')
  })
  await page.goto('/login')
})

// E2E — Flujo de Login (PsicoRed Frontend)

test('muestra el formulario de login al entrar a /login', async ({ page }) => {
  await expect(page.locator('#email-login')).toBeVisible()
  await expect(page.locator('#password-login')).toBeVisible()
  // Hay dos formularios en el DOM (login y registro); buscamos el botón por texto
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
})

test('login exitoso con credenciales válidas redirige al /dashboard', async ({ page }) => {
  // Intercepta la llamada real al backend y devuelve un 200 con usuario administrador
  await page.route(LOGIN_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(USUARIO_MOCK)
    })
  })

  await page.fill('#email-login', 'test@mail.com')
  await page.fill('#password-login', 'password123')
  await page.getByRole('button', { name: 'Ingresar' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
})

test('credenciales incorrectas → muestra error y permanece en /login', async ({ page }) => {
  // Backend responde 401
  await page.route(LOGIN_URL, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Credenciales incorrectas' })
    })
  })

  await page.fill('#email-login', 'test@mail.com')
  await page.fill('#password-login', 'clave-incorrecta')
  await page.getByRole('button', { name: 'Ingresar' }).click()

  await expect(page.locator('.form-error')).toBeVisible()
  await expect(page.locator('.form-error')).toContainText('Credenciales incorrectas')
  await expect(page).toHaveURL(/\/login/)
})

test('submit sin completar todos los campos → backend responde 400 con error', async ({ page }) => {
  // El backend rechaza por campos requeridos faltantes
  await page.route(LOGIN_URL, async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Email y contraseña son requeridos' })
    })
  })

  // Solo llena email, omite password
  await page.fill('#email-login', 'test@mail.com')
  await page.evaluate(() => {
    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })

  await expect(page.locator('.form-error')).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})
