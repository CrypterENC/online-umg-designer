'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <P>UMG Designer is a browser-based layout tool for building Unreal Engine Widget Blueprints. You design visually, export a <Code>.umgbridge.json</Code> file, and the UMG Bridge plugin reconstructs the widget tree inside the Unreal Editor — no manual Blueprint wiring needed.</P>
        <P>The designer mirrors UMG's widget model exactly: the same panel types, slot properties, and content properties you set here map 1-to-1 to Unreal's widget classes.</P>
      </>
    ),
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <>
        <Steps items={[
          { n: '01', title: 'Add a root panel', desc: 'Drag CanvasPanel from the palette onto the canvas, or click it. Every layout needs a root.' },
          { n: '02', title: 'Add children', desc: 'Select the CanvasPanel, then click any widget in the palette to add it as a child. CanvasPanel children are placed absolutely — drag or use Pos X/Y in Properties.' },
          { n: '03', title: 'Style your widgets', desc: 'Select a widget and use the Style section in Properties to set background color, gradient, border, radius, padding, and opacity. Use the Animation section to add a preview animation.' },
          { n: '04', title: 'Name everything', desc: 'Click the widget name at the top of Properties to rename it. Good names make the Blueprint tree readable in Unreal.' },
          { n: '05', title: 'Export', desc: 'Click Export JSON in the toolbar. Drop the .umgbridge.json file into your Unreal project\'s Content folder, then use the UMG Bridge import panel.' },
        ]} />
      </>
    ),
  },
  {
    id: 'canvas',
    title: 'Canvas & Navigation',
    content: (
      <>
        <P>The canvas is a virtual 8000×8000px world. The white frame in the center is your widget at the chosen resolution.</P>
        <KbTable rows={[
          ['Scroll wheel',         'Zoom in / out'],
          ['Space + drag',         'Pan canvas'],
          ['H key',                'Switch to Pan tool'],
          ['V key',                'Switch to Select tool'],
          ['Fit button',           'Fit canvas to window'],
          ['Zoom dropdown',        'Jump to a specific zoom level'],
          ['Resize handles',       'Drag the 8 handles around a selected CanvasPanel child to resize it'],
        ]} />
        <Note>Hold <Code>Shift</Code> while dragging to temporarily disable snapping for free-form positioning.</Note>
      </>
    ),
  },
  {
    id: 'snapping',
    title: 'Snapping',
    content: (
      <>
        <P>Snapping is always active when dragging CanvasPanel children. Three levels fire in priority order:</P>
        <KbTable rows={[
          ['Widget edge → sibling edge',   'Aligns your widget\'s left/right/top/bottom to any sibling\'s edges (threshold: 10px)'],
          ['Widget center → sibling center', 'Snaps your widget\'s center axis to a sibling\'s center axis'],
          ['Canvas edges / center',         'Snaps to canvas left, right, top, bottom, and center axes'],
          ['Grid (8 px)',                   'Baseline — always active, overridden by the above when closer'],
        ]} />
        <P>Orange guide lines appear on the canvas frame when a non-grid snap fires. They disappear on mouse release.</P>
        <Note>Hold <Code>Shift</Code> while dragging to disable all snapping.</Note>
      </>
    ),
  },
  {
    id: 'widget-palette',
    title: 'Widget Palette',
    content: (
      <>
        <P>The palette is grouped into four categories. Use the filter box at the top to search by name. You can drag a widget directly onto the canvas or onto another widget in the canvas — or click to add it to the currently selected panel.</P>
        <Group title="Panels" items={[
          ['CanvasPanel',      'Root container for absolutely-positioned children. Required as the layout root.'],
          ['Border',           'Single-child container with a configurable background brush and border. Use this instead of VerticalBox/HorizontalBox when you need a colored background.'],
          ['VerticalBox',      'Stacks children vertically. No background — layout only.'],
          ['HorizontalBox',    'Stacks children horizontally. No background — layout only.'],
          ['Overlay',          'Layers children on top of each other (CSS grid).'],
          ['ScrollBox',        'Vertically scrollable container.'],
          ['GridPanel',        'Fixed-column grid. Set Columns and Rows in Properties.'],
          ['UniformGridPanel', 'Equal-cell grid.'],
          ['WrapBox',          'Wraps children to the next row when they overflow.'],
          ['SizeBox',          'Constrains its child to a min/max width and height.'],
          ['ScaleBox',         'Scales its child to fit the available space.'],
          ['BackgroundBlur',   'Applies a blur to whatever is behind it. Set Blur Strength in Properties.'],
          ['InvalidationBox',  'Performance hint — caches its subtree until invalidated.'],
          ['RetainerBox',      'Renders its child to a render target for material effects.'],
          ['NamedSlot',        'Exposes a slot for use in Widget Blueprints that extend this one.'],
        ]} />
        <Group title="Common" items={[
          ['Button',     'Clickable button with Normal / Hovered / Pressed color states. Set text in the Content section. Colors export to properties so UMG Bridge applies them.'],
          ['Text',       'TextBlock. Set text, color, font size, weight, letter spacing, and justification.'],
          ['RichText',   'RichTextBlock with the same properties as Text.'],
          ['Image',      'Image widget. Set a source URL in Properties (Unreal uses texture paths).'],
          ['TextInput',  'EditableTextBox with hint text and font properties.'],
          ['Spacer',     'Invisible spacer with configurable size.'],
        ]} />
        <Group title="Input" items={[
          ['CheckBox',  'Toggle. Shows a check mark when checked. Set the label in Properties.'],
          ['Slider',    'Horizontal slider with min, max, and step.'],
          ['SpinBox',   'Numeric spin box with min, max, and delta.'],
          ['ComboBox',  'Dropdown. Set Options as a comma-separated list.'],
        ]} />
        <Group title="Misc" items={[
          ['ProgressBar',       'Horizontal fill bar. Set Percent (0–1) and Fill Color.'],
          ['Throbber',          'Animated loading indicator.'],
          ['CircularThrobber',  'Circular animated loading indicator.'],
        ]} />
      </>
    ),
  },
  {
    id: 'widget-patterns',
    title: 'Widget Patterns',
    subsections: [
      { id: 'pat-canvaspanel',  title: 'CanvasPanel' },
      { id: 'pat-border',       title: 'Border' },
      { id: 'pat-verticalbox',  title: 'VerticalBox' },
      { id: 'pat-spacing',      title: 'Spacing in VBox' },
      { id: 'pat-horizontalbox',title: 'HorizontalBox' },
      { id: 'pat-button',       title: 'Button' },
      { id: 'pat-overlay',      title: 'Overlay' },
      { id: 'pat-scrollbox',    title: 'ScrollBox' },
      { id: 'pat-backgroundblur','title': 'BackgroundBlur' },
      { id: 'pat-sizebox',      title: 'SizeBox' },
      { id: 'pat-gridpanel',    title: 'GridPanel' },
      { id: 'pat-wrapbox',      title: 'WrapBox' },
    ],
    content: (
      <>
        <P>Correct nesting is the most common source of "my background isn't showing" or "my layout broke" issues. Each widget below shows the right hierarchy and flags the wrong one.</P>

        <SubHeading id="pat-canvaspanel">CanvasPanel</SubHeading>
        <P>Root of every layout. Children are absolutely positioned. Has no background in UMG — add a full-size Border as the first child for a background.</P>
        <Tree lines={[
          'CanvasPanel',
          '  ├── Border        ← full-size background (first child)',
          '  ├── Text          ← title',
          '  └── VerticalBox   ← button list',
        ]} />

        <SubHeading id="pat-border">Border</SubHeading>
        <P>The only panel widget with a real background color and gradient in UMG. Accepts exactly one child — use a VerticalBox or HorizontalBox inside if you need multiple children.</P>
        <Tree lines={[
          '✓  Border  (background color / gradient)',
          '     └── VerticalBox',
          '           ├── Btn_Host',
          '           └── Btn_Quit',
          '',
          '✗  VerticalBox',
          '     ├── Border   ← stacks as a row, not a background',
          '     └── Btn_Host',
        ]} />

        <SubHeading id="pat-verticalbox">VerticalBox</SubHeading>
        <P>Stacks children top-to-bottom. Layout only — always transparent in UMG. Wrap in a Border for a colored background.</P>
        <Tree lines={[
          '✓  Border',
          '     └── VerticalBox',
          '           ├── Button',
          '           └── Button',
          '',
          '✗  VerticalBox',
          '     ├── Border   ← takes up a row, does not become a background',
          '     └── Button',
        ]} />

        <SubHeading id="pat-spacing">Spacing inside VerticalBox</SubHeading>
        <P>UMG does not have a dedicated spacer child for VerticalBox. Spacing between items is controlled three ways — use whichever matches your situation:</P>
        <KbTable rows={[
          ['Slot Margin',         'Select a child widget inside the VerticalBox. In Properties → Layout → Padding, set Top and Bottom values. This adds pixel gaps around that specific widget only. The standard method for per-item control.'],
          ['UniformGridPanel',    'Prefer this over VerticalBox when all items need identical spacing. It has built-in padding that applies to every cell automatically — no per-slot tuning needed.'],
          ['Border / CanvasPanel wrapper', 'Add a Border around the VerticalBox and set its Padding. This pushes all children away from the edges of the container, but does not create gaps between the widgets themselves.'],
          ['Spacer widget',       'The Spacer widget works inside VerticalBox but is best used for flexible empty space (Size Rule = Fill) rather than fixed gaps. Use Slot Margin for fixed pixel gaps.'],
        ]} />
        <Tree lines={[
          'VerticalBox',
          '  ├── Button    (Slot Padding: T8 B8 — adds 8px gap above and below)',
          '  ├── Button    (Slot Padding: T0 B8)',
          '  └── Spacer    (Size Rule: Fill — pushes remaining items to bottom)',
        ]} />
        <Note>Slot Padding in the designer maps to the Slot Margin in UMG. Set it in Properties → Layout → Padding for any VerticalBox or HorizontalBox child.</Note>

        <SubHeading id="pat-horizontalbox">HorizontalBox</SubHeading>
        <P>Same rules as VerticalBox but stacks left-to-right. Wrap in a Border for a background.</P>
        <Tree lines={[
          'Border',
          '  └── HorizontalBox',
          '        ├── Image',
          '        ├── Text',
          '        └── Button',
        ]} />

        <SubHeading id="pat-button">Button</SubHeading>
        <P>Has Normal / Hover / Pressed color states in Style. Set label text in the Content section — UMG Bridge auto-creates a Text child in UE. If you add a child manually, use one Text widget. For icon + text, use a HorizontalBox child.</P>
        <Tree lines={[
          '✓  Button  (Normal / Hover / Pressed colors in Style)',
          '     └── Text   ← or leave empty; UMG Bridge synthesizes it',
          '',
          '✓  Button  (icon + label)',
          '     └── HorizontalBox',
          '           ├── Image  ← icon',
          '           └── Text   ← label',
          '',
          '✗  Button',
          '     ├── Text',
          '     └── Text   ← two children breaks Button layout in UMG',
        ]} />

        <SubHeading id="pat-overlay">Overlay</SubHeading>
        <P>Layers all children at the same position. First child = back, last child = front. Use it to place text or a tint over an image.</P>
        <Tree lines={[
          'Overlay',
          '  ├── Image    ← back layer (background texture)',
          '  ├── Border   ← semi-transparent color tint',
          '  └── Text     ← front label',
        ]} />

        <SubHeading id="pat-scrollbox">ScrollBox</SubHeading>
        <P>Scrollable area — accepts one child. Wrap all scrollable items in a VerticalBox as the single child.</P>
        <Tree lines={[
          '✓  ScrollBox',
          '     └── VerticalBox',
          '           ├── Item 1',
          '           ├── Item 2',
          '           └── Item 3',
          '',
          '✗  ScrollBox',
          '     ├── Item 1   ← multiple direct children not supported',
          '     └── Item 2',
        ]} />

        <SubHeading id="pat-backgroundblur">BackgroundBlur</SubHeading>
        <P>Blurs everything rendered behind it. Place it above a background image in z-order (later in the child list = higher z), then put readable content inside it.</P>
        <Tree lines={[
          'CanvasPanel',
          '  ├── Image           ← background texture (behind blur)',
          '  └── BackgroundBlur  ← blurs Image behind it',
          '        └── VerticalBox',
          '              └── Text  ← readable on blurred background',
        ]} />

        <SubHeading id="pat-sizebox">SizeBox</SubHeading>
        <P>Constrains its child to a fixed width/height regardless of the parent flex layout. Use it when a button or image must be an exact size inside a VerticalBox or HorizontalBox.</P>
        <Tree lines={[
          'HorizontalBox',
          '  ├── SizeBox  (Width: 120, Height: 40)',
          '  │     └── Button',
          '  └── Text',
        ]} />

        <SubHeading id="pat-gridpanel">GridPanel / UniformGridPanel</SubHeading>
        <P>Lays children into rows and columns. Set Columns and Rows in Properties. Each child&apos;s Row and Column slot tells the grid where to place it.</P>
        <Tree lines={[
          'GridPanel  (Columns: 3, Rows: 2)',
          '  ├── Image  (row 0, col 0)',
          '  ├── Image  (row 0, col 1)',
          '  ├── Image  (row 0, col 2)',
          '  └── Text   (row 1, col 0)',
        ]} />

        <SubHeading id="pat-wrapbox">WrapBox</SubHeading>
        <P>Like a HorizontalBox but wraps children to the next row when they overflow the width. Good for tag lists or icon grids with a variable number of items.</P>
        <Tree lines={[
          'WrapBox',
          '  ├── Border (tag 1)',
          '  ├── Border (tag 2)',
          '  ├── Border (tag 3)  ← wraps to next row if no space',
          '  └── Border (tag 4)',
        ]} />
      </>
    ),
  },
  {
    id: 'widget-reference',
    title: 'Widget Reference',
    subsections: [
      { id: 'ref-text',       title: 'Text & RichText' },
      { id: 'ref-button',     title: 'Button' },
      { id: 'ref-image',      title: 'Image' },
      { id: 'ref-textinput',  title: 'TextInput' },
      { id: 'ref-spacer',     title: 'Spacer' },
      { id: 'ref-checkbox',   title: 'CheckBox' },
      { id: 'ref-slider',     title: 'Slider & SpinBox' },
      { id: 'ref-combobox',   title: 'ComboBox' },
      { id: 'ref-progressbar',title: 'ProgressBar' },
      { id: 'ref-throbber',   title: 'Throbbers' },
      { id: 'ref-sizescale',  title: 'SizeBox & ScaleBox' },
      { id: 'ref-blur',       title: 'BackgroundBlur' },
      { id: 'ref-misc',       title: 'InvalidationBox & Others' },
    ],
    content: (
      <>
        {/* ── Text & RichText ── */}
        <SubHeading id="ref-text">Text &amp; RichText</SubHeading>
        <P>Displays a string of text. RichText is identical but supports inline markup for mixed styles (bold, colored runs) via a Data Table asset in UE.</P>
        <KbTable rows={[
          ['Text',         'The string to display. Newlines are supported.'],
          ['Color',        'RGBA hex. Applies to the whole text block.'],
          ['Font Size',    'Pixel size. Maps to FSlateFontInfo.Size in UMG.'],
          ['Weight',       'Regular / Bold / Light / Thin — maps to EFontWeight.'],
          ['Letter Sp.',   'In em-thousandths (same unit as UMG LetterSpacing). 0 = normal.'],
          ['Justify',      'Left / Center / Right / Fill — text-align inside the widget bounds. Maps to ETextJustify.'],
        ]} />

        <SubHeading id="ref-text-align">Text Alignment — the two axes</SubHeading>
        <P>There are two independent alignment controls for a Text widget. Confusing them is the #1 alignment issue.</P>
        <KbTable rows={[
          ['Justify (Content section)',  'Aligns text INSIDE the widget\'s own box. "Center" centers the characters within whatever width the widget has. Only affects text rendering.'],
          ['H Align (Layout section)',   'Aligns the widget BOX itself inside its parent VerticalBox / HorizontalBox slot. "Center" with Size Rule Auto = the whole box is centered in the slot.'],
        ]} />
        <P>Common recipes:</P>
        <Tree lines={[
          '── Centered title in a VerticalBox ──',
          'Text  H Align: Center  Size Rule: Auto  Justify: Left',
          '      → widget box is centered; text fills it from the left edge',
          '',
          'Text  H Align: Fill    Size Rule: Fill  Justify: Center',
          '      → widget fills the full slot width; text is centered within it',
          '',
          '── Full-width centered heading in CanvasPanel ──',
          'Text  Pos X: 0  Width: 1920  Justify: Center',
          '      → spans the canvas; Justify centers the characters',
        ]} />
        <Note>In a CanvasPanel there is no H Align — position the widget with Pos X / Y and set Width. Use Justify to center text within that width.</Note>

        {/* ── Button ── */}
        <SubHeading id="ref-button">Button</SubHeading>
        <P>A clickable widget with three background color states. Wire <Code>OnClicked</Code> in UE Blueprint after import.</P>
        <KbTable rows={[
          ['Background (Style)',  'Color when the button is in its normal / idle state.'],
          ['Hover (Style)',       'Color when the mouse is over the button. Preview mode shows this on hover.'],
          ['Pressed (Style)',     'Color while the mouse button is held down. Preview mode shows this on press.'],
          ['Border Color',        'Outline color — same border for all three states.'],
          ['Text (Content)',      'Label string. UMG Bridge auto-creates a child Text widget for this.'],
          ['Color (Content)',     'Text color.'],
          ['Font Size / Weight',  'Same as Text widget font controls.'],
        ]} />
        <Note>Do not add more than one child to a Button. For icon + label, add a HorizontalBox child containing an Image and a Text.</Note>

        {/* ── Image ── */}
        <SubHeading id="ref-image">Image</SubHeading>
        <P>Displays a texture. In the designer the source URL is a preview hint only — UMG uses asset paths, not web URLs.</P>
        <KbTable rows={[
          ['Source URL',  'UTexture2D asset path in Unreal, e.g. /Game/UI/Icons/HealthIcon. Browser URLs will not resolve in UE.'],
          ['Tint',        'Color overlay multiplied over the texture. White (#ffffffff) = no tint. Use to recolor or darken.'],
        ]} />
        <Tree lines={[
          'Overlay',
          '  ├── Image  (source: /Game/UI/Backgrounds/MenuBG, tint: #ffffffff)',
          '  └── Image  (source: /Game/UI/Vignette,           tint: #00000088)',
        ]} />

        {/* ── TextInput ── */}
        <SubHeading id="ref-textinput">TextInput</SubHeading>
        <P>An editable single-line text field. Hook up <Code>OnTextChanged</Code> or <Code>OnTextCommitted</Code> in UE Blueprint.</P>
        <KbTable rows={[
          ['Hint Text',   'Placeholder shown when the field is empty.'],
          ['Color',       'Text color while typing.'],
          ['Font Size',   'Input text size in pixels.'],
          ['Background',  'Field background color (Style section).'],
          ['Border',      'Border color and width (Style section).'],
        ]} />

        {/* ── Spacer ── */}
        <SubHeading id="ref-spacer">Spacer</SubHeading>
        <P>An invisible widget used to push or distribute items in a VerticalBox or HorizontalBox.</P>
        <KbTable rows={[
          ['Size (Properties)',        'Fixed pixel size when Size Rule = Auto.'],
          ['Size Rule: Auto (Layout)', 'Takes exactly the pixel size set in Properties → Size.'],
          ['Size Rule: Fill (Layout)', 'Expands to fill remaining space after Auto children are sized. Multiple Fill spacers split the remaining space proportionally by Fill Weight.'],
        ]} />
        <Tree lines={[
          'VerticalBox',
          '  ├── Button  Btn_Play    (Size Rule: Auto)',
          '  ├── Spacer              (Size Rule: Fill) ← pushes Quit to bottom',
          '  └── Button  Btn_Quit    (Size Rule: Auto)',
        ]} />

        {/* ── CheckBox ── */}
        <SubHeading id="ref-checkbox">CheckBox</SubHeading>
        <P>A toggle that switches between checked and unchecked states. Wire <Code>OnCheckStateChanged</Code> in UE Blueprint.</P>
        <KbTable rows={[
          ['Label',       'Text displayed next to the checkbox.'],
          ['Is Checked',  'Initial checked state when the widget is created.'],
        ]} />

        {/* ── Slider & SpinBox ── */}
        <SubHeading id="ref-slider">Slider &amp; SpinBox</SubHeading>
        <P><strong>Slider</strong> — horizontal drag control. <strong>SpinBox</strong> — numeric input with increment/decrement arrows. Both wire value changes in Blueprint.</P>
        <KbTable rows={[
          ['Min Value',   'Minimum numeric value of the range.'],
          ['Max Value',   'Maximum numeric value of the range.'],
          ['Step Size',   'Slider: smallest increment per drag tick.'],
          ['Delta',       'SpinBox: amount added/subtracted per arrow click.'],
          ['Value',       'Initial value on widget creation.'],
        ]} />

        {/* ── ComboBox ── */}
        <SubHeading id="ref-combobox">ComboBox</SubHeading>
        <P>A dropdown selector. Wire <Code>OnSelectionChanged</Code> in Blueprint to react to user picks.</P>
        <KbTable rows={[
          ['Options',   'Comma-separated list of strings, e.g. Easy,Normal,Hard.'],
          ['Selected',  'Zero-based index of the default selected option.'],
        ]} />

        {/* ── ProgressBar ── */}
        <SubHeading id="ref-progressbar">ProgressBar</SubHeading>
        <P>A horizontal fill bar. Typically driven at runtime by binding Percent to a Blueprint variable.</P>
        <KbTable rows={[
          ['Percent',     '0.0 = empty, 1.0 = full. Set the design-time preview value here.'],
          ['Fill Color',  'Color of the filled portion (Properties section).'],
          ['Background',  'Color of the unfilled track (Style section → Background).'],
        ]} />
        <Tree lines={[
          'Border  (container with padding)',
          '  └── VerticalBox',
          '        ├── Text       "Health"',
          '        └── ProgressBar  Percent: 0.75  Fill Color: #22cc44ff',
        ]} />

        {/* ── Throbbers ── */}
        <SubHeading id="ref-throbber">Throbbers</SubHeading>
        <P><strong>Throbber</strong> — a row of animated dots that pulse in sequence. <strong>CircularThrobber</strong> — a spinning ring. Both animate automatically with no properties to configure beyond slot and style.</P>
        <P>Use inside a Border or Overlay to show a loading state. Hide them via <Code>Visibility: Collapsed</Code> when loading completes.</P>

        {/* ── SizeBox & ScaleBox ── */}
        <SubHeading id="ref-sizescale">SizeBox &amp; ScaleBox</SubHeading>
        <P><strong>SizeBox</strong> — constrains its child to explicit dimensions, overriding any flex sizing from the parent. <strong>ScaleBox</strong> — scales its child to fill the available space while preserving aspect ratio.</P>
        <KbTable rows={[
          ['SizeBox → Width Override',   'Forces child to this width in pixels.'],
          ['SizeBox → Height Override',  'Forces child to this height in pixels.'],
          ['ScaleBox',                   'No size properties — just place it and let it stretch its child to fit.'],
        ]} />
        <Tree lines={[
          'HorizontalBox',
          '  ├── SizeBox  (Width: 48, Height: 48)',
          '  │     └── Image  /Game/UI/Icons/Avatar',
          '  └── VerticalBox',
          '        ├── Text  "PlayerName"  (Size Rule: Auto)',
          '        └── Text  "Level 12"    (Size Rule: Auto)',
        ]} />

        {/* ── BackgroundBlur ── */}
        <SubHeading id="ref-blur">BackgroundBlur</SubHeading>
        <P>Applies a Gaussian blur to everything rendered behind this widget. Expensive on mobile — use sparingly.</P>
        <KbTable rows={[
          ['Blur Strength', '0 = no blur. 1–20 = subtle. 20–100 = heavy. Default 10.'],
        ]} />
        <Note>BackgroundBlur blurs pixels it sits ON TOP of, not its own children. Put readable content inside it — that content renders sharp over the blurred background.</Note>

        {/* ── Misc ── */}
        <SubHeading id="ref-misc">InvalidationBox, RetainerBox &amp; NamedSlot</SubHeading>
        <KbTable rows={[
          ['InvalidationBox',  'Performance hint — caches its subtree until explicitly invalidated. Use to wrap static HUD elements that never change at runtime.'],
          ['RetainerBox',      'Renders its child to a render target so you can apply a UMaterial for post-processing effects (e.g. scanlines, color grading). Set the Effect Material in UE after import.'],
          ['NamedSlot',        'Exposes a named slot in this widget so child blueprints can inject content. Only meaningful when this widget is extended by another Widget Blueprint. Renders as an empty placeholder at design time.'],
        ]} />
      </>
    ),
  },
  {
    id: 'properties',
    title: 'Properties Panel',
    subsections: [
      { id: 'props-layout',    title: 'Layout' },
      { id: 'props-style',     title: 'Style' },
      { id: 'props-animation', title: 'Animation' },
      { id: 'props-content',   title: 'Content' },
    ],
    content: (
      <>
        <P>Click any widget to select it. The right panel shows all editable properties, grouped into collapsible sections. Click a section header to collapse it.</P>

        <SubHeading id="props-layout">Layout</SubHeading>
        <P>What shows here depends on how the widget is positioned:</P>
        <KbTable rows={[
          ['CanvasPanel child',       'Pos X, Pos Y, Width, Height — absolute position in canvas space'],
          ['VerticalBox / HorizontalBox child', 'Size Rule (Auto / Fill), Fill Weight, H Align, V Align, Padding'],
          ['Root CanvasPanel',        'No layout section — the canvas size is set in the toolbar'],
        ]} />

        <SubHeading id="props-style">Style</SubHeading>
        <KbTable rows={[
          ['Background',      'Flat fill color of the widget (Border, Button, and all panel widgets)'],
          ['Hover / Pressed', 'Button state colors — exported to properties so UMG Bridge applies them'],
          ['Gradient',        'Linear or Radial gradient that overrides the flat Background. Choose Stop 1 / Stop 2 colors and Angle (linear only). Set to None to restore flat color.'],
          ['Border Color',    'Outline color'],
          ['Border W',        'Border width in pixels'],
          ['Radius',          'Corner radius in pixels'],
          ['Padding',         'Inner padding (T / R / B / L)'],
          ['Opacity',         '0 = invisible, 1 = fully opaque'],
          ['Visibility',      'Visible / Hidden (transparent, still takes space) / Collapsed (removed from layout)'],
        ]} />

        <SubHeading id="props-animation">Animation</SubHeading>
        <P>Every widget has a collapsible <strong>Animation</strong> section below Style. Animations only play in Preview mode — the canvas always shows the resting state.</P>
        <KbTable rows={[
          ['Type',       'None / Fade / Pulse / Slide Up / Slide Left / Scale / Bounce'],
          ['Duration s', 'Seconds per animation cycle'],
          ['Delay s',    'Seconds to wait before the animation starts playing'],
          ['Loop',       'Yes = repeat indefinitely. No = play once and stop.'],
        ]} />

        <SubHeading id="props-content">Content</SubHeading>
        <P>Shown for Text, RichText, Button, TextInput, and other content widgets.</P>
        <KbTable rows={[
          ['Text',        'The display string'],
          ['Color',       'Text color (hex + alpha)'],
          ['Font Size',   'In pixels'],
          ['Weight',      'Regular / Bold / Light / Thin'],
          ['Letter Sp.',  'Letter spacing in em-thousandths'],
          ['Justify',     'Text alignment within the widget — Left / Center / Right / Fill (Text and RichText only)'],
        ]} />

        <Note>H Align / V Align in Layout controls where the <em>widget</em> sits inside its parent flex container. Justify controls text alignment <em>inside</em> the widget.</Note>
      </>
    ),
  },
  {
    id: 'export',
    title: 'Export & UMG Bridge',
    content: (
      <>
        <P>Click <strong>Export JSON</strong> in the toolbar to download a <Code>.umgbridge.json</Code> file. Drop it anywhere inside your Unreal project's <Code>Content/</Code> folder, then open the UMG Bridge panel in the Unreal Editor and import it.</P>

        <SubHeading>What gets exported</SubHeading>
        <KbTable rows={[
          ['slot',          'Position, size, anchors (CanvasPanel children) or alignment/padding (flex children)'],
          ['style',         'Kept as-is for reference. Visual properties are also copied into properties so UMG Bridge can read them.'],
          ['properties',    'Widget-specific data: text, colors, font, border, radius, padding — everything UMG Bridge applies to the UMG widget.'],
          ['children',      'Full recursive subtree. Button nodes auto-synthesize a Text child if they have text but no children.'],
        ]} />

        <SubHeading>UMG Bridge color mapping</SubHeading>
        <KbTable rows={[
          ['Button → backgroundColor',  'Normal brush color'],
          ['Button → hoverColor',        'Hovered brush color'],
          ['Button → pressedColor',      'Pressed brush color'],
          ['Button → borderColor',       'Border tint'],
          ['Border → brushColor',        'Background brush color (brushColor, not backgroundColor)'],
          ['Text → justification',       'ETextJustify (Left / Center / Right / Fill)'],
        ]} />

        <SubHeading>Live Coding note</SubHeading>
        <P>If you see <Code>LNK2011: precompiled object not linked</Code> in the UE output log after editing the UMGBridge plugin source, this is a known Live Coding limitation. A full restart of the Unreal Editor resolves it — it is not a code error.</P>
      </>
    ),
  },
  {
    id: 'mcp-integration',
    title: 'MCP & Live AI Sync',
    content: (
      <>
        <P>UMG Designer includes a standard Model Context Protocol (MCP) server that lets AI assistants (like Claude) build layouts for you in real-time. It also provides a REST helper endpoint for quick script automation.</P>

        <SubHeading>1. Connecting your AI assistant</SubHeading>
        <P>Add the live Vercel designer's MCP endpoint to your global <Code>.mcp.json</Code> file:</P>
        <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', color: '#8b949e', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
{`{
  "mcpServers": {
    "umg-designer-live": {
      "type": "http",
      "url": "https://web-umg-designer.vercel.app/api/mcp"
    }
  }
}`}
        </pre>

        <SubHeading>2. How Live Bidirectional Sync works</SubHeading>
        <P>Keep the designer open in your browser while working with your AI assistant. As the AI calls tools, the workspace updates instantly:</P>
        <Steps items={[
          { n: '01', title: 'AI edits', desc: 'When the AI calls add_widget or clear_canvas, the browser polls the change and renders it within 1 second.' },
          { n: '02', title: 'Your edits', desc: 'When you move, style, or add widgets manually in the browser, changes are saved back to Vercel instantly.' },
          { n: '03', title: 'State feedback', desc: 'The AI sees your manual modifications when it calls list_widgets, ensuring you can design together.' },
        ]} />

        <SubHeading>3. Available MCP Tools</SubHeading>
        <KbTable rows={[
          ['add_widget',     'Parameters: type, name, properties?, style?, slot?, parentId?. Adds a widget to the tree.'],
          ['list_widgets',   'Lists all widgets and their properties currently on the canvas.'],
          ['clear_canvas',   'Resets the canvas tree to an empty state.'],
          ['export_design',  'Parameters: filename. Exports the design tree as .umgbridge.json.'],
        ]} />

        <SubHeading>4. REST Call Fallback</SubHeading>
        <P>If you do not want to configure a full MCP client, you can trigger layout updates with standard HTTP POST requests to <Code>/api/call</Code>:</P>
        <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', color: '#8b949e', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
{`curl -X POST https://web-umg-designer.vercel.app/api/call \\
  -H "Content-Type: application/json" \\
  -d '{"name": "add_widget", "arguments": {"type": "Button", "name": "Btn_Start"}}'`}
        </pre>
      </>
    ),
  },
  {
    id: 'gradients',
    title: 'Gradient Backgrounds',
    content: (
      <>
        <P>Border, Button, CanvasPanel, VerticalBox, HorizontalBox, and all other panel widgets can have a gradient background instead of a flat color. Find the <Code>Gradient</Code> row in the <strong>Style</strong> section of the Properties panel.</P>
        <Steps items={[
          { n: '1', title: 'Select a Border, Button, or any panel widget (CanvasPanel, VerticalBox, HorizontalBox, etc.).',         desc: '' },
          { n: '2', title: 'In Properties → Style → Gradient, choose Linear or Radial.',                                            desc: '' },
          { n: '3', title: 'Pick colors for Stop 1 and Stop 2 (each supports full RGBA alpha).',                                    desc: '' },
          { n: '4', title: 'For Linear gradients, set the Angle.',                                                                  desc: '0° = bottom-to-top, 90° = left-to-right, 180° = top-to-bottom.' },
        ]} />
        <Note>A gradient overrides the flat Background color. Set Gradient back to None to restore the flat color. Gradient data is exported in the <Code>style.gradient</Code> block of the JSON. Note: gradients on CanvasPanel, VerticalBox, and HorizontalBox are designer-preview only — UMG does not support backgrounds on those widgets. Use a <Code>Border</Code> child for a gradient background that UMG Bridge can apply.</Note>
        <SubHeading>Tips</SubHeading>
        <P>Use a transparent Stop 2 (<Code>#00000000</Code>) to fade a solid color into nothing — great for HUD overlays. Radial gradients ignore the angle and always radiate from center.</P>
      </>
    ),
  },
  {
    id: 'animations',
    title: 'Widget Animations',
    content: (
      <>
        <P>Every widget can have a preview animation applied to it. Animations are only visible in <strong>Preview mode</strong> (press <Code>P</Code> or click the Preview button) — the canvas always shows widgets in their resting state.</P>
        <Steps items={[
          { n: '1', title: 'Select any widget.',                                              desc: '' },
          { n: '2', title: 'In Properties → Animation → Type, choose an animation.',          desc: '' },
          { n: '3', title: 'Set Duration and Delay.',                                         desc: 'Duration is seconds per cycle. Delay is seconds before the animation starts.' },
          { n: '4', title: 'Toggle Loop to Yes for repeating or No to play once.',            desc: '' },
          { n: '5', title: 'Press P to open Preview and see the animation play live.',        desc: '' },
        ]} />
        <SubHeading>Available Animations</SubHeading>
        <KbTable rows={[
          ['Fade',       'Pulses opacity from 0 → 1 → 0, useful for blinking indicators.'],
          ['Pulse',      'Scales the widget up 6% and back — a gentle breathing effect.'],
          ['Slide Up',   'Slides in from 24 px below with a fade — good for pop-up panels.'],
          ['Slide Left', 'Slides in from 24 px to the right with a fade.'],
          ['Scale',      'Scales from 82% → 100% → 82% with opacity fade — dramatic entrance.'],
          ['Bounce',     'Translates the widget 12 px up and back — bouncing highlight.'],
        ]} />
        <Note>Animation properties are exported in the JSON <Code>style.animation</Code> block. UMG itself uses a Blueprint timeline animation system — these CSS animations are for preview only. Your UMG Bridge plugin can read the exported data to create matching UMG widget animations.</Note>
      </>
    ),
  },
  {
    id: 'limitations',
    title: 'Known Limitations',
    content: (
      <>
        <Limitation title="CanvasPanel, VerticalBox, and HorizontalBox have no background or gradient in UMG">
          These are layout-only containers in UMG — they are always transparent. Background color and gradient set on them in the designer are visible in the canvas and Preview mode only; UMG Bridge cannot apply them. To get a solid or gradient background that UMG renders, add a <Code>Border</Code> as a full-size child and style that instead.
        </Limitation>
        <Limitation title="Widget animations are designer preview only">
          The Animation section (Fade, Pulse, Slide Up, etc.) plays CSS keyframe animations in Preview mode to help you visualise motion. UMG's actual animation system is timeline-based and lives inside Widget Blueprint event graphs — the designer does not generate those. The exported <Code>style.animation</Code> block is available for custom UMG Bridge implementations to read and create matching UMG animations programmatically.
        </Limitation>
        <Limitation title="Image widget uses Unreal texture asset paths">
          The Source URL field maps to a <Code>UTexture2D</Code> asset path in Unreal (e.g. <Code>/Game/Textures/MyTex</Code>). Web URLs will not resolve in UE — you must reference a texture that exists in your project's Content browser.
        </Limitation>
        <Limitation title="NamedSlot only works in Widget Blueprint subclasses">
          NamedSlot is only meaningful when this widget is used as a parent Blueprint that other widgets extend. It renders as an empty slot at design time and in Preview mode.
        </Limitation>
      </>
    ),
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    content: (
      <>
        <KbTable rows={[
          ['V',               'Select tool'],
          ['H',               'Pan tool'],
          ['Space + drag',    'Temporary pan (any tool)'],
          ['Shift + drag',    'Disable snapping while dragging'],
          ['Ctrl + Z',        'Undo'],
          ['Ctrl + Y / Ctrl + Shift + Z', 'Redo'],
          ['Ctrl + D',        'Duplicate selected widget'],
          ['Delete / Backspace', 'Delete selected widget'],
          ['Scroll wheel',    'Zoom in / out on canvas'],
          ['P',               'Toggle Preview mode'],
          ['Esc',             'Close Preview'],
        ]} />
      </>
    ),
  },
]

