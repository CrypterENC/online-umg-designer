'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'intro',
    title: 'Blueprint Wiring Overview',
    content: (
      <>
        <P>After importing your layout JSON via the UMG Bridge plugin, the Unreal Editor reconstructs your widget hierarchy exactly as designed. To bring this layout to life, you must wire up functionality in Unreal Engine's visual scripting language: <strong>Blueprints</strong>.</P>
        <P>All widgets that you named in the designer (e.g. <Code>Btn_Play</Code> or <Code>Bar_Health</Code>) are automatically created as standard UMG variables. By default, UMG Bridge marks named components as variables (<Code>Is Variable = True</Code>) so they are instantly accessible in the Blueprint Graph.</P>
      </>
    ),
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    content: (
      <>
        <P>Before writing logic, understand the three fundamental pillars of UMG Blueprint coding:</P>
        <KbTable rows={[
          ['Variables (Is Variable)', 'Only widgets with "Is Variable" checked in the UMG editor details panel (automatically done for named widgets by the bridge) can be referenced in the Graph. Static background borders or decorative text won\'t clutter your variable list.'],
          ['Event Binding', 'UI is event-driven. Instead of polling every frame, widgets fire events (like OnClicked or OnTextChanged) when user interactions occur. You bind actions to these events in the Event Graph.'],
          ['State Separation', 'Never store game state (like current player health or ammo) inside the UI widgets. Keep your variables on the Character, PlayerState, or GameState, and write logic to push or bind those values to the UI.'],
        ]} />
        <Note>For safety and clean code, always validate references to characters or game state using <Code>Is Valid</Code> nodes before updating UI components.</Note>
      </>
    ),
  },
  {
    id: 'components-wiring',
    title: 'Component Reference',
    subsections: [
      { id: 'wire-button',      title: 'Button' },
      { id: 'wire-text',        title: 'Text & RichText' },
      { id: 'wire-textinput',   title: 'TextInput' },
      { id: 'wire-progressbar', title: 'ProgressBar' },
      { id: 'wire-checkbox',    title: 'CheckBox' },
      { id: 'wire-slider',      title: 'Slider & SpinBox' },
      { id: 'wire-combobox',    title: 'ComboBox' },
    ],
    content: (
      <>
        <P>Here is how to wire each designer widget to its corresponding Blueprint nodes. Drag any widget variable from the left side of your Graph tab to get started.</P>

        {/* ── Button ── */}
        <SubHeading id="wire-button">Button</SubHeading>
        <P>Fires when clicked. This is the most common widget event.</P>
        
        <BpGraph>
          <BpNode 
            title="Event On Clicked" 
            subtitle="Btn_Play"
            category="event"
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          <BpNode 
            title="Open Level by Name" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Level Name', type: 'string' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        <P style={{ fontSize: 11, fontStyle: 'italic', marginTop: -4, color: '#6272a4' }}>
          Visual wiring: Event On Clicked fires and triggers the Open Level by Name function execution.
        </P>

        {/* ── Text ── */}
        <SubHeading id="wire-text">Text &amp; RichText</SubHeading>
        <P>Use the <Code>SetText (Text)</Code> node to update text dynamically at runtime.</P>

        <BpGraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BpNode 
              title="Custom Event" 
              subtitle="Update Score"
              category="event"
              outputs={[{ name: 'Then', type: 'exec' }]}
              width={180}
            />
            <BpNode 
              title="Txt_Score" 
              category="variable"
              outputs={[{ name: 'Txt_Score', type: 'object' }]}
              width={180}
            />
          </div>
          <BpConnector 
            height={160} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 130, toY: 66, type: 'object' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Set Text (Text)" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Text', type: 'text' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        <Note>Avoid using tick-based bindings (binding a function directly to the Text property) as they execute every frame. Instead, use events to update the text only when the value changes (e.g., when the player scores).</Note>

        {/* ── TextInput ── */}
        <SubHeading id="wire-textinput">TextInput (Editable Text Box)</SubHeading>
        <P>Reads user input. Wire either the <Code>On Text Changed</Code> event (fires on every keypress) or the <Code>On Text Committed</Code> event (fires when the user presses Enter or clicks away).</P>
        
        <BpGraph>
          <BpNode 
            title="Event On Text Committed" 
            subtitle="TextInput_PlayerName"
            category="event"
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Text', type: 'text' },
              { name: 'Commit Method', type: 'integer' }
            ]}
            width={240}
          />
          <BpConnector 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 66, toY: 66, type: 'text' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Set PlayerName" 
            category="setter"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Player Name', type: 'string' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        {/* ── ProgressBar ── */}
        <SubHeading id="wire-progressbar">ProgressBar</SubHeading>
        <P>Displays percentages from 0.0 to 1.0 (empty to full). You must divide current values by max values to get this ratio.</P>
        
        <BpGraph>
          {/* Column 1: Event & Variables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BpNode 
              title="Custom Event" 
              subtitle="Update Health"
              category="event"
              outputs={[{ name: 'Then', type: 'exec' }]}
              width={180}
            />
            <BpNode 
              title="Get CurrentHealth" 
              category="variable"
              outputs={[{ name: 'CurrentHealth', type: 'float' }]}
              width={180}
            />
            <BpNode 
              title="Get MaxHealth" 
              category="variable"
              outputs={[{ name: 'MaxHealth', type: 'float' }]}
              width={180}
            />
          </div>
          
          <BpConnector 
            height={200} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 110, toY: 110, type: 'float' },
              { fromY: 174, toY: 130, type: 'float' }
            ]} 
            width={60} 
          />
          
          {/* Column 2: Math & Target */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 64 }}>
            <BpNode 
              title="f / f (Divide)" 
              category="pure"
              inputs={[
                { name: 'A', type: 'float' },
                { name: 'B', type: 'float' }
              ]}
              outputs={[{ name: 'Return Value', type: 'float' }]}
              width={140}
            />
            <BpNode 
              title="Bar_Health" 
              category="variable"
              outputs={[{ name: 'Bar_Health', type: 'object' }]}
              width={140}
            />
          </div>
          
          <BpConnector 
            height={200} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 110, toY: 86, type: 'float' },
              { fromY: 174, toY: 66, type: 'object' }
            ]} 
            width={60} 
          />
          
          {/* Column 3: Set Percent */}
          <BpNode 
            title="Set Percent" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Percent', type: 'float' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
        </BpGraph>

        {/* ── CheckBox ── */}
        <SubHeading id="wire-checkbox">CheckBox</SubHeading>
        <P>Fires when toggled. Returns a boolean value (<Code>True</Code> for Checked, <Code>False</Code> for Unchecked).</P>
        
        <BpGraph>
          <BpNode 
            title="Event On Check State Changed" 
            subtitle="CheckBox_Mute"
            category="event"
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Is Checked', type: 'bool' }
            ]}
            width={240}
          />
          <BpConnector 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 66, toY: 66, type: 'bool' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Branch" 
            category="pure"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Condition', type: 'bool' }
            ]}
            outputs={[
              { name: 'True', type: 'exec' },
              { name: 'False', type: 'exec' }
            ]}
            width={140}
          />
        </BpGraph>

        {/* ── Slider & SpinBox ── */}
        <SubHeading id="wire-slider">Slider &amp; SpinBox</SubHeading>
        <P>Fires when the handle is dragged. Returns a float value.</P>
        
        <BpGraph>
          <BpNode 
            title="Event On Value Changed" 
            subtitle="Slider_Volume"
            category="event"
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Value', type: 'float' }
            ]}
            width={220}
          />
          <BpConnector 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 66, toY: 66, type: 'float' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Set Sound Volume" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Volume', type: 'float' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        {/* ── ComboBox ── */}
        <SubHeading id="wire-combobox">ComboBox</SubHeading>
        <P>Fires when the selected option changes. Returns the selected option text and index.</P>
        
        <BpGraph>
          <BpNode 
            title="Event On Selection Changed" 
            subtitle="ComboBox_Quality"
            category="event"
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Selected Item', type: 'string' }
            ]}
            width={240}
          />
          <BpConnector 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 66, toY: 66, type: 'string' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Switch on String" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Selection', type: 'string' }
            ]}
            outputs={[
              { name: 'Low', type: 'exec' },
              { name: 'Medium', type: 'exec' },
              { name: 'High', type: 'exec' }
            ]}
            width={180}
          />
        </BpGraph>
      </>
    ),
  },
  {
    id: 'main-menu-tutorial',
    title: 'Tutorial: Wiring a Main Menu',
    content: (
      <>
        <P>This walk-through demonstrates how to build and wire a standard Main Menu with three buttons: Play Game, Settings Panel, and Quit Game.</P>
        
        <SubHeading>Step 1: Widget Hierarchy in UMG Designer</SubHeading>
        <P>Create a layout resembling this structure. Ensure you name your buttons and panels so they export as variables:</P>
        <Tree lines={[
          'CanvasPanel',
          '  ├── Border  (Background tint)',
          '  ├── VerticalBox  (Centered Menu Container)',
          '  │     ├── Text  "Game Title"',
          '  │     ├── Button  "Btn_Play" (Text child: "Play")',
          '  │     ├── Button  "Btn_Settings" (Text child: "Settings")',
          '  │     └── Button  "Btn_Quit" (Text child: "Quit")',
          '  └── Border  "Panel_Settings" (Initial Visibility: Collapsed / Hidden)',
          '        └── VerticalBox (Settings contents & Close Button "Btn_CloseSettings")'
        ]} />

        <SubHeading>Step 2: Constructing &amp; Showing the Widget</SubHeading>
        <P>To display this menu when starting your level, add these nodes to your <strong>Level Blueprint</strong> or <strong>Custom Game Mode</strong>'s <Code>BeginPlay</Code> event:</P>
        <Steps items={[
          { n: '01', title: 'Create Widget', desc: 'Add a "Create Widget" node. Select your imported Main Menu widget class. Connect it to the "Get Player Controller" return value.' },
          { n: '02', title: 'Add to Viewport', desc: 'Drag out from the "Return Value" pin of the Create Widget node and call "Add to Viewport". This renders the UI on top of the screen.' },
          { n: '03', title: 'Set Input Mode UI Only', desc: 'Call "Set Input Mode UI Only". Pass your Player Controller and the widget reference to ensure keyboard/gamepad focus stays in the menu.' },
          { n: '04', title: 'Show Mouse Cursor', desc: 'Get Player Controller, drag out, search for "Set Show Mouse Cursor", check the box (Set to True) so the player has a cursor to click buttons.' },
        ]} />
        
        <BpGraph>
          <BpNode 
            title="Event BeginPlay" 
            category="event"
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={160}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          
          <BpNode 
            title="Create Widget" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Class', type: 'class' }
            ]}
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Return Value', type: 'object' }
            ]}
            width={200}
          />
          <BpConnector paths={[
            { fromY: 46, toY: 46, type: 'exec' },
            { fromY: 66, toY: 66, type: 'object' }
          ]} />
          
          <BpNode 
            title="Add to Viewport" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          
          <BpNode 
            title="Set Input Mode UI Only" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Widget to Focus', type: 'object' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={220}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          
          <BpNode 
            title="Set Show Mouse Cursor" 
            category="setter"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'Show Mouse Cursor', type: 'bool' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        <SubHeading>Step 3: Wiring Buttons inside the Widget Event Graph</SubHeading>
        <P>Open the imported Widget Blueprint event graph and set up the button click reactions:</P>
        
        <SubHeading>Play Button Logic</SubHeading>
        <BpGraph>
          <BpNode 
            title="Event On Clicked" 
            subtitle="Btn_Play"
            category="event"
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          <BpNode 
            title="Remove From Parent" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          <BpNode 
            title="Open Level by Name" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Level Name', type: 'string' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        <SubHeading>Quit Button Logic</SubHeading>
        <BpGraph>
          <BpNode 
            title="Event On Clicked" 
            subtitle="Btn_Quit"
            category="event"
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          <BpNode 
            title="Quit Game" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Player Controller', type: 'object' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
        </BpGraph>

        <SubHeading>Open Settings Panel</SubHeading>
        <BpGraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BpNode 
              title="Event On Clicked" 
              subtitle="Btn_Settings"
              category="event"
              outputs={[{ name: 'Then', type: 'exec' }]}
              width={180}
            />
            <BpNode 
              title="Panel_Settings" 
              category="variable"
              outputs={[{ name: 'Panel_Settings', type: 'object' }]}
              width={180}
            />
          </div>
          <BpConnector 
            height={160} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 130, toY: 66, type: 'object' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Set Visibility" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Visibility', type: 'integer' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>

        <SubHeading>Close Settings Panel</SubHeading>
        <BpGraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BpNode 
              title="Event On Clicked" 
              subtitle="Btn_CloseSettings"
              category="event"
              outputs={[{ name: 'Then', type: 'exec' }]}
              width={180}
            />
            <BpNode 
              title="Panel_Settings" 
              category="variable"
              outputs={[{ name: 'Panel_Settings', type: 'object' }]}
              width={180}
            />
          </div>
          <BpConnector 
            height={160} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 130, toY: 66, type: 'object' }
            ]} 
            width={80} 
          />
          <BpNode 
            title="Set Visibility" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Visibility', type: 'integer' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>
        
        <Note>Always call <Code>Remove From Parent</Code> or update the Input Mode before opening a game level, so the player regain controls of their character.</Note>
      </>
    ),
  },
  {
    id: 'hud-tutorial',
    title: 'Tutorial: Wiring a Player HUD',
    content: (
      <>
        <P>A Head-Up Display (HUD) overlays gameplay and updates constantly. Here is how to map player stats to your UI components efficiently using Event Dispatchers or custom update events.</P>
        
        <SubHeading>HUD Event-Driven Updates</SubHeading>
        <P>Instead of checking player health every tick, create an event inside your HUD widget that the Character Blueprint triggers whenever health changes.</P>
        
        <Steps items={[
          { n: '01', title: 'Create Update Event', desc: 'In your HUD Widget Blueprint, create a Custom Event called "UpdateHealth". Add a float input parameter called "NewHealthValue".' },
          { n: '02', title: 'Update Progress Bar', desc: 'Inside the update event, divide NewHealthValue by MaxHealth (e.g., 100.0) and connect the result to "Set Percent" on your health bar widget variable.' },
          { n: '03', title: 'Trigger from Character', desc: 'In your Character Blueprint, on the event "AnyDamage" or "Receive Healing", call the "UpdateHealth" event on your HUD widget reference.' },
        ]} />

        <SubHeading>HUD Widget Event Graph</SubHeading>
        <BpGraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BpNode 
              title="Custom Event" 
              subtitle="UpdateHealth"
              category="event"
              outputs={[
                { name: 'Then', type: 'exec' },
                { name: 'NewHealthValue', type: 'float' }
              ]}
              width={200}
            />
            <BpNode 
              title="Bar_Health" 
              category="variable"
              outputs={[{ name: 'Bar_Health', type: 'object' }]}
              width={200}
            />
          </div>
          
          <BpConnector 
            height={180} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 66, toY: 110, type: 'float' },
              { fromY: 142, toY: 66, type: 'object' }
            ]} 
            width={60} 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 64 }}>
            <BpNode 
              title="f / f (Divide)" 
              category="pure"
              inputs={[
                { name: 'A', type: 'float' },
                { name: 'B', type: 'float' }
              ]}
              outputs={[{ name: 'Return Value', type: 'float' }]}
              width={140}
            />
          </div>
          
          <BpConnector 
            height={180} 
            paths={[
              { fromY: 46, toY: 46, type: 'exec' },
              { fromY: 110, toY: 86, type: 'float' }
            ]} 
            width={60} 
          />
          
          <BpNode 
            title="Set Percent" 
            category="function"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'In Percent', type: 'float' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
        </BpGraph>

        <SubHeading>Character Blueprint (Taking Damage)</SubHeading>
        <BpGraph>
          <BpNode 
            title="Event AnyDamage" 
            category="event"
            outputs={[
              { name: 'Then', type: 'exec' },
              { name: 'Damage', type: 'float' },
              { name: 'Damage Type', type: 'object' },
              { name: 'Instigated By', type: 'object' },
              { name: 'Damage Causer', type: 'object' }
            ]}
            width={220}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          
          <BpNode 
            title="Update Health Value" 
            category="pure"
            subtitle="Character Health Logic"
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={180}
          />
          <BpConnector paths={[{ fromY: 46, toY: 46, type: 'exec' }]} />
          
          <BpNode 
            title="UpdateHealth" 
            category="function"
            subtitle="Call on HUD Widget"
            inputs={[
              { name: 'In', type: 'exec' },
              { name: 'Target', type: 'object' },
              { name: 'NewHealthValue', type: 'float' }
            ]}
            outputs={[{ name: 'Then', type: 'exec' }]}
            width={200}
          />
        </BpGraph>
      </>
    ),
  },
  {
    id: 'best-practices',
    title: 'Blueprint Best Practices',
    content: (
      <>
        <P>Maintain a clean and bug-free project by adhering to these guidelines:</P>
        <Limitation title="Keep UI and Gameplay Logic separated">
          Your widget should only handle UI logic (e.g., play button sounds, update text fields, open overlays). It should not calculate damage values, fetch database items, or run pathfinding. Delegate these tasks to the Player Controller, Character, or GameMode classes.
        </Limitation>
        <Limitation title="Avoid Bind Functions on variables">
          Unreal allows binding a function to properties like Text or Percent. These bind functions execute <strong>every frame</strong>, causing significant performance overhead. Use custom event-driven updates instead.
        </Limitation>
        <Limitation title="Use Event Dispatchers for generic messages">
          If your widget needs to trigger complex gameplay behavior, use <strong>Event Dispatchers</strong> (also known as Delegates). The widget calls the dispatcher when clicked, and other actors (like your GameMode) listen to it, preventing the widget from needing references to specific gameplay objects.
        </Limitation>
      </>
    ),
  },
]

