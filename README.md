# UMG Designer

Next.js visual UI builder for PropNight (UE5). Design widgets in the browser, export `.umgbridge.json`, import into UE5 via the UMGBridge plugin.

## Quick Start

```bash
npm run dev
```

Runs on `http://localhost:3000`.

## Architecture

| File | Purpose |
|---|---|
| `app/page.tsx` | Root page |
| `pages/api/mcp.ts` | MCP endpoint (`/api/mcp`) |
| `pages/api/call.ts` | REST tool caller |
| `pages/api/design.ts` | GET/PUT design state |
| `lib/exportImport.ts` | JSON export/import logic |
| `lib/types.ts` | Widget type definitions |
| `components/PropertiesPanel.tsx` | Widget property editor |
| `app/docs/page.tsx` | Docs with scroll-spy nav |

## Export Format

```json
{
  "version": "1.0",
  "name": "WBP_MyWidget",
  "canvas": { "width": 1920, "height": 1080 },
  "tree": {
    "type": "VerticalBox",
    "name": "VB_Root",
    "slot": { "sizeRule": "Fill", "horizontalAlignment": "Fill" },
    "children": []
  }
}
```

Colors always `#RRGGBBAA`. PropNight palette:

| Token | Hex |
|---|---|
| bg | `#090b0fff` |
| panel | `#0c0f16eb` |
| border | `#ffffff0f` |
| amber | `#f28c1aff` |
| cyan | `#33bfe5ff` |
| green | `#40d972ff` |
| text | `#faf5ebff` |
| muted | `#c8beaf73` |

## Known Issues

- Border widgets with `RoundedBox` + zero radius show white corner pixels in UE. Workaround: change Draw As → Image in UE editor after import.
