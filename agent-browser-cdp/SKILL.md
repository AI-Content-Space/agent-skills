---
name: agent-browser-cdp
description: Use when browser automation must reuse a real logged-in Chrome session through Chrome DevTools Protocol (CDP), especially for sites like Figma, GitHub, Google, Notion, or internal tools where `agent-browser`'s own browser is blocked or lacks the required auth state. Also use it for Figma tasks that need reading layer/property details or exporting icons/assets directly from the page without screenshots.
---

# Agent Browser CDP

Launch a dedicated Chrome profile with CDP enabled, then connect `agent-browser` to that live browser instead of using its built-in Chrome for Testing session.

Use this skill when the task needs a real browser login state, persistent cookies, or a site rejects automation traffic from the default `agent-browser open` flow.

## Prerequisite Check

Verify both tools exist before doing anything else:

```bash
command -v agent-browser >/dev/null 2>&1
test -d "/Applications/Google Chrome.app"
```

If `agent-browser` is missing, install it first:

```bash
npm install -g agent-browser
agent-browser install
```

## Skill Path

Set the skill directory once so commands stay short:

```bash
export AB_CDP_SKILL_DIR="${AB_CDP_SKILL_DIR:-$PWD/agent-browser-cdp}"
```

If you are using the installed skill from `$CODEX_HOME/skills`, point `AB_CDP_SKILL_DIR` there instead.

## Standard Workflow

### 1. Start Chrome with CDP

Use the bundled launcher. Defaults:

- port: `9222`
- profile dir: `~/.chrome-agent-browser`
- start URL: `about:blank`

```bash
"$AB_CDP_SKILL_DIR/scripts/start-chrome-cdp.sh" 9222 "$HOME/.chrome-agent-browser" "about:blank"
```

The script waits until `http://127.0.0.1:9222/json/version` is reachable and prints the browser websocket URL.

### 2. If login is required, let the user complete it

For Figma, Google, GitHub, or internal SSO flows, the user may need to finish login or CAPTCHA once in that Chrome window.

Do not keep retrying automation until the browser has the required authenticated state.

### 3. Connect `agent-browser`

```bash
agent-browser connect 9222
```

Validate the connection immediately:

```bash
agent-browser get url
agent-browser get title
agent-browser snapshot
```

If `connect` fails, run the health check script first:

```bash
"$AB_CDP_SKILL_DIR/scripts/check-cdp.sh" 9222
```

### 4. Operate the page

Once connected, use normal `agent-browser` commands against the live Chrome session:

```bash
agent-browser open "https://example.com"
agent-browser snapshot
agent-browser click @e2
agent-browser screenshot
```

For page reads, prefer this loop:

1. `agent-browser get url`
2. `agent-browser get title`
3. `agent-browser snapshot`
4. `agent-browser screenshot`

That makes it obvious whether the task is blocked by auth, redirects, or bot protection.

## Recommended Patterns

### Reuse a logged-in Figma session

```bash
"$AB_CDP_SKILL_DIR/scripts/start-chrome-cdp.sh" 9222 "$HOME/.chrome-agent-browser" \
  "https://www.figma.com/design/FILE/NAME"

agent-browser connect 9222
agent-browser get title
agent-browser snapshot
agent-browser screenshot output/figma.png
```

### Read the current Figma selection and properties

For Figma, prefer reading the live page state through raw CDP instead of relying on screenshots. This prints:

- current URL and title
- currently selected layer rows from the left panel
- right panel property lines such as width, height, colors, hex, export

```bash
node "$AB_CDP_SKILL_DIR/scripts/read-figma-panel.js" 9222
```

You can narrow the output with extra keywords:

```bash
node "$AB_CDP_SKILL_DIR/scripts/read-figma-panel.js" 9222 颜色 hex width height export
```

### Export specific Figma layers as SVG

This flow is for repeated asset extraction, especially icons inside a frame:

1. Open the Figma file in the CDP Chrome profile.
2. Make sure the left `Layers` panel is visible.
3. Export by layer name:

```bash
node "$AB_CDP_SKILL_DIR/scripts/export-figma-layers.js" \
  9222 \
  "$PWD/output/agent-browser/raw-exports" \
  "icon_入金tab" "设置更多箭头" "银行账户"
```

That script:

- finds the live Figma page target from `/json/list`
- selects layers by left-panel row text instead of clicking the canvas
- opens export settings when needed
- switches the export format to `SVG`
- clicks the export button
- saves each downloaded zip to the output directory

Then unpack the zips to actual SVG files:

```bash
python3 "$AB_CDP_SKILL_DIR/scripts/unpack-figma-exports.py" \
  "$PWD/output/agent-browser/raw-exports" \
  "$PWD/output/agent-browser/icons"
```

### Lowest-token Figma export path

If the layer names are already known, skip all exploratory reads and run a single command:

```bash
"$AB_CDP_SKILL_DIR/scripts/export-figma-svg.sh" \
  9222 \
  "$PWD/output/agent-browser/icons" \
  "icon_入金tab" "设置更多箭头" "银行账户"
```

That wrapper:

- exports the named Figma layers
- saves the raw zip files under `output/agent-browser/raw-exports`
- unpacks them to SVG files under `output/agent-browser/icons`

Use the longer read flow only when the layer names are unknown.

### Rebuild a prototype from Figma

Use this order:

1. Read the current page and selected node with `read-figma-panel.js`
2. Capture exact layer names from the left panel
3. Read width, height, colors, hex, layout, and export details from the right panel
4. Export icons or other vector assets with `export-figma-layers.js`
5. Recreate the screen from property values and exported SVGs

For Figma, do not treat the canvas as the source of truth. Prefer:

- left panel row names for node targeting
- right panel text for dimensions, colors, and layout
- exported SVGs for icons and vectors

This is more reliable than screenshots and avoids blurry assets.

### Reconnect to an already running CDP Chrome

```bash
"$AB_CDP_SKILL_DIR/scripts/check-cdp.sh" 9222
agent-browser connect 9222
```

### Use a different port or profile

```bash
"$AB_CDP_SKILL_DIR/scripts/start-chrome-cdp.sh" 9333 "$HOME/.chrome-agent-browser-work" "https://github.com"
agent-browser connect 9333
```

## Troubleshooting

- If `agent-browser connect 9222` fails, verify the endpoint manually:

```bash
curl -fsS http://127.0.0.1:9222/json/version
```

- If the endpoint is down, the browser was not started with CDP. Restart it using the launcher script.
- If the endpoint works but the target page still blocks requests, the site likely needs login or human verification in that exact Chrome profile.
- If the page is open in your everyday Chrome but not in the CDP profile, that is expected. The dedicated profile is separate by design.
- Prefer a dedicated profile directory. Do not point this skill at your default daily Chrome profile unless there is a specific reason.
- For Figma specifically, `agent-browser connect` is useful for gross browser control, but detailed reads often work better through the bundled raw CDP scripts because they talk to the real page target from `/json/list`.
- If a Figma export downloads `V0.0.3.zip`, that is expected. Use `unpack-figma-exports.py` to extract the first SVG payload and rename it to the layer name.

## Guardrails

- Prefer a real Chrome session plus `agent-browser connect`; only fall back to `agent-browser open` when auth and anti-bot issues are not relevant.
- Keep one stable port per workflow. Changing ports mid-task makes reconnects harder.
- Re-check `get url`, `get title`, and `snapshot` after login, redirects, or tab changes.
- Do not assume CDP is active just because Chrome is open. Always verify with `/json/version` or `check-cdp.sh`.
- For Figma, prefer selecting nodes from the left `Layers` panel instead of guessing canvas coordinates.
- For repeated extraction, keep exports under a dedicated output directory such as `output/agent-browser/raw-exports` and unpacked SVGs under `output/agent-browser/icons`.
- If the task is only "download these known icons", skip screenshots, `snapshot`, repeated `curl /json/list`, and repeated property reads. Use `export-figma-svg.sh` directly.
