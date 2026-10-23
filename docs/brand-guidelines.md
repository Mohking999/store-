# PhoneTech Algérie — Brand Guidelines & Design System Specifications
*Created with ui-ux-pro-max, design-system, banner-design & brand skills*

---

## 1. Brand Identity & Positioning

- **Brand Name**: PhoneTech Algérie (فون تك الجزائر)
- **Tagline**: Plateforme Nationale de Réparation Mobile (المنصة الوطنية لإصلاح الهواتف الذكية)
- **Brand Purpose**: Bring absolute transparency, technical excellence, and consumer protection to smartphone repairs across all 58 Wilayas of Algeria.
- **Tone of Voice**:
  - Authoritative yet accessible
  - Reassuring and transparent
  - Modern tech precision without intimidating jargon
  - Proudly Algerian (localized in Algerian Dinars DZD, Algerian phone formats, and dual Arabic/French)

---

## 2. Three-Layer Design Token Architecture

Conforming to the `design-system` skill specifications:

```
┌──────────────────────────────────────────────┐
│ 1. Primitive Tokens (Raw Colors & Scales)     │
│    #10B981 (Emerald), #090D16 (Slate 950),   │
│    8dp spacing rhythm (4, 8, 12, 16, 24, 32) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 2. Semantic Tokens (Purpose Aliases)         │
│    --color-primary, --color-surface,         │
│    --color-border, --color-text-primary      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 3. Component Tokens (UI-Specific Rules)      │
│    --card-bg, --input-border, --btn-primary  │
└──────────────────────────────────────────────┘
```

### Color Palette (Tokens)
| Token Name | Value | Purpose |
|---|---|---|
| `--primitive-emerald-500` | `#10B981` | Core Brand Primary (Algerian Green inspiration) |
| `--primitive-emerald-600` | `#059669` | Primary Hover / Pressed |
| `--primitive-slate-950` | `#090D16` | Main Canvas (Dark Mode) |
| `--primitive-slate-900` | `#0F172A` | Card & Panel Surface |
| `--primitive-cyan-400` | `#22D3EE` | Tech Accent (Tracking & Micro-electronics) |
| `--primitive-amber-400` | `#FBBF24` | Warning & Pending Quotation state |
| `--primitive-rose-400` | `#FB7185` | Unrepairable & Rejection state |

---

## 3. Typography & Directional Layout (RTL & LTR)

| Language | Font Family | Direction | Fallback |
|---|---|---|---|
| **Français** | `Inter` | LTR (`dir="ltr"`) | `system-ui, -apple-system, sans-serif` |
| **العربية** | `Cairo` | RTL (`dir="rtl"`) | `Tahoma, Arial, sans-serif` |

- **Type Scale**:
  - Display Hero: 3.5rem (56px) / Weight 900
  - Section Headings: 1.875rem (30px) / Weight 800
  - Card Titles: 1.125rem (18px) / Weight 700
  - Body: 0.875rem (14px) / Weight 400
  - Micro / Badges: 0.6875rem (11px) / Weight 600

---

## 4. UI/UX Pro Max Pre-Delivery Audit

- **Zero Emoji As System Icons**: All structural iconography uses clean SVG vectors via Lucide.
- **Minimum Touch Targets**: All action buttons, inputs, and tab items adhere to `>= 44x44px` on mobile screens.
- **Stable Interaction States**: Press and hover effects use opacity, color shifts, and glows with zero layout jitter.
- **Focus Rings**: Accessible `:focus-visible` styling (`outline: 3px solid #1b9a70`) throughout.
- **Accessible Contrast**: All body text maintains `>= 4.5:1` contrast ratio on dark and light surfaces.
- **R2 Hero Visual**: Laboratory workbench banner rendered in 16:9 aspect ratio and integrated into the customer landing experience.
