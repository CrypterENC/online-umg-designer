import { WidgetNode } from './types'

export type ThemeColors = {
  background:    string  // darkest — root/canvas bg
  surface:       string  // panel bg (Border containers)
  accent:        string  // primary highlight
  buttonNormal:  string
  buttonHover:   string
  buttonPressed: string
  border:        string  // outline color (should have alpha)
  textPrimary:   string
  textSecondary: string
}

export type Theme = {
  id: string
  name: string
  preview: string[]  // 5 swatch colors for the card
  colors: ThemeColors
  hint: string       // one-line description
}

export const THEMES: Theme[] = [
  {
    id: 'dark-navy',
    name: 'Dark Navy',
    hint: 'Classic dark game UI — deep navy with electric blue accent',
    preview: ['#060a0fff', '#0c1420ef', '#4a9effff', '#1a2d4aef', '#e8f4ffff'],
    colors: {
      background:    '#060a0fff',
      surface:       '#0c1420ef',
      accent:        '#4a9effff',
      buttonNormal:  '#1a2d4aef',
      buttonHover:   '#2a4a7aef',
      buttonPressed: '#0f1e33ef',
      border:        '#1e3a5f99',
      textPrimary:   '#e8f4ffff',
      textSecondary: '#6b8fa8ff',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    hint: 'Neon cyan on near-black with hot-pink borders',
    preview: ['#080810ff', '#10101eff', '#00f5ffff', '#1a0a2eff', '#e0f0ffff'],
    colors: {
      background:    '#080810ff',
      surface:       '#10101eef',
      accent:        '#00f5ffff',
      buttonNormal:  '#1a0a2eef',
      buttonHover:   '#2a1048ef',
      buttonPressed: '#0d0518ef',
      border:        '#ff006e66',
      textPrimary:   '#e0f0ffff',
      textSecondary: '#00f5ff99',
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    hint: 'Luxury feel — near-black with gold accent and warm text',
    preview: ['#0a0805ff', '#14100aef', '#c9a227ff', '#1e1608ef', '#f5e6c8ff'],
    colors: {
      background:    '#0a0805ff',
      surface:       '#14100aef',
      accent:        '#c9a227ff',
      buttonNormal:  '#1e1608ef',
      buttonHover:   '#2e2010ef',
      buttonPressed: '#120e05ef',
      border:        '#c9a22755',
      textPrimary:   '#f5e6c8ff',
      textSecondary: '#8a7040ff',
    },
  },
  {
    id: 'military',
    name: 'Military',
    hint: 'Tactical HUD — dark olive with amber-green accent',
    preview: ['#0a0c08ff', '#121507ef', '#78a832ff', '#1a2010ef', '#c8d8a0ff'],
    colors: {
      background:    '#0a0c08ff',
      surface:       '#121507ef',
      accent:        '#78a832ff',
      buttonNormal:  '#1a2010ef',
      buttonHover:   '#253018ef',
      buttonPressed: '#111508ef',
      border:        '#78a83255',
      textPrimary:   '#c8d8a0ff',
      textSecondary: '#607850ff',
    },
  },
  {
    id: 'blood-red',
    name: 'Blood Red',
    hint: 'Aggressive / danger — near-black with crimson accent',
    preview: ['#0a0505ff', '#150808ef', '#cc2200ff', '#250a08ef', '#ffe0d8ff'],
    colors: {
      background:    '#0a0505ff',
      surface:       '#150808ef',
      accent:        '#cc2200ff',
      buttonNormal:  '#250a08ef',
      buttonHover:   '#3a1010ef',
      buttonPressed: '#180605ef',
      border:        '#cc220055',
      textPrimary:   '#ffe0d8ff',
      textSecondary: '#804040ff',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    hint: 'Cold and clean — deep charcoal with icy blue highlight',
    preview: ['#060810ff', '#0d1220ef', '#88ccffff', '#101828ef', '#e0ecffff'],
    colors: {
      background:    '#060810ff',
      surface:       '#0d1220ef',
      accent:        '#88ccffff',
      buttonNormal:  '#101828ef',
      buttonHover:   '#182438ef',
      buttonPressed: '#080f1cef',
      border:        '#88ccff44',
      textPrimary:   '#e0ecffff',
      textSecondary: '#5a7890ff',
    },
  },
  {
    id: 'toxic-slime',
    name: 'Toxic Slime',
    hint: 'Horror/Survival HUD — dark acid green with radioactive lime accents',
    preview: ['#070a05ff', '#0e140aef', '#39ff14ff', '#1a2710ef', '#e5ffd0ff'],
    colors: {
      background:    '#070a05ff',
      surface:       '#0e140aef',
      accent:        '#39ff14ff',
      buttonNormal:  '#1a2710ef',
      buttonHover:   '#2d451cef',
      buttonPressed: '#10190aef',
      border:        '#39ff1455',
      textPrimary:   '#e5ffd0ff',
      textSecondary: '#557f3aff',
    },
  },
  {
    id: 'retro-sunset',
    name: 'Retro Sunset',
    hint: 'Retro outrun/synthwave — violet background with hot-pink and warm orange accents',
    preview: ['#0a0510ff', '#120b22ef', '#ff007fff', '#220f3aef', '#ffeaecff'],
    colors: {
      background:    '#0a0510ff',
      surface:       '#120b22ef',
      accent:        '#ff007fff',
      buttonNormal:  '#220f3aef',
      buttonHover:   '#391962ef',
      buttonPressed: '#130922ef',
      border:        '#ff730077',
      textPrimary:   '#ffeaecff',
      textSecondary: '#b38affff',
    },
  },
  {
    id: 'forest-hearth',
    name: 'Forest Hearth',
    hint: 'Cozy survival/RPG UI — deep forest green with warm terracotta clay accents',
    preview: ['#050806ff', '#0b120def', '#e07a5fff', '#17251bef', '#f4f1deff'],
    colors: {
      background:    '#050806ff',
      surface:       '#0b120def',
      accent:        '#e07a5fff',
      buttonNormal:  '#17251bef',
      buttonHover:   '#223829ef',
      buttonPressed: '#0d1710ef',
      border:        '#e07a5f66',
      textPrimary:   '#f4f1deff',
      textSecondary: '#8fa89bff',
    },
  },
  {
    id: 'frostburn',
    name: 'Frostburn',
    hint: 'Fantasy UI — glacier-dark slate with burning orange highlights',
    preview: ['#080c10ff', '#101620ef', '#ff7b00ff', '#162232ef', '#e5f3ffff'],
    colors: {
      background:    '#080c10ff',
      surface:       '#101620ef',
      accent:        '#ff7b00ff',
      buttonNormal:  '#162232ef',
      buttonHover:   '#24374eef',
      buttonPressed: '#0c1420ef',
      border:        '#ff7b0055',
      textPrimary:   '#e5f3ffff',
      textSecondary: '#7898b0ff',
    },
  },
  {
    id: 'abyssal-void',
    name: 'Abyssal Void',
    hint: 'Cosmic horror — obsidian black with eerie purple highlights',
    preview: ['#030205ff', '#08060cef', '#b026ffff', '#130d20ef', '#f5f0faff'],
    colors: {
      background:    '#030205ff',
      surface:       '#08060cef',
      accent:        '#b026ffff',
      buttonNormal:  '#130d20ef',
      buttonHover:   '#211637ef',
      buttonPressed: '#0a0612ef',
      border:        '#b026ff44',
      textPrimary:   '#f5f0faff',
      textSecondary: '#7a689bff',
    },
  },
  {
    id: 'ashen-wastes',
    name: 'Ashen Wastes',
    hint: 'Dark fantasy HUD — ash-dark charcoal with glowing embers',
    preview: ['#090909ff', '#121212ef', '#e65f2bff', '#221815ef', '#faf5f2ff'],
    colors: {
      background:    '#090909ff',
      surface:       '#121212ef',
      accent:        '#e65f2bff',
      buttonNormal:  '#221815ef',
      buttonHover:   '#382520ef',
      buttonPressed: '#150d0bef',
      border:        '#e65f2b55',
      textPrimary:   '#faf5f2ff',
      textSecondary: '#8f807aff',
    },
  },
  {
    id: 'royal-palace',
    name: 'Royal Palace',
    hint: 'Regal strategy/RPG UI — deep imperial purple with bright brass highlight',
    preview: ['#07040aff', '#0f0a17ef', '#d4af37ff', '#1b1228ef', '#fdfbf7ff'],
    colors: {
      background:    '#07040aff',
      surface:       '#0f0a17ef',
      accent:        '#d4af37ff',
      buttonNormal:  '#1b1228ef',
      buttonHover:   '#2c1e40ef',
      buttonPressed: '#100a18ef',
      border:        '#d4af3755',
      textPrimary:   '#fdfbf7ff',
      textSecondary: '#9686acff',
    },
  },
]

export function applyThemeToNode(node: WidgetNode, c: ThemeColors): WidgetNode {
  const s = { ...node.style }
  const p = { ...node.properties } as Record<string, unknown>

  switch (node.type) {
    case 'CanvasPanel':
      s.backgroundColor = c.background
      break
    case 'Border':
      s.backgroundColor = c.surface
      s.borderColor = c.border
      break
    case 'Button':
      s.backgroundColor  = c.buttonNormal
      s.hoverColor       = c.buttonHover
      s.pressedColor     = c.buttonPressed
      s.borderColor      = c.border
      break
    case 'Text':
    case 'RichText':
      p.color = c.textPrimary
      break
    case 'TextInput':
      s.backgroundColor = c.surface
      s.borderColor     = c.border
      break
    case 'VerticalBox':
    case 'HorizontalBox':
    case 'Overlay':
    case 'ScrollBox':
    case 'WrapBox':
      s.backgroundColor = c.surface
      break
  }

  return {
    ...node,
    style: s as WidgetNode['style'],
    properties: p as WidgetNode['properties'],
    children: node.children.map(child => applyThemeToNode(child, c)),
  }
}