// ── Prose components ──────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11,
      background: 'rgba(232,117,10,0.10)', color: '#e8750a',
      border: '1px solid rgba(232,117,10,0.20)', borderRadius: 3,
      padding: '1px 5px',
    }}>{children}</code>
  )
}

function SubHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#484f58', marginTop: 20, marginBottom: 8, scrollMarginTop: 72 }}>{children}</h3>
}

function Tree({ lines }: { lines: string[] }) {
  return (
    <pre style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#8b949e',
      background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6, padding: '12px 16px', marginBottom: 12,
      lineHeight: 1.9, overflowX: 'auto', whiteSpace: 'pre',
    }}>{lines.join('\n')}</pre>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, background: 'rgba(232,117,10,0.06)', border: '1px solid rgba(232,117,10,0.18)', borderRadius: 6, padding: '10px 14px', marginTop: 12 }}>
      <span style={{ color: '#e8750a', fontSize: 13, flexShrink: 0 }}>◆</span>
      <span style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{children}</span>
    </div>
  )
}

function KbTable({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
      {rows.map(([key, desc], i) => (
        <div key={i} style={{ display: 'flex', gap: 0, borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
          <div style={{ width: 200, flexShrink: 0, padding: '7px 12px', background: '#161b22', fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#e6edf3' }}>{key}</div>
          <div style={{ flex: 1, padding: '7px 12px', fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{desc}</div>
        </div>
      ))}
    </div>
  )
}

function Steps({ items }: { items: { n: string; title: string; desc: string }[] }) {
  return (
    <div>
      {items.map(s => (
        <div key={s.n} style={{ display: 'flex', gap: 14, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#e8750a', paddingTop: 2, flexShrink: 0, width: 22, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 3 }}>{s.title}</div>
            <P>{s.desc}</P>
          </div>
        </div>
      ))}
    </div>
  )
}

function Group({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <SubHeading>{title}</SubHeading>
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
        {items.map(([name, desc], i) => (
          <div key={i} style={{ display: 'flex', gap: 0, borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
            <div style={{ width: 160, flexShrink: 0, padding: '7px 12px', background: '#161b22', fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#e8750a' }}>{name}</div>
            <div style={{ flex: 1, padding: '7px 12px', fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Limitation({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16, padding: '14px 16px', background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

// ── Reveal wrapper (intersection observer fade-in) ───────────────────────────

function RevealSection({ id, last, children }: { id: string; last?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.04 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      style={{
        marginBottom: 56, paddingBottom: 40,
        borderBottom: last ? undefined : '1px solid rgba(255,255,255,0.06)',
        scrollMarginTop: 72,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: 'opacity 500ms ease, transform 500ms ease',
      }}
    >
      {children}
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // globals.css sets overflow:hidden on body (for the designer) — undo it for docs
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  // Parallax scroll tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy — highlight the deepest heading above the fold
  useEffect(() => {
    const ids: string[] = []
    SECTIONS.forEach(s => {
      ids.push(s.id)
      const subs = (s as { subsections?: { id: string }[] }).subsections
      subs?.forEach(sub => ids.push(sub.id))
    })
    const onScroll = () => {
      const threshold = 80 // px from top of viewport
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= threshold) {
          setActiveId(ids[i])
          return
        }
      }
      setActiveId(ids[0])
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroOffset = Math.min(scrollY * 0.45, 120)

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'var(--font-geist-sans)' }}>

      {/* ── Sticky header ───────────────────────────────────── */}
      <header style={{ height: 52, background: '#1e2229', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 10, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Designer</span>
        </Link>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>UMG Designer</span>
        <span style={{ fontSize: 13, color: '#484f58' }}>/</span>
        <span style={{ fontSize: 13, color: '#8b949e' }}>Documentation</span>

        <div style={{ flex: 1 }} />

        <nav style={{ display: 'flex', gap: 24, height: '100%', alignItems: 'center' }}>
          <Link 
            href="/docs" 
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#e8750a', 
              textDecoration: 'none',
              borderBottom: '2px solid #e8750a',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
          >
            General Guide
          </Link>
          <Link 
            href="/docs/blueprints" 
            style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            Blueprint Wiring
          </Link>
          <Link 
            href="/docs/custom-animation" 
            style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            Custom Animations
          </Link>
          <Link 
            href="/docs/custom-widgets" 
            style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            Custom Widgets
          </Link>
        </nav>
      </header>

      {/* ── Parallax hero ───────────────────────────────────── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>

        {/* Background gradient layer — moves at 0.45× scroll speed */}
        <div style={{
          position: 'absolute', inset: '-60px -60px',
          background: [
            'radial-gradient(ellipse 90% 70% at 65% 55%, rgba(232,117,10,0.13) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 90% at 15% 80%, rgba(77,158,245,0.06) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 85% 20%, rgba(232,117,10,0.05) 0%, transparent 55%)',
          ].join(', '),
          transform: `translateY(${heroOffset}px)`,
          willChange: 'transform',
        }} />

        {/* Floating ring — moves at 0.25× */}
        <div style={{
          position: 'absolute', top: 24, right: '12%',
          width: 140, height: 140, borderRadius: '50%',
          border: '1px solid rgba(232,117,10,0.10)',
          transform: `translateY(${scrollY * 0.25}px)`,
          willChange: 'transform',
        }} />

        {/* Floating square — moves at 0.15× and rotates */}
        <div style={{
          position: 'absolute', top: 56, right: '24%',
          width: 52, height: 52, borderRadius: 8,
          border: '1px solid rgba(232,117,10,0.08)',
          transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.04}deg)`,
          willChange: 'transform',
        }} />

        {/* Small dot — moves at 0.6× (fastest layer) */}
        <div style={{
          position: 'absolute', top: 100, right: '18%',
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(232,117,10,0.25)',
          transform: `translateY(${scrollY * 0.6}px)`,
          willChange: 'transform',
        }} />

        {/* Hero text — moves at 0.2× (slower than scroll = stays readable longer) */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 1100, margin: '0 auto', padding: '0 calc(200px + 24px + 32px) 0 24px',
          transform: `translateY(${scrollY * 0.2}px)`,
          willChange: 'transform',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e8750a', marginBottom: 10 }}>UMG Designer</div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#e6edf3', margin: 0, lineHeight: 1.15 }}>Documentation</h1>
          <p style={{ fontSize: 13, color: '#8b949e', marginTop: 10, marginBottom: 0 }}>Reference for every widget, property, export format, and keyboard shortcut.</p>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(transparent, #0d1117)' }} />
      </div>

      {/* ── Sidebar + content ───────────────────────────────── */}
      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Sidebar */}
        <nav style={{ width: 200, flexShrink: 0, paddingTop: 32, paddingRight: 32, position: 'sticky', top: 52, alignSelf: 'flex-start', height: 'calc(100vh - 52px)', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#484f58', marginBottom: 12 }}>On this page</div>
          {SECTIONS.map(s => {
            const subs = (s as { subsections?: { id: string; title: string }[] }).subsections
            const parentActive = activeId === s.id || (subs?.some(sub => sub.id === activeId) ?? false)
            return (
              <div key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: 'block', fontSize: 12, textDecoration: 'none',
                    padding: '5px 0 5px 10px',
                    borderLeft: `2px solid ${parentActive ? '#e8750a' : 'transparent'}`,
                    color: parentActive ? '#e6edf3' : '#8b949e',
                    transition: 'color 150ms, border-color 150ms',
                  }}
                  onMouseEnter={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#c9d1d9' }}
                  onMouseLeave={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
                >
                  {s.title}
                </a>
                {subs && (
                  <div style={{ paddingLeft: 10, borderLeft: '2px solid rgba(255,255,255,0.06)', marginLeft: 10, marginBottom: 2 }}>
                    {subs.map(sub => {
                      const subActive = activeId === sub.id
                      return (
                        <a
                          key={sub.id}
                          href={`#${sub.id}`}
                          style={{
                            display: 'block', fontSize: 11, textDecoration: 'none',
                            padding: '3px 0 3px 8px',
                            color: subActive ? '#e8750a' : '#484f58',
                            transition: 'color 150ms',
                          }}
                          onMouseEnter={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
                          onMouseLeave={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = '#484f58' }}
                        >
                          {sub.title}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, paddingTop: 32, paddingBottom: 80, paddingLeft: 40, minWidth: 0 }}>
          {SECTIONS.map((s, i) => (
            <RevealSection key={s.id} id={s.id} last={i === SECTIONS.length - 1}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>{s.title}</h2>
              {s.content}
            </RevealSection>
          ))}
        </main>
      </div>
    </div>
  )
}
