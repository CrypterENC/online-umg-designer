---
name: game-ui-designer
description: Expert guidelines and schema definitions for creating premium, high-fidelity, futuristic game UIs in the web UMG designer.
---

# Designing Epic Futuristic Game UIs in UMG Designer

This skill provides comprehensive instructions on how to design premium, sci-fi, and modern game UIs using the custom-built web UMG Designer. It covers the layout rules, styling parameters, text-to-tree schema, and high-fidelity JSON structure.

---

## 1. Advanced Futuristic Aesthetics System

Futuristic game interfaces (cyberpunk, space simulator, tactical military shooter) rely on high-precision geometry, micro-detailing, and luminous visual states.

### A. Color Palette & Typography
- **Core Panels**: Deep slate/navy-black (`#0a0805ff`, `#0b0f17`, `#0c1017ef`).
- **Interactive States**: Use high-contrast hot-spots:
  - Host/CTA (Orange): `#e8750a` (Solid), `#e8750a22` (Transparent backdrop).
  - Ready/Active (Cyan/Green): `#40d972` (Green), `#00d2ff` (Tactical cyan).
  - Muted/Inactive: `#484f58` (Muted border/text), `#2a3040` (Empty slots).
- **Fonts**: Use Montserrat or Inter. Set `fontWeight: "Bold"` for titles and `fontWeight: "Light"` with `letterSpacing: 246` (wide tracking) for futuristic subtitle/menu indicators.

### B. Neon Glows and Drop Shadows
The designer supports custom shadow generation using `glowColor` and `glowStrength`:
- **Neon Edges**: Set `borderColor` to a bright color (e.g. `#e8750a80`), set `borderWidth: 1`, and match the `glowColor` to the border color. Set `glowStrength: 10` to `20`.
- **Soft Shadows**: Set `glowColor: "#000000bb"` and `glowStrength: 25` to lift a main container card off the background canvas.

### C. Linear & Radial Gradients
Futuristic HUD cards look more premium with soft linear gradients:
- **Gradient Style JSON Format**:
  ```json
  "gradient": {
    "type": "linear",
    "angle": 135,
    "stops": [
      { "color": "#1a2540", "position": 0 },
      { "color": "#0a0f1a", "position": 1 }
    ]
  }
  ```

---

## 2. Advanced Layout Design Patterns

To build complex HUD panels, combine nested layout containers rather than relying on absolute canvas positions.

### Pattern 1: Circular Avatars and Fixed-Size Widgets
Inside flow containers (`HorizontalBox` / `VerticalBox`), children slots override width/height to auto. To enforce specific square or rectangular elements (like avatar circles or inventory items):
1. Wrap the element in a **SizeBox**.
2. Set properties: `"minDesiredWidth": 32, "minDesiredHeight": 32, "maxDesiredWidth": 32, "maxDesiredHeight": 32`.
3. Put a **Border** inside the SizeBox with `borderRadius: 50` (or half of the width) to make it a perfect circle.

### Pattern 2: Backdrop Blurs for Translucent Overlays
Futuristic panels look best when they blur the game viewport behind them:
1. Create a **BackgroundBlur** widget.
2. Set properties: `"blurStrength": 15`.
3. Put a dark, semi-transparent **Border** inside it (`backgroundColor: "rgba(10, 15, 25, 0.8)"`) to serve as the background card.

### Pattern 3: Overlay Stacking (Selection States)
To put selection indicators, warning badges, or lock icons on top of cards:
1. Add an **Overlay** widget.
2. Child 1 (Background): The main styled card `Border`.
3. Child 2 (Foreground Badge): A text, border, or image widget.
4. Set Child 2's slot alignments: e.g. `horizontalAlignment: "Right"`, `verticalAlignment: "Top"` with padding `[8, 8, 0, 0]` to anchor it in the top-right corner.

### Pattern 4: Inventory Grids (`UniformGridPanel`)
For weapon slots, items, or inventory:
1. Add a **UniformGridPanel** or **GridPanel**.
2. Set properties: `columnsCount` and `rowsCount`.
3. For each child widget, define its slot positions:
   ```json
   "slot": {
     "row": 0,
     "column": 2,
     "horizontalAlignment": "Fill",
     "verticalAlignment": "Fill"
   }
   ```

---

## 3. Micro-Animations and Feedback

To make the UI feel alive, apply CSS animations to panels or buttons on state transitions:
- **Available Animations**:
  - `fade`: Fades in and out continuously (useful for pulsing warning icons).
  - `pulse`: Softly scales up and down (perfect for waiting screens or matchmaking status).
  - `slide-up` / `slide-left`: Enters from the bottom or right on load.
  - `bounce`: Bounces vertically (great for arrows or prompts).
- **Animation Property JSON Format**:
  ```json
  "style": {
    "animation": {
      "type": "pulse",
      "duration": 1.5,
      "delay": 0.2,
      "loop": true
    }
  }
  ```

---

## 4. Text-to-UI Indented Hierarchy Syntax

When typing or editing the text tree format, nest children under their layout containers consistently:

```text
[CanvasPanel] WBP_Lobby_Root
  ├─ [Border] PlayerList_Border (46, 118, 762×846)
  │   └─ [VerticalBox] PlayerList_VBox (Fill, Fill)
  │       ├─ [HorizontalBox] Header_HBox (Auto, Left)
  │       │   ├─ [Text] "PLAYERS" (Center)
  │       │   └─ [Text] "3 READY" (Center)
  │       ├─ [Border] PlayerRow1 through PlayerRow5 (Auto, Fill)
  │       │   └─ [HorizontalBox] PlayerRow_HBox (Fill, Fill)
  │       │       ├─ [SizeBox] Avatar_Size (Auto, Center)
  │       │       │   └─ [Border] Avatar_Circle
  │       │       ├─ [VerticalBox] Player_Info (Fill, Center)
  │       │       │   ├─ [Text] "NightStalker" (Left)
  │       │       │   └─ [Text] "HOST" (Left)
  │       │       └─ [Border] Status_Badge (Auto, Center)
  │       │           └─ [Text] "READY" (Center)
  │       ├─ [Border] OpenSlot × 3 (Auto, Fill)
  │       │   └─ [Text] "— OPEN SLOT" (Center)
  │       ├─ [Spacer] (Fill)
  │       ├─ [Text] "WAITING FOR PLAYERS" (Auto, Left)
  │       └─ [ProgressBar] (Auto, Fill)
```

---

## 5. Complete JSON Schema Specification

Always write output JSON in the web UMG designer format:

```json
{
  "version": "1.0",
  "name": "WBP_FuturisticWidget",
  "source": "umg-designer",
  "canvas": { "width": 1920, "height": 1080 },
  "fonts": [
    { "name": "Montserrat", "url": "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.ttf" }
  ],
  "tree": {
    "type": "CanvasPanel",
    "name": "WBP_Lobby_Root",
    "style": { "visibility": "SelfHitTestInvisible", "backgroundColor": "#080c12" },
    "children": [
      {
        "type": "Border",
        "name": "MainCard",
        "slot": {
          "position": { "x": 100, "y": 100 },
          "size": { "x": 400, "y": 600 },
          "anchors": { "min": [0,0], "max": [0,0] }
        },
        "style": {
          "backgroundColor": "#0b0f17e0",
          "borderColor": "#00d2ff80",
          "borderWidth": 1,
          "borderRadius": 6,
          "glowColor": "#00d2ff55",
          "glowStrength": 12,
          "padding": [12, 12, 12, 12]
        },
        "children": []
      }
    ]
  }
}
```

---

## 6. Common JSON Schema Pitfalls to Avoid

When generating or editing JSON files for UMG Designer, you must follow these rules to ensure the JSON is valid and imports correctly:

### A. Widget Properties vs. Style Properties
Keep styling rules and interactive logic separated into their respective JSON blocks.
- **Properties Block (`"properties": { ... }`)**:
  - Contains: `"text"`, `"color"`, `"font"` (with `"size"`, `"weight"`, `"letterSpacing"`, `"family"`), `"percent"`, `"fillColor"`, `"isChecked"`, `"value"`, `"options"`, and Spacer `"size"`.
  - **CRITICAL**: Do **NOT** put `text` or `percent` at the root of a widget object, and do **NOT** put `fontSize`, `fontWeight`, or text `color` inside the `style` block.
- **Style Block (`"style": { ... }`)**:
  - Contains: `"backgroundColor"`, `"borderColor"`, `"borderWidth"`, `"borderRadius"`, `"padding"`, `"opacity"`, `"visibility"`, `"tint"`, `"glowColor"`, `"glowStrength"`, `"gradient"`, and `"animation"`.

### B. Correct Object Closures for Gradients
Ensure that you close nested gradient stops arrays and objects correctly. A common syntax error is failing to close the parent `style` block when gradients are included.
- **Incorrect Ending**:
  ```json
                    { "color": "#0a0f1a", "position": 1 }
                ]
              },
              "children": [ ... ]
  ```
- **Correct Ending (with `}` closing `"gradient"` and another `}` closing `"style"`)**:
  ```json
                    { "color": "#0a0f1a", "position": 1 }
                  ]
                }
              },
              "children": [ ... ]
  ```

### C. Direct Animation Property Nesting
The `"animation"` config object must reside **directly** under the parent `"style"` object. Do **NOT** wrap it in a nested `"style"` parameter.
- **Incorrect (Double Style Nesting)**:
  ```json
  "style": {
    "color": "#e8750a",
    "style": {
      "animation": { "type": "fade" }
    }
  }
  ```
- **Correct (Direct Nesting)**:
  ```json
  "style": {
    "color": "#e8750a",
    "animation": { "type": "fade" }
  }
  ```

---

## 7. Complete API Reference

For a complete breakdown of all 28 supported widgets, their default JSON properties, and parent slot behaviors, refer to the [UMG Widget Reference Sheet](file:///c:/Users/mathe/OneDrive/Documents/GitHub/online-umg-designer/.agents/skills/game-ui-designer/references/widgets_reference.md).

