import { DesignStyle, IndustryOption } from "./types";

export interface VisualReference {
  products: string[];
  focus: string;
}

const STYLE_REFERENCES: Record<DesignStyle, VisualReference> = {
  brutalism: {
    products: ["The Creative Independent", "Dropbox Design", "Figma"],
    focus: "Direct composition, unapologetic contrast, visible structure, and typography-led hierarchy.",
  },
  neo_brutalism: {
    products: ["Figma", "Gumroad", "Are.na"],
    focus: "Sharp 0px borders, hard black offsets, bold type, and deliberate high-energy color blocks used sparingly.",
  },
  minimal: {
    products: ["Apple", "Linear", "Notion"],
    focus: "Exceptional spacing, disciplined hierarchy, restrained surfaces, and typography doing most of the work.",
  },
  glassmorphism: {
    products: ["Apple", "Arc", "Stripe"],
    focus: "Crisp translucent layers, controlled blur, fine borders, and clear contrast over a quiet backdrop.",
  },
  grid_based: {
    products: ["Linear", "Vercel", "The New York Times"],
    focus: "Explicit alignment, editorial rhythm, systematic columns, and borders that clarify relationships.",
  },
  soft_modern: {
    products: ["Stripe", "Vercel", "Apple"],
    focus: "Crisp white surfaces, 1px subtle borders, generous whitespace, and zero heavy solid-colored cards.",
  },
};

const INDUSTRY_REFERENCES: Partial<Record<IndustryOption, VisualReference>> = {
  real_estate: {
    products: ["Compass", "Aman", "Zillow","setpoint.io"],
    focus: "Let imagery, calm typography, and scannable property information lead; avoid dashboard-like density.",
  },
  education: {
    products: ["Khan Academy", "Duolingo", "Coursera"],
    focus: "Use approachable hierarchy, clear progress cues, and high readability without childish decoration.",
  },
  healthcare: {
    products: ["Aesop", "One Medical", "Headspace"],
    focus: "Prioritize calm trust, generous breathing room, accessible contrast, and unambiguous actions.",
  },
  tech: {
    products: ["Stripe", "Linear", "Vercel"],
    focus: "Favor precise information architecture, strong type hierarchy, and subtle surfaces over neon gradients.",
  },
  retail: {
    products: ["Apple", "Aesop", "Nike"],
    focus: "Give products visual priority, pair editorial whitespace with decisive actions, and keep utility controls quiet.",
  },
};

export function getVisualReferences(
  designStyle: DesignStyle,
  industry: IndustryOption
): VisualReference {
  const styleReference = STYLE_REFERENCES[designStyle];
  const industryReference = INDUSTRY_REFERENCES[industry];

  if (!industryReference) return styleReference;

  return {
    products: [...new Set([...styleReference.products, ...industryReference.products])],
    focus: `${styleReference.focus} ${industryReference.focus}`,
  };
}
