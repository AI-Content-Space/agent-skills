#!/usr/bin/env node

const http = require("http");

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

async function main() {
  const port = process.argv[2] || "9222";
  const keywordArgs = process.argv.slice(3);
  const keywords = keywordArgs.length
    ? keywordArgs
    : ["width", "height", "color", "hex", "fill", "layout", "export", "gap"];

  const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find(
    (item) =>
      item.type === "page" &&
      (item.title.includes("Figma") || item.url.includes("figma.com/design/")),
  );
  if (!page) {
    throw new Error(`No Figma page target found on port ${port}`);
  }

  const client = connect(page.webSocketDebuggerUrl);
  await new Promise((resolve) => client.ws.addEventListener("open", resolve, { once: true }));

  try {
    await client.call("Runtime.enable");
    const expression = `(() => {
      const bodyText = document.body ? document.body.innerText : "";
      const lines = bodyText.split(/\\n/).map((line) => line.trim()).filter(Boolean);
      const selectedRows = [...document.querySelectorAll('[data-testid="layer-row-with-children"], [data-testid="layer-row"]')]
        .map((el) => ({
          text: (el.innerText || "").trim().split(/\\n/)[0],
          className: el.className || "",
        }))
        .filter((row) => /selected/i.test(row.className))
        .map((row) => row.text);
      const matches = [];
      const terms = ${JSON.stringify(keywords)};
      lines.forEach((line, index) => {
        if (terms.some((term) => line.toLowerCase().includes(term.toLowerCase()))) {
          matches.push({
            line,
            context: lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)),
          });
        }
      });
      return {
        href: location.href,
        title: document.title,
        selectedRows,
        matches,
      };
    })()`;
    const result = await client.call("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    console.log(JSON.stringify(result.result.value, null, 2));
  } finally {
    client.ws.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
