# UMG Designer

A live browser-based UI builder for Unreal Engine 5 widgets. Design your UMG layouts visually in Next.js, export to `.umgbridge.json`, and import directly into UE5 via the UMGBridge plugin — no manual widget tree editing required.

Built for **PropNight** (UE5 Prop Hunt game), targeting UE 5.8.

---

## What It Does

- Drag-and-drop widget composition in the browser
- Real-time property editing (colors, fonts, padding, borders, alignment)
- Export to UMGBridge JSON format consumable by UE5
- MCP tool endpoint for AI-assisted design automation
- Docs page with scroll-spy navigation

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
umg-designer/
├── app/
│   ├── page.tsx               # Root canvas page
│   └── docs/
│       └── page.tsx           # Docs with scroll-spy nav
├── components/
│   └── PropertiesPanel.tsx    # Widget property editor (click-to-select-all inputs)
├── lib/
│   ├── types.ts               # Widget type definitions (PropData, drawAs, etc.)
│   └── exportImport.ts        # JSON serialization / deserialization
└── pages/
    └── api/
        ├── mcp.ts             # MCP tool endpoint (/api/mcp)
        ├── call.ts            # REST tool caller
        └── design.ts          # GET/PUT design state
```

---

## UMGBridge JSON Format

The designer exports this schema, consumed by the UMGBridge UE5 plugin:

```json
{
  "version": "1.0",
  "name": "WBP_MyWidget",
  "canvas": { "width": 1920, "height": 1080 },
  "tree": {
    "type": "VerticalBox",
    "name": "VB_Root",
    "slot": {
      "sizeRule": "Fill",
      "horizontalAlignment": "Fill"
    },
    "style": {
      "opacity": 1.0,
      "visibility": "Visible"
    },
    "children": []
  }
}
```

### Supported Widget Types

| Type | Notes |
|---|---|
| `VerticalBox` | Vertical stack layout |
| `HorizontalBox` | Horizontal stack layout |
| `CanvasPanel` | Free-position layout |
| `Overlay` | Z-stack layout |
| `ScrollBox` | Scrollable container |
| `GridPanel` | Grid layout |
| `Border` | Styled container with border/background |
| `Button` | Clickable button with style states |
| `TextBlock` | Text label |
| `Image` | Image/brush widget |
| `ProgressBar` | Progress/health bar |

### Colors

All colors use `#RRGGBBAA` format.

**PropNight palette:**

| Token | Hex | Use |
|---|---|---|
| `bg` | `#090b0fff` | Page background |
| `panel` | `#0c0f16eb` | Card / panel background |
| `border` | `#ffffff0f` | Subtle border |
| `amber` | `#f28c1aff` | Host Game / primary action |
| `cyan` | `#33bfe5ff` | Find & Join / secondary action |
| `green` | `#40d972ff` | Ready state |
| `text` | `#faf5ebff` | Primary text |
| `muted` | `#c8beaf73` | Subtext / ghost labels |

---

## MCP Integration

The designer exposes a standard Model Context Protocol (MCP) server endpoint at `/api/mcp` and a REST helper endpoint at `/api/call` for AI-assisted widget layout authoring.

The live designer is deployed at: **[https://web-umg-designer.vercel.app/](https://web-umg-designer.vercel.app/)**

### 1. Register the Live MCP Server
Add the live Vercel server to your global `.mcp.json` configuration file (e.g. for Claude Desktop or Claude Code):

```json
{
  "mcpServers": {
    "umg-designer-live": {
      "type": "http",
      "url": "https://web-umg-designer.vercel.app/api/mcp"
    }
  }
}
```

### 2. Live Bidirectional Sync Workflow
- **AI-driven Authoring**: Open the live designer in your browser. Connect your AI agent to the `umg-designer-live` server and instruct it to build a UI (e.g. *"Create a vertical layout with 3 navigation buttons using umg-designer-live"*). As the AI executes `add_widget` calls, the layout will immediately update in your browser live within 1 second.
- **Manual Edits Feedback**: Any manual updates you perform in the browser (dragging, resizing, renaming, styling widgets) are automatically pushed back to the server. The AI will see your manual edits when it calls `list_widgets`.
- **Exporting**: Click **Export .umgbridge.json** in the browser to download the schema for direct import into UE5.

### 3. Available Tools

| Tool | Parameters | Description |
|---|---|---|
| `add_widget` | `type`, `name`, `properties?`, `style?`, `slot?`, `parentId?` | Add a widget (type, name, slot parameters, styles, parent nesting) to the canvas |
| `list_widgets` | None | Recursively list all widgets in the current design |
| `export_design` | `filename` | Export the current design tree in `.umgbridge.json` schema |
| `clear_canvas` | None | Reset the canvas and remove all widgets |

### 4. REST Call Fallback (Without MCP Config)
You can test tool execution using standard HTTP POST requests to `/api/call`:

```bash
curl -X POST https://web-umg-designer.vercel.app/api/call \
  -H "Content-Type: application/json" \
  -d '{"name": "add_widget", "arguments": {"type": "Button", "name": "Btn_Play", "properties": {"text": "Play Now"}}}'
```

---

## UMGBridge Plugin (UE5 Side)

The companion plugin lives at `Plugins/UMGBridge/`. It handles:

- **Import**: `.umgbridge.json` → Widget Blueprint widget tree
- **Export**: Widget Blueprint → `.umgbridge.json` (bidirectional)

### UE5.8 Compatibility Fixes Applied

| Issue | Fix |
|---|---|
| `EStretch::Uniform/UniformToFill` renamed | Updated enum references |
| `SetFillSpan` → `SetFillSpanWhenLessThan` | API rename tracked |
| `ClearHierarchy` removed | Replaced with supported API |
| `GeneratedClass` cast broken | Fixed cast chain |
| `DesignTimeSize` doesn't exist | Property reflection via `FindPropertyByName` |
| `Justification` is `protected:` | `FByteProperty` reflection workaround |

---

## Known Issues

| Issue | Workaround |
|---|---|
| Border with `RoundedBox` + zero radius shows white corner pixels in UE | After import, change **Draw As → Image** in UE editor for solid-color borders with no radius |
| `borderWidth` / `borderRadius` export only when `borderColor` is set | By design — prevents phantom white borders in UE when no border is intended |

---

## Related

- `umg-mcp-server/` — TypeScript/Express MCP server (port 8001) for standalone AI design automation
- `Plugins/UMGBridge/` — UE5 plugin (import + export)
- `HOW-TO-RUN-DESIGNER.md` — Step-by-step for running both servers together
- `session.md` — Full implementation status and EOS session system docs
