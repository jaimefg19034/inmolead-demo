"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");

(async () => {
  const server = spawn("python", ["-m", "http.server", "4173", "--bind", "127.0.0.1"], { stdio: "ignore" });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 40; i++) {
      try { const response = await fetch("http://127.0.0.1:4173/"); if (response.ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.ok(ready, "El servidor local debe arrancar");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ acceptDownloads: true });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.locator("#order-list [data-order]").first().click();
    while (await page.locator("#detail-panel [data-resolve]").count()) {
      await page.locator("#detail-panel [data-resolve]").first().click();
    }
    await page.locator("#approve").click();
    await page.locator("#detail-panel .status.approved").waitFor();

    await page.locator('[data-view="catalog"]').click();
    await page.locator("#catalog-add").click();
    await page.locator("#product-sku").fill("E2E-001");
    await page.locator("#product-name").fill("Producto de prueba");
    await page.locator("#product-unit").fill("ud.");
    await page.locator("#product-price").fill("12.5");
    await page.locator("#save-product").click();
    await page.locator("#catalog-search").fill("E2E-001");
    await page.locator('[data-product-edit="E2E-001"]').click();
    await page.locator("#product-name").fill("Producto de prueba editado");
    await page.locator("#save-product").click();
    assert.match(await page.locator("#catalog-list").innerText(), /Producto de prueba editado/);

    await page.locator("#catalog-import").click();
    await page.locator("#catalog-file").setInputFiles({ name: "catalogo-e2e.csv", mimeType: "text/csv", buffer: Buffer.from("referencia;producto;unidad;precio_unitario\nE2E-CSV;Producto CSV;ud.;4.25\n") });
    await page.locator("#import-preview-confirm").waitFor({ state: "visible" });
    await page.locator("#import-preview-confirm").click();
    await page.getByText(/Catálogo actualizado/).waitFor();

    await page.locator('[data-view="orders"]').click();
    await page.locator("#import-csv").click();
    await page.locator("#csv-file").setInputFiles({ name: "pedidos-e2e.csv", mimeType: "text/csv", buffer: Buffer.from("pedido;cliente;referencia;producto;cantidad;unidad;precio_unitario\nE2E-PED-01;Cliente E2E;E2E-CSV;Producto CSV;2;ud.;4.25\n") });
    await page.locator("#import-preview-confirm").waitFor({ state: "visible" });
    await page.locator("#import-preview-confirm").click();
    await page.getByText("Cliente E2E").first().waitFor();
    assert.equal(await page.locator("#order-list [data-order]").count(), 6);

    const [csvDownload] = await Promise.all([page.waitForEvent("download"), page.locator("#export-all").click()]);
    assert.match(csvDownload.suggestedFilename(), /\.csv$/);

    const [backupDownload] = await Promise.all([page.waitForEvent("download"), page.locator("#backup-data").click()]);
    const backupPath = await backupDownload.path();
    assert.ok(backupPath, "La copia JSON debe descargarse");
    await page.locator('[data-view="catalog"]').click();
    await page.locator("#catalog-add").click();
    await page.locator("#product-sku").fill("E2E-POST");
    await page.locator("#product-name").fill("No debe sobrevivir");
    await page.locator("#product-unit").fill("ud.");
    await page.locator("#product-price").fill("1");
    await page.locator("#save-product").click();
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#backup-file").setInputFiles(backupPath);
    await page.getByText("Copia restaurada correctamente.").waitFor();
    await page.locator("#catalog-search").fill("E2E-POST");
    assert.equal(await page.locator("#catalog-list [data-product-edit]").count(), 0);
    await page.locator("#catalog-search").fill("E2E-CSV");
    assert.equal(await page.locator("#catalog-list [data-product-edit]").count(), 1);
    assert.deepEqual(pageErrors, [], "La aplicación no debe generar errores JavaScript en consola");

    console.log("E2E OK: revisar, aprobar, crear/editar catálogo, importar CSV, exportar y restaurar copia.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.kill();
  }
})();