#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (!data.id || !pending.has(data.id)) return;
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(data.error);
    else resolve(data.result);
  });

  return {
    ws,
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function evalValue(client, expression) {
  const result = await client.call("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  return result.result.value;
}

async function main() {
  const port = process.argv[2] || "9222";
  const outputDir = process.argv[3];
  const layerNames = process.argv.slice(4);

  if (!outputDir || layerNames.length === 0) {
    console.error(
      "Usage: export-figma-layers.js <port> <output-dir> <layer-name> [layer-name ...]",
    );
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-export-"));

  const pages = await getJson(`http://127.0.0.1:${port}/json/list`);
  const browserInfo = await getJson(`http://127.0.0.1:${port}/json/version`);
  const page = pages.find(
    (item) =>
      item.type === "page" &&
      (item.title.includes("Figma") || item.url.includes("figma.com/design/")),
  );
  if (!page) {
    throw new Error(`No Figma page target found on port ${port}`);
  }

  const browser = connect(browserInfo.webSocketDebuggerUrl);
  const client = connect(page.webSocketDebuggerUrl);
  await Promise.all([
    new Promise((resolve) => browser.ws.addEventListener("open", resolve, { once: true })),
    new Promise((resolve) => client.ws.addEventListener("open", resolve, { once: true })),
  ]);

  try {
    await browser.call("Browser.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: tmpDir,
      eventsEnabled: true,
    });
    await client.call("Runtime.enable");
    await client.call("Page.enable");

    const results = [];

    for (const layerName of layerNames) {
      for (const file of fs.readdirSync(tmpDir)) {
        fs.rmSync(path.join(tmpDir, file), { force: true, recursive: true });
      }

      const row = await evalValue(
        client,
        `(() => {
          const rows = [...document.querySelectorAll('[data-testid="layer-row-with-children"], [data-testid="layer-row"]')];
          const row = rows.find((el) => (el.innerText || "").trim().split(/\\n/)[0] === ${JSON.stringify(layerName)});
          if (!row) return null;
          const rect = row.getBoundingClientRect();
          return {
            x: Math.max(20, Math.min(window.innerWidth - 20, rect.left + 120)),
            y: rect.top + rect.height / 2,
          };
        })()`,
      );
      if (!row) {
        throw new Error(`Layer row not found: ${layerName}`);
      }

      await client.call("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: row.x,
        y: row.y,
        button: "none",
      });
      await client.call("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: row.x,
        y: row.y,
        button: "left",
        clickCount: 1,
      });
      await client.call("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: row.x,
        y: row.y,
        button: "left",
        clickCount: 1,
      });
      await sleep(700);

      let exportText = await evalValue(
        client,
        `(() => document.querySelector('[data-testid="export-inspection-panel"]')?.innerText || "")()`,
      );
      if (!/Export file type/.test(exportText)) {
        await evalValue(
          client,
          `(() => {
            const btn = [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").trim() === "Add export settings");
            if (btn) btn.click();
            return true;
          })()`,
        );
        await sleep(500);
      }

      exportText = await evalValue(
        client,
        `(() => document.querySelector('[data-testid="export-inspection-panel"]')?.innerText || "")()`,
      );
      if (!/\nSVG\n/.test(`\n${exportText}\n`)) {
        const combo = await evalValue(
          client,
          `(() => {
            const el = [...document.querySelectorAll('[role="combobox"], button')]
              .find((node) => ["PNG", "JPG", "PDF", "SVG"].includes((node.innerText || "").trim()));
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          })()`,
        );
        if (!combo) {
          throw new Error(`Export format selector not found for ${layerName}`);
        }
        for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
          await client.call("Input.dispatchMouseEvent", {
            type,
            x: combo.x,
            y: combo.y,
            button: type === "mouseMoved" ? "none" : "left",
            clickCount: type === "mouseMoved" ? 0 : 1,
          });
        }
        await sleep(300);

        const svgOption = await evalValue(
          client,
          `(() => {
            const opt = [...document.querySelectorAll('[role="option"], *')]
              .find((node) => (node.innerText || "").trim() === "SVG");
            if (!opt) return null;
            const rect = opt.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          })()`,
        );
        if (!svgOption) {
          throw new Error(`SVG option not found for ${layerName}`);
        }
        for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
          await client.call("Input.dispatchMouseEvent", {
            type,
            x: svgOption.x,
            y: svgOption.y,
            button: type === "mouseMoved" ? "none" : "left",
            clickCount: type === "mouseMoved" ? 0 : 1,
          });
        }
        await sleep(500);
      }

      const exportButton = await evalValue(
        client,
        `(() => {
          const btn = [...document.querySelectorAll("button")]
            .find((node) => /^Export\\s+/.test((node.innerText || "").trim()));
          if (!btn) return null;
          const rect = btn.getBoundingClientRect();
          return {
            label: (btn.innerText || "").trim(),
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        })()`,
      );
      if (!exportButton) {
        throw new Error(`Export button not found for ${layerName}`);
      }

      for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
        await client.call("Input.dispatchMouseEvent", {
          type,
          x: exportButton.x,
          y: exportButton.y,
          button: type === "mouseMoved" ? "none" : "left",
          clickCount: type === "mouseMoved" ? 0 : 1,
        });
      }

      let downloaded = null;
      for (let i = 0; i < 20; i += 1) {
        await sleep(500);
        const files = fs.readdirSync(tmpDir).filter((file) => !file.endsWith(".crdownload"));
        if (files.length > 0) {
          downloaded = files[0];
          break;
        }
      }
      if (!downloaded) {
        throw new Error(`Download timeout for ${layerName}`);
      }

      const targetZip = path.join(outputDir, `${layerName}.zip`);
      if (fs.existsSync(targetZip)) {
        fs.rmSync(targetZip, { force: true });
      }
      fs.renameSync(path.join(tmpDir, downloaded), targetZip);
      results.push({
        layerName,
        exportLabel: exportButton.label,
        zip: targetZip,
      });
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    browser.ws.close();
    client.ws.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
