import express from "express";
import bodyParser from "body-parser";
import { chromium } from "playwright";
import dotenv from "dotenv";

dotenv.config(); // Carga variables de entorno

const app = express();
app.use(bodyParser.json());

app.post("/accion", async (req, res) => {
  const { accion, cantidad, criterio } = req.body;

  console.log(`📥 Recibido: ${accion} a ${cantidad} cuentas sobre ${criterio}`);

  // Ejecutamos Playwright
  const resultado = await runPlaywright(accion, cantidad, criterio);

  res.json({
    estado: "ok",
    accion,
    cantidad,
    criterio,
    resultado,
  });
});

// Función principal Playwright
async function runPlaywright(accion, cantidad, criterio) {
  const browser = await chromium.launch({ headless: false }); // visible para debug
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Ir al login de Instagram
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' });

    // Esperar los campos
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.type('input[name="username"]', process.env.INSTAGRAM_USER, { delay: 50 });
    await page.type('input[name="password"]', process.env.INSTAGRAM_PASS, { delay: 50 });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Verificamos si se ha logueado
    const nav = await page.$('nav');
    if (!nav) throw new Error("Login fallido. Verifica tus credenciales.");

    console.log("✅ Login exitoso a Instagram");

    // Aquí irán futuras acciones como follow/unfollow...
    console.log(`🤖 Acción: ${accion} - Cantidad: ${cantidad} - Criterio: ${criterio}`);

    return `Simulación de ${accion} ejecutada correctamente`;

  } catch (error) {
    console.error("❌ Error en Playwright:", error);
    return "Error durante la ejecución: " + error.message;
  } finally {
    await browser.close();
  }
}

app.listen(3000, () => {
  console.log("🚀 Servidor activo en http://localhost:3000");
});