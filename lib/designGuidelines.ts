import { STYLE_PRESETS } from "./constants";
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

## Typography

- Heading font: **${typography.headingFont}**
- Body font: **${typography.bodyFont}**
- Use the type scale from the token JSON instead of inventing arbitrary sizes.
- Preserve a clear hierarchy between headings, body copy, labels, and supporting text.

## Color Usage

- Use the primary scale for the main brand action and key interactive states.
- Use the secondary scale for supporting actions and secondary emphasis.
- Use the accent scale sparingly for highlights, selected states, or focused information.
- Use the neutral scale for page backgrounds, surfaces, borders, and readable text.
- Use semantic colors only for success, warning, and error states.
- Preserve the generated contrast-safe values. Do not reduce contrast for visual styling.

## Component Rules

- Buttons, links, inputs, cards, and navigation should all follow the selected style.
- Keep focus, hover, disabled, loading, success, warning, and error states visible.
- Do not introduce a second visual language, unrelated font, arbitrary radius, or arbitrary shadow.
- Prefer the provided scales and spacing values over one-off values.

## Token Data

~~~json
${JSON.stringify(tokens, null, 2)}
~~~
`;
}
