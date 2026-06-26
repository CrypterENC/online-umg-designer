# UMG Widget Reference Document

This document provides a complete technical reference for all widget types, properties, and styles supported by the UMG Designer web app and the Unreal Engine C++ importer plugin. Use this guide to structure valid UI trees and JSON layouts.

---

## 1. Widget Types Overview

The designer supports **28** distinct widget types, divided into container panels (which can hold children) and leaf widgets (which render content or capture input).

| Icon | Widget Name | Category / Type | Container? | Single Child? | Description / Role |
| :---: | :--- | :--- | :---: | :---: | :--- |
| ⬡ | **CanvasPanel** | Panel / Multi-Child | ✅ | ❌ | Root container supporting absolute positioning and Anchors. |
| ⧉ | **Overlay** | Panel / Multi-Child | ✅ | ❌ | Stacks children on top of each other, aligning them relative to the cell. |
| ☰ | **VerticalBox** | Panel / Multi-Child | ✅ | ❌ | Flows children vertically from top to bottom. |
| ⇔ | **HorizontalBox** | Panel / Multi-Child | ✅ | ❌ | Flows children horizontally from left to right. |
| ⊞ | **GridPanel** | Panel / Multi-Child | ✅ | ❌ | Flexible column/row grid container. |
| ⊟ | **UniformGridPanel** | Panel / Multi-Child | ✅ | ❌ | Grid where all cells enforce the same width and height dimensions. |
| ↕ | **ScrollBox** | Panel / Multi-Child | ✅ | ❌ | Flow container supporting vertical scrolling. |
| ↩ | **WrapBox** | Panel / Multi-Child | ✅ | ❌ | Flow container that wraps children to a new line when bounds are exceeded. |
| ▢ | **Border** | Panel / Single Child | ✅ | ✅ | Draws background borders, colors, rounded corners, padding, and gradients. Supports single child. |
| ⤡ | **SizeBox** | Panel / Single Child | ✅ | ✅ | Locks width/height limits (min/max desired width/height) for its single child. |
| ⤢ | **ScaleBox** | Panel / Single Child | ✅ | ✅ | Scales child widget content aspect-ratio dynamically. |
| ◫ | **BackgroundBlur** | Panel / Single Child | ✅ | ✅ | Applies GPU Gaussian backdrop blur strength (blurStrength) behind its child. |
| ⬚ | **RetainerBox** | Panel / Single Child | ✅ | ✅ | Retainer Box widget. |
| ◈ | **NamedSlot** | Panel / Single Child | ✅ | ✅ | Named Slot widget. |
| ⚡ | **InvalidationBox** | Panel / Single Child | ✅ | ✅ | Invalidation Box widget. |
| ⬜ | **Button** | Panel / Multi-Child | ✅ | ❌ | Interactive clickable container widget. |
| T | **Text** | Common / Leaf | ❌ | ❌ | Standard text block supporting size, weight, letter spacing, and fonts. |
| Ŧ | **RichText** | Common / Leaf | ❌ | ❌ | Text block supporting inline formatting styles. |
| 🖼 | **Image** | Common / Leaf | ❌ | ❌ | Displays flat colors or texture assets. |
| ▭ | **TextInput** | Common / Leaf | ❌ | ❌ | Single-line text entry field. |
| ▬ | **ProgressBar** | Feedback / Leaf | ❌ | ❌ | Fills percentage (percent) horizontally using fillColor. |
| ⊟ | **Slider** | Input / Leaf | ❌ | ❌ | Slider widget. |
| ☑ | **CheckBox** | Input / Leaf | ❌ | ❌ | Check Box widget. |
| 🔢 | **SpinBox** | Input / Leaf | ❌ | ❌ | Spin Box widget. |
| ▾ | **ComboBox** | Input / Leaf | ❌ | ❌ | Combo Box widget. |
| ↔ | **Spacer** | Common / Leaf | ❌ | ❌ | Injects transparent empty space (size) between flow items. |
| ⟳ | **Throbber** | Feedback / Leaf | ❌ | ❌ | Throbber widget. |
| ◌ | **CircularThrobber** | Feedback / Leaf | ❌ | ❌ | Circular Throbber widget. |

---

## 2. Widget Schema & Default Configurations

Below is the exact schema, default style properties, and default widget properties for each supported widget type.

### ⬡ CanvasPanel
- **Label**: Canvas Panel
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ⧉ Overlay
- **Label**: Overlay
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ☰ VerticalBox
- **Label**: Vertical Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ⇔ HorizontalBox
- **Label**: Horizontal Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ⊞ GridPanel
- **Label**: Grid Panel
- **Is Container Panel**: Yes
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"columnsCount"`: `2`
  - `"rowsCount"`: `2`

### ⊟ UniformGridPanel
- **Label**: Uniform Grid
- **Is Container Panel**: Yes
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"columnsCount"`: `3`
  - `"rowsCount"`: `3`

### ↕ ScrollBox
- **Label**: Scroll Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ↩ WrapBox
- **Label**: Wrap Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: No

### ▢ Border
- **Label**: Border
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)
- **Default Styles (`"style": { ... }`)**:
  - `"backgroundColor"`: `#0c0f16eb`
  - `"borderColor"`: `#ffffff0f`
  - `"borderRadius"`: `8`
  - `"borderWidth"`: `1`

### ⤡ SizeBox
- **Label**: Size Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)
- **Default Properties (`"properties": { ... }`)**:
  - `"minDesiredWidth"`: `0`
  - `"minDesiredHeight"`: `0`
  - `"maxDesiredWidth"`: `0`
  - `"maxDesiredHeight"`: `0`

### ⤢ ScaleBox
- **Label**: Scale Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)

### ◫ BackgroundBlur
- **Label**: Background Blur
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)
- **Default Properties (`"properties": { ... }`)**:
  - `"blurStrength"`: `10`

### ⬚ RetainerBox
- **Label**: Retainer Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)

### ◈ NamedSlot
- **Label**: Named Slot
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)
- **Default Properties (`"properties": { ... }`)**:
  - `"slotName"`: `Default`

### ⚡ InvalidationBox
- **Label**: Invalidation Box
- **Is Container Panel**: Yes
- **Enforces Single Child**: Yes (Can only hold a single child layout)

### ⬜ Button
- **Label**: Button
- **Is Container Panel**: Yes
- **Enforces Single Child**: No
- **Default Styles (`"style": { ... }`)**:
  - `"backgroundColor"`: `#2c1905f5`
  - `"hoverColor"`: `#382208f5`
  - `"pressedColor"`: `#1a0e02f5`
  - `"borderColor"`: `#f28c1a80`
  - `"borderRadius"`: `7`
  - `"borderWidth"`: `1`
  - `"padding"`: `[14, 20, 14, 20]`
- **Default Properties (`"properties": { ... }`)**:
  - `"text"`: `Button`

### T Text
- **Label**: Text
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"text"`: `Text`
  - `"color"`: `#faf5ebff`
  - `"font"`: `{ size: 14`
  - `"weight"`: `Regular`

### Ŧ RichText
- **Label**: Rich Text
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"text"`: `Rich Text`
  - `"color"`: `#faf5ebff`
  - `"font"`: `{ size: 14`
  - `"weight"`: `Regular`

### 🖼 Image
- **Label**: Image
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Styles (`"style": { ... }`)**:
  - `"tint"`: `#ffffffff`

### ▭ TextInput
- **Label**: Text Input
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"hintText"`: `Enter text...`
  - `"color"`: `#888888ff`
  - `"font"`: `{ size: 12`
  - `"weight"`: `Regular`

### ▬ ProgressBar
- **Label**: Progress Bar
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"percent"`: `0.5`
  - `"fillColor"`: `#f28c1aff`

### ⊟ Slider
- **Label**: Slider
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"value"`: `0.5`
  - `"minValue"`: `0`
  - `"maxValue"`: `1`
  - `"stepSize"`: `0.01`

### ☑ CheckBox
- **Label**: Check Box
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"isChecked"`: `false`
  - `"label"`: `CheckBox`

### 🔢 SpinBox
- **Label**: Spin Box
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"value"`: `0`
  - `"minValue"`: `0`
  - `"maxValue"`: `100`
  - `"delta"`: `1`

### ▾ ComboBox
- **Label**: Combo Box
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"options"`: `[Option 1`
  - `"selectedIndex"`: `0`

### ↔ Spacer
- **Label**: Spacer
- **Is Container Panel**: No
- **Enforces Single Child**: No
- **Default Properties (`"properties": { ... }`)**:
  - `"size"`: `20`

### ⟳ Throbber
- **Label**: Throbber
- **Is Container Panel**: No
- **Enforces Single Child**: No

### ◌ CircularThrobber
- **Label**: Circular Throbber
- **Is Container Panel**: No
- **Enforces Single Child**: No


---

## 3. Slot Positioning & Alignment Rules

Layout parameters must be defined inside the widget's `"slot"` block depending on what the **parent** widget container is.

### A. Inside a CanvasPanel Parent
When a widget is a direct child of a `CanvasPanel`, the slot contains absolute coordinates:
- `position`: `{ "x": number, "y": number }`
- `size`: `{ "x": number, "y": number }`
- `anchors`: `{ "min": [number, number], "max": [number, number] }`
  - *Example*: `{ "min": [0.5, 0.5], "max": [0.5, 0.5] }` anchors the widget to the center of the viewport.

### B. Inside a VerticalBox or HorizontalBox Parent
When a widget is inside a flow box, it aligns automatically:
- `sizeRule`: `"Auto"` (fit to content size) or `"Fill"` (occupy available space).
- `fillWeight`: `number` (ratio of space distribution, only applicable when `sizeRule` is `"Fill"`).
- `horizontalAlignment`: `"Fill" | "Left" | "Center" | "Right"`
- `verticalAlignment`: `"Fill" | "Top" | "Center" | "Bottom"`
- `padding`: `[Top, Right, Bottom, Left]` (e.g. `[10, 0, 10, 0]`).

### C. Inside a GridPanel or UniformGridPanel Parent
When a widget is inside a grid, it locks to grid coordinates:
- `row`: `number` (index starting from 0).
- `column`: `number` (index starting from 0).
- `horizontalAlignment`: `"Fill" | "Left" | "Center" | "Right"`
- `verticalAlignment`: `"Fill" | "Top" | "Center" | "Bottom"`

---

## 4. Universal Styling Parameters

The following parameters belong strictly inside the `"style"` block of any widget:

| Style Property | Value Type | Description / Usage |
| :--- | :--- | :--- |
| `backgroundColor` | Hex String (`#RRGGBBAA`) | Background brush tint. Used on Border, Buttons, Panels. |
| `borderColor` | Hex String (`#RRGGBBAA`) | Outer border line tint. |
| `borderWidth` | `number` | Outline thickness. |
| `borderRadius` | `number` | Corner rounding radius. |
| `padding` | `[Top, Right, Bottom, Left]` | Inner content padding. |
| `opacity` | `number` (0.0 to 1.0) | Global transparency of the widget. |
| `visibility` | `"Visible" | "Hidden" | "Collapsed"` | Controls rendering and hit-testing behavior. |
| `tint` | Hex String (`#RRGGBBAA`) | Image texture overlay tint. |
| `glowColor` | Hex String (`#RRGGBBAA`) | Shadow or outer neon glow tint. |
| `glowStrength` | `number` | Shadow blur spread radius. |
| `gradient` | Gradient Object | Linear or radial background blend configuration. |
| `animation` | Animation Object | Continuous CSS-based feedback loops (`fade`, `pulse`, `bounce`). |
