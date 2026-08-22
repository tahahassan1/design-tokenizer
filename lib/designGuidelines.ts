import { STYLE_PRESETS } from "./constants";
import { getVisualReferences } from "./referencesIndex";
import { DesignTokens } from "./types";

const STYLE_GUIDELINES: Record<DesignTokens["meta"]["designStyle"], string[]> = {
  brutalism: [
    "Use raw, direct layouts with sharp edges and strong visual contrast.",
    "Prefer visible borders, bold typography, and intentionally simple surfaces.",
    "Avoid decorative gradients, soft floating cards, and excessive polish.",
  ],
  neo_brutalism: [
    "Use sharp corners, thick borders, bold colors, and clear hard-offset shadows.",
    "Make primary actions visually assertive and keep interactions easy to scan.",
    "Avoid subtle elevation, blurred surfaces, and generic rounded SaaS cards.",
  ],
  minimal: [
    "Use generous whitespace, restrained color, and a small number of visible elements.",
    "Let typography, alignment, and hierarchy do most of the visual work.",
    "Avoid unnecessary borders, shadows, decoration, and competing calls to action.",
  ],
  glassmorphism: [
    "Use translucent surfaces over a coherent background with restrained backdrop blur.",
    "Keep borders light and use soft elevation to separate overlapping surfaces.",
    "Maintain readable contrast and avoid applying blur or transparency to every element.",
  ],
  grid_based: [
    "Organize content into an explicit, consistent grid with clear alignment.",
    "Use borders and spacing to communicate relationships between blocks.",
    "Avoid arbitrary positioning, uneven alignment, and decorative floating elements.",
  ],
  soft_modern: [
    "Use friendly rounded surfaces, calm spacing, and subtle soft shadows.",
    "Favor approachable typography and clear, comfortable interaction states.",
    "Avoid harsh contrast, dense layouts, and excessive pill-shaped controls.",
  ],
};

function cleanText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatList(values: string[]): string {
  return values.map((value) => `- ${value}`).join("\n");
}

export function generateDesignGuidelines(tokens: DesignTokens): string {
  const { meta, typography, spacing, radius, shadow } = tokens;
  const preset = STYLE_PRESETS[meta.designStyle];
  const brandName = cleanText(meta.brandName);
  const styleRules = STYLE_GUIDELINES[meta.designStyle];
  const references = getVisualReferences(meta.designStyle, meta.industry);
  const isSoftSurfaceStyle = ["soft_modern", "minimal", "grid_based"].includes(meta.designStyle);
  const componentPatterns = isSoftSurfaceStyle
    ? `### Surface Cards

\`\`\`html
<!-- BAD (generic AI pattern): solid colored background -->
<div class="bg-primary text-white p-6 rounded-lg">...</div>

<!-- GOOD (premium refined pattern): subtle border, crisp surface -->
<div class="bg-white border border-slate-200 shadow-sm p-6 rounded-xl">...</div>
\`\`\`

Use the semantic roles \`surface-base\`, \`surface-container\`, and \`border-subtle\` instead of styling every card as a brand-colored block.`
    : `### Intentional Style Pattern

\`\`\`html
<!-- BAD: generic rounded SaaS card with decorative elevation -->
<div class="bg-primary text-white p-6 rounded-lg shadow-lg">...</div>

<!-- GOOD: let the selected style control shape and contrast -->
<div class="bg-[var(--surface-container)] border-2 border-black p-6 shadow-[4px_4px_0_#000]">...</div>
\`\`\`

Use \`interactive-accent\` only for calls to action, badges, and selected states. Keep surfaces structural.`;

  return `# ${brandName} Design Guidelines

Use this file as the design context when building UI for **${brandName}**. The JSON block below is the source of truth for exact token values. Do not replace these values with generic defaults.

## Design Direction

- Style: **${preset.label}** (${meta.designStyle})
- Industry: **${meta.industry}**
- Personality: **${meta.personality}**
- Density: **${meta.density}**

${formatList(styleRules)}

## Layout And Shape

- Base spacing unit: **${spacing.unit}px**
- Spacing multipliers: **${spacing.scale.join(", ")}**
- Radius: **${radius.style}** (${radius.value})
- Shadow: **${shadow.style}** (${shadow.value})
- The selected style determines radius, shadow, and spacing density. Keep those decisions consistent across components.
- Keep component padding at least **24px** for cards and **32px** for primary page sections; do not compress layouts to fit more content.
- Maintain a minimum of **80px vertical space between major sections** on desktop and at least **48px** on mobile.

## Visual Benchmark

- Benchmark products: **${references.products.join(", ")}**
- What to borrow: ${references.focus}
- These are visual quality references, not templates to copy. Preserve the selected style while matching their restraint, hierarchy, and finish.

## Typography

- Heading font: **${typography.headingFont}**
- Body font: **${typography.bodyFont}**
- Use the type scale from the token JSON instead of inventing arbitrary sizes.
- Preserve a clear hierarchy between headings, body copy, labels, and supporting text.
- Display headings MUST be at least **2.5x larger than body text** (use \`text-4xl\` or larger when the body is \`text-base\`).
- Use tight tracking (\`tracking-tight\`) for display headings and avoid wide letter spacing on large type.

## Color Usage

- Use \`surface-base\` for the page background and \`surface-container\` for grouped content surfaces.
- Use \`border-subtle\` for quiet separation; do not replace it with thick or high-contrast borders unless the selected style requires it.
- Use \`interactive-accent\` strictly for CTAs, badges, links, and selected states. Never use it as the default background of every card.
- Use \`text-primary\` for headings and essential content, and \`text-muted\` for supporting copy.
- Use status colors only for success, warning, and error states.
- Preserve the generated contrast-safe values. Do not reduce contrast for visual styling.

## Component Rules

- Buttons, links, inputs, cards, and navigation should all follow the selected style.
- Keep focus, hover, disabled, loading, success, warning, and error states visible.
- Do not introduce a second visual language, unrelated font, arbitrary radius, or arbitrary shadow.
- Prefer the provided scales and spacing values over one-off values.

## Component Patterns

${componentPatterns}

## Structural Constraints

- Do not use dense, evenly padded card grids as the default page composition; vary scale and create a clear focal point.
- Every major page needs a visible hierarchy: one display heading, supporting context, and one primary action.
- Prefer whitespace and alignment over extra borders, gradients, or decorative solid-color panels.

## Token Data

~~~json
${JSON.stringify(tokens, null, 2)}
~~~
`;
}