// ── Blueprint Rendering Components ──────────────────────────────────────────

const PIN_COLORS = {
  exec: '#ffffff',
  bool: '#ea580c',
  float: '#a3e635',
  integer: '#10b981',
  string: '#ec4899',
  text: '#f472b6',
  object: '#38bdf8',
  class: '#a855f7',
}

interface Pin {
  name: string
  type: 'exec' | 'bool' | 'float' | 'string' | 'text' | 'object' | 'class' | 'integer'
  connected?: boolean
}

function PinIcon({ type, connected = true }: { type: Pin['type']; connected?: boolean }) {
  if (type === 'exec') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginRight: 6, flexShrink: 0 }}>
        <path
          d="M2 1 L10 6 L2 11 Z"
          fill={connected ? '#ffffff' : 'none'}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  
  return (
    <div style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: connected ? PIN_COLORS[type] : 'none',
      border: `1.5px solid ${PIN_COLORS[type]}`,
      marginRight: 6,
      marginLeft: 6,
      flexShrink: 0
    }} />
  )
}

interface BpNodeProps {
  title: string
  subtitle?: string
  category?: 'event' | 'function' | 'pure' | 'variable' | 'setter'
  inputs?: Pin[]
  outputs?: Pin[]
  width?: number
}

function BpNode({ title, subtitle, category = 'function', inputs = [], outputs = [], width = 220 }: BpNodeProps) {
  const getHeaderColor = () => {
    switch (category) {
      case 'event': return 'linear-gradient(90deg, #aa2424 0%, #731313 100%)'
      case 'setter': return 'linear-gradient(90deg, #1d3b73 0%, #112347 100%)'
      case 'variable': return 'linear-gradient(90deg, #1e4620 0%, #102611 100%)'
      case 'pure': return 'linear-gradient(90deg, #1f534e 0%, #102d2a 100%)'
      case 'function': 
      default:
        return 'linear-gradient(90deg, #1e5a7b 0%, #103449 100%)'
    }
  }

  return (
    <div style={{
      width,
      background: 'rgba(21, 26, 35, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 6,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      fontSize: 11,
      color: '#e2e8f0',
      fontFamily: 'var(--font-geist-mono)',
      userSelect: 'none',
      overflow: 'hidden',
      transition: 'transform 150ms, border-color 150ms',
    }}>
      {/* Header */}
      <div style={{
        background: getHeaderColor(),
        padding: '6px 10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: 11, letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {category === 'event' && <span style={{ color: '#f87171', marginRight: 4 }}>◆</span>}
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{subtitle}</div>}
      </div>

      {/* Pins Body */}
      <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {inputs.map((pin, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <PinIcon type={pin.type} connected={pin.connected} />
              <span style={{ color: pin.type === 'exec' ? '#ffffff' : '#94a3b8' }}>{pin.name}</span>
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, alignItems: 'flex-end' }}>
          {outputs.map((pin, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
              <span style={{ color: pin.type === 'exec' ? '#ffffff' : '#94a3b8', marginRight: 6 }}>{pin.name}</span>
              <div style={{ transform: 'rotate(180deg)', display: 'flex' }}>
                <PinIcon type={pin.type} connected={pin.connected} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BpGraph({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      background: '#0d1117',
      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)',
      backgroundSize: '16px 16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      padding: '24px 16px',
      overflowX: 'auto',
      marginBottom: 16,
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
      position: 'relative'
    }}>
      {children}
    </div>
  )
}

function BpConnector({ height = 90, width = 60, paths = [{ fromY: 46, toY: 46, type: 'exec' }] }: { height?: number; width?: number; paths?: { fromY: number; toY: number; type: Pin['type'] }[] }) {
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, margin: '0 -2px' }}>
      {paths.map((p, idx) => {
        const color = PIN_COLORS[p.type] || '#ffffff'
        const d = `M 0,${p.fromY} C ${width / 2},${p.fromY} ${width / 2},${p.toY} ${width},${p.toY}`
        return (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={p.type === 'exec' ? '2.5' : '1.5'}
          />
        )
      })}
    </svg>
  )
}

// ── Prose components ──────────────────────────────────────────────────────────

function P({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 12, ...style }}>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11,
      background: 'rgba(0,112,243,0.12)', color: '#38bdf8',
      border: '1px solid rgba(0,112,243,0.25)', borderRadius: 3,
      padding: '1px 5px',
    }}>{children}</code>
  )
}

function SubHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566275', marginTop: 24, marginBottom: 8, scrollMarginTop: 72 }}>{children}</h3>
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
    <div style={{ display: 'flex', gap: 10, background: 'rgba(0,112,243,0.06)', border: '1px solid rgba(0,112,243,0.18)', borderRadius: 6, padding: '10px 14px', marginTop: 12 }}>
      <span style={{ color: '#38bdf8', fontSize: 13, flexShrink: 0 }}>◆</span>
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
          <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', paddingTop: 2, flexShrink: 0, width: 22, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 3 }}>{s.title}</div>
            <P>{s.desc}</P>
          </div>
        </div>
      ))}
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

export default function BlueprintsDocsPage() {
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
            General Guide
          </Link>
          <Link 
            href="/docs/blueprints" 
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#38bdf8', 
              textDecoration: 'none',
              borderBottom: '2px solid #38bdf8',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
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
        </nav>
      </header>

      {/* ── Parallax hero ───────────────────────────────────── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>

        {/* Blueprint gradient layer — blue styling, moves at 0.45× scroll speed */}
        <div style={{
          position: 'absolute', inset: '-60px -60px',
          background: [
            'radial-gradient(ellipse 90% 70% at 65% 55%, rgba(0, 112, 243, 0.15) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 90% at 15% 80%, rgba(0, 180, 216, 0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 85% 20%, rgba(0, 112, 243, 0.06) 0%, transparent 55%)',
          ].join(', '),
          transform: `translateY(${heroOffset}px)`,
          willChange: 'transform',
        }} />

        {/* Blueprint-style layout grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
        }} />

        {/* Floating ring — moves at 0.25× */}
        <div style={{
          position: 'absolute', top: 24, right: '12%',
          width: 140, height: 140, borderRadius: '50%',
          border: '1px solid rgba(56, 189, 248, 0.10)',
          transform: `translateY(${scrollY * 0.25}px)`,
          willChange: 'transform',
        }} />

        {/* Floating square — moves at 0.15× and rotates */}
        <div style={{
          position: 'absolute', top: 56, right: '24%',
          width: 52, height: 52, borderRadius: 8,
          border: '1px solid rgba(56, 189, 248, 0.08)',
          transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.04}deg)`,
          willChange: 'transform',
        }} />

        {/* Small dot — moves at 0.6× (fastest layer) */}
        <div style={{
          position: 'absolute', top: 100, right: '18%',
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.25)',
          transform: `translateY(${scrollY * 0.6}px)`,
          willChange: 'transform',
        }} />

        {/* Hero text — moves at 0.2× */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 1100, margin: '0 auto', padding: '0 calc(200px + 24px + 32px) 0 24px',
          transform: `translateY(${scrollY * 0.2}px)`,
          willChange: 'transform',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#38bdf8', marginBottom: 10 }}>UMG Designer</div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#e6edf3', margin: 0, lineHeight: 1.15 }}>Blueprint Wiring</h1>
          <p style={{ fontSize: 13, color: '#8b949e', marginTop: 10, marginBottom: 0 }}>Learn how to bind variables, handle user input events, and construct menus inside Unreal Engine.</p>
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
                    borderLeft: `2px solid ${parentActive ? '#38bdf8' : 'transparent'}`,
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
                            color: subActive ? '#38bdf8' : '#484f58',
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
