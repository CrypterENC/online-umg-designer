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
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    hint: 'Submarine/underwater HUD — abyssal teal with bioluminescent aqua highlights',
    preview: ['#040a12ff', '#081424ef', '#00ffd2ff', '#0f2038ef', '#d5faffff'],
    colors: {
      background:    '#040a12ff',
      surface:       '#081424ef',
      accent:        '#00ffd2ff',
      buttonNormal:  '#0f2038ef',
      buttonHover:   '#183358ef',
      buttonPressed: '#0a1628ef',
      border:        '#00ffd244',
      textPrimary:   '#d5faffff',
      textSecondary: '#628c9eff',
    },
  },
  {
    id: 'matrix',
    name: 'Hacker Matrix',
    hint: 'Retro terminal/cybersecurity UI — pitch-black with phosphor green accents',
    preview: ['#000000ff', '#050a05ef', '#33ff33ff', '#0a1a0aef', '#dfffdfff'],
    colors: {
      background:    '#000000ff',
      surface:       '#050a05ef',
      accent:        '#33ff33ff',
      buttonNormal:  '#0a1a0aef',
      buttonHover:   '#103010ef',
      buttonPressed: '#030c03ef',
      border:        '#33ff3344',
      textPrimary:   '#dfffdfff',
      textSecondary: '#33ff3388',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    hint: 'Casual/anime game UI — pastel pink surface with soft crimson accents',
    preview: ['#180f12ff', '#2d1a20ef', '#ff8da1ff', '#3d202bef', '#fff0f3ff'],
    colors: {
      background:    '#180f12ff',
      surface:       '#2d1a20ef',
      accent:        '#ff8da1ff',
      buttonNormal:  '#3d202bef',
      buttonHover:   '#5a303eef',
      buttonPressed: '#26131aef',
      border:        '#ff8da144',
      textPrimary:   '#fff0f3ff',
      textSecondary: '#a67784ff',
    },
  },
  {
    id: 'rusty-junk',
    name: 'Rusty Junk',
    hint: 'Post-apocalyptic scrap HUD — industrial metal grey with rusted orange accents',
    preview: ['#0c0a08ff', '#1a1410ef', '#d95a14ff', '#2d2018ef', '#f7ebe0ff'],
    colors: {
      background:    '#0c0a08ff',
      surface:       '#1a1410ef',
      accent:        '#d95a14ff',
      buttonNormal:  '#2d2018ef',
      buttonHover:   '#453024ef',
      buttonPressed: '#1d140fef',
      border:        '#d95a1444',
      textPrimary:   '#f7ebe0ff',
      textSecondary: '#968070ff',
    },
  },
  {
    id: 'arcane',
    name: 'Arcane Magic',
    hint: 'Fantasy spellbook UI — deep violet with neon purple/magenta runes',
    preview: ['#0c0514ff', '#1a0b2bef', '#df00ffff', '#281045ef', '#faefffff'],
    colors: {
      background:    '#0c0514ff',
      surface:       '#1a0b2bef',
      accent:        '#df00ffff',
      buttonNormal:  '#281045ef',
      buttonHover:   '#3e196bef',
      buttonPressed: '#190a2cef',
      border:        '#df00ff44',
      textPrimary:   '#faefffff',
      textSecondary: '#a484caff',
    },
  },
  {
    id: 'carbon',
    name: 'Carbon Fiber',
    hint: 'Modern racing/automotive HUD — carbon black with sports-car red accents',
    preview: ['#0d0d0dff', '#181818ef', '#ff2a2aff', '#2b2b2bef', '#f5f5f5ff'],
    colors: {
      background:    '#0d0d0dff',
      surface:       '#181818ef',
      accent:        '#ff2a2aff',
      buttonNormal:  '#2b2b2bef',
      buttonHover:   '#404040ef',
      buttonPressed: '#1a1a1aef',
      border:        '#ff2a2a44',
      textPrimary:   '#f5f5f5ff',
      textSecondary: '#909090ff',
    },
  },
  {
    id: 'sand-dune',
    name: 'Sand Dune',
    hint: 'Desert survival HUD — warm sand background with baking sun orange accents',
    preview: ['#120f0aff', '#241e15ef', '#f4a261ff', '#33291cef', '#fefae0ff'],
    colors: {
      background:    '#120f0aff',
      surface:       '#241e15ef',
      accent:        '#f4a261ff',
      buttonNormal:  '#33291cef',
      buttonHover:   '#4e3f2bef',
      buttonPressed: '#201911ef',
      border:        '#f4a26144',
      textPrimary:   '#fefae0ff',
      textSecondary: '#a89276ff',
    },
  },
  {
    id: 'neon-lime',
    name: 'Neon Lime',
    hint: 'Cybernetic theme — pitch black with toxic glowing neon lime accents',
    preview: ['#020301ff', '#060b03ef', '#39ff14ff', '#0c1b06ef', '#f0fff0ff'],
    colors: {
      background:    '#020301ff',
      surface:       '#060b03ef',
      accent:        '#39ff14ff',
      buttonNormal:  '#0c1b06ef',
      buttonHover:   '#14300aef',
      buttonPressed: '#071003ef',
      border:        '#39ff1466',
      textPrimary:   '#f0fff0ff',
      textSecondary: '#39ff1499',
    },
  },
  {
    id: 'neon-magenta',
    name: 'Neon Magenta',
    hint: 'Synthwave vibe — obsidian with blazing hot neon pink/magenta highlights',
    preview: ['#030103ff', '#0b040bef', '#ff007fff', '#1a0720ff', '#fff0f5ff'],
    colors: {
      background:    '#030103ff',
      surface:       '#0b040bef',
      accent:        '#ff007fff',
      buttonNormal:  '#1a0720ef',
      buttonHover:   '#2c0a37ef',
      buttonPressed: '#100315ef',
      border:        '#ff007f66',
      textPrimary:   '#fff0f5ff',
      textSecondary: '#ff007f99',
    },
  },
  {
    id: 'neon-cyan',
    name: 'Neon Cyan',
    hint: 'Virtual grid — deep space black with electric neon cyan highlights',
    preview: ['#010305ff', '#030a10ef', '#00f5ffff', '#051b28ff', '#f0faffff'],
    colors: {
      background:    '#010305ff',
      surface:       '#030a10ef',
      accent:        '#00f5ffff',
      buttonNormal:  '#051b28ef',
      buttonHover:   '#092c42ef',
      buttonPressed: '#020d15ef',
      border:        '#00f5ff55',
      textPrimary:   '#f0faffff',
      textSecondary: '#00f5ff99',
    },
  },
  {
    id: 'neon-tangerine',
    name: 'Neon Tangerine',
    hint: 'Bioluminescent fire — volcanic dark ash with intense glowing neon orange highlights',
    preview: ['#040201ff', '#0f0804ef', '#ff6700ff', '#241004ff', '#fff3ebff'],
    colors: {
      background:    '#040201ff',
      surface:       '#0f0804ef',
      accent:        '#ff6700ff',
      buttonNormal:  '#241004ef',
      buttonHover:   '#3b1a06ef',
      buttonPressed: '#120802ef',
      border:        '#ff670055',
      textPrimary:   '#fff3ebff',
      textSecondary: '#ff670099',
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
