import { IndustryOption, DesignStyle } from "./types";

// ============================================
// قائمة الخطوط المسموحة — الموديل لازم يختار منها بس
// (كلها متاحة على Google Fonts، ومتنوعة بين formal/playful)
// ============================================
export const ALLOWED_FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Playfair Display",
  "Montserrat",
  "Space Grotesk",
  "DM Sans",
  "Sora",
  "Manrope",
  "Fraunces",
  "IBM Plex Sans",
  "Work Sans",
] as const;

export type AllowedFont = (typeof ALLOWED_FONTS)[number];

// ============================================
// خيارات الـ industry (تتطابق مع IndustryOption في types.ts)
// ============================================
export const INDUSTRY_OPTIONS: { value: IndustryOption; label: string }[] = [
  { value: "real_estate", label: "عقارات" },
  { value: "education", label: "تعليم" },
  { value: "healthcare", label: "رعاية صحية" },
  { value: "tech", label: "تقنية / SaaS" },
  { value: "retail", label: "تجارة / متاجر" },
  { value: "other", label: "أخرى" },
];

// ============================================
// Typography scale ثابت (نفس النسب لكل الـ outputs، بيتغير بس الخط)
// ============================================
export const TYPOGRAPHY_SCALE = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
};

// ============================================
// Spacing scale ثابت
// ============================================
export const SPACING_UNIT_PX = 4;
export const SPACING_SCALE = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];

// ============================================
// Radius values حسب الـ style
// ============================================
export const RADIUS_VALUES: Record<"sharp" | "soft" | "full", string> = {
  sharp: "0px",
  soft: "8px",
  full: "9999px",
};

// ============================================
// Shadow values حسب الـ style
// hard-offset = neo-brutalism style (offset black shadow)
// ============================================
export const SHADOW_VALUES: Record<"none" | "soft" | "hard-offset", string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.08)",
  "hard-offset": "4px 4px 0px rgba(0,0,0,1)",
};

// ============================================
// WCAG AA minimum contrast ratio
// ============================================
export const WCAG_AA_MIN_CONTRAST = 4.5;

// ============================================
// Design Styles — العميل بيختار واحد منهم بصرياً (عبر صور أمثلة)
// كل style ليه preset ثابت لـ radius/shadow/spacing — deterministic،
// مش قرار LLM. ده اللي بيضمن الاتساق البصري (مفيش تركيبات متناقضة).
//
// ⚠️ TODO (Taha): حط صورة مثال حقيقية لكل style في:
// /public/style-examples/{key}.png  (أو .jpg)
// الصور دي للعرض في شاشة اختيار الـ style بس (mockups من عندك،
// مش screenshots من مواقع حقيقية لغيرك، تجنباً لأي مشكلة نسخ محتوى).
// ============================================
export const STYLE_PRESETS: Record<
  DesignStyle,
  {
    label: string; // اسم يتعرض للعميل
    description: string; // وصف قصير يتعرض تحت الصورة
    imagePath: string; // مكان الصورة المتوقع — انت هتحطها
    radius: "sharp" | "soft" | "full";
    shadow: "none" | "soft" | "hard-offset";
    spacingDensity: "minimal" | "balanced" | "bold";
  }
> = {
  brutalism: {
    label: "Brutalism",
    description: "خام، حواف حادة، بدون زخرفة، تباين قوي",
    imagePath: "/style-examples/brutalism.png",
    radius: "sharp",
    shadow: "none",
    spacingDensity: "bold",
  },
  neo_brutalism: {
    label: "Neo-Brutalism",
    description: "حواف حادة أو شبه حادة، ظلال offset سوداء واضحة، ألوان جريئة",
    imagePath: "/style-examples/neo-brutalism.png",
    radius: "sharp",
    shadow: "hard-offset",
    spacingDensity: "bold",
  },
  minimal: {
    label: "Minimal",
    description: "مساحات بيضاء واسعة، عناصر قليلة، بدون ظلال",
    imagePath: "/style-examples/minimal.png",
    radius: "soft",
    shadow: "none",
    spacingDensity: "minimal",
  },
  glassmorphism: {
    label: "Glassmorphism",
    description: "شفافية، ضبابية خلفية (blur)، حواف ناعمة مضيئة",
    imagePath: "/style-examples/glassmorphism.png",
    radius: "full",
    shadow: "soft",
    spacingDensity: "balanced",
  },
  grid_based: {
    label: "Grid-Based",
    description: "تقسيم واضح على شكل شبكة منتظمة، حدود بين الكتل",
    imagePath: "/style-examples/grid-based.png",
    radius: "sharp",
    shadow: "none",
    spacingDensity: "balanced",
  },
  soft_modern: {
    label: "Soft Modern",
    description: "حواف مدورة ناعمة، ظلال خفيفة، إحساس ودود وحديث",
    imagePath: "/style-examples/soft-modern.png",
    radius: "soft",
    shadow: "soft",
    spacingDensity: "balanced",
  },
};
