// ============================================
// Design Tokens Schema — v1
// هذا الملف هو الـ single source of truth للـ shape
// بتاع الـ output. أي تعديل هنا لازم ينعكس في:
// llmPrompt.ts (الـ prompt instructions) و tokenValidator.ts
// ============================================

export type ColorShadeKey =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export interface ColorScale {
  base: string; // hex code, e.g. "#3B82F6"
  shades: Record<ColorShadeKey, string>;
}

export interface DesignTokens {
  meta: {
    brandName: string;
    industry: string;
    designStyle: DesignStyle;
    personality: PersonalityOption;
    density: DensityOption;
    generatedAt: string; // ISO timestamp
  };
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: {
      success: string;
      warning: string;
      error: string;
    };
  };
  typography: {
    headingFont: string; // must be one of ALLOWED_FONTS (constants.ts)
    bodyFont: string; // must be one of ALLOWED_FONTS (constants.ts)
    scale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
    };
  };
  spacing: {
    unit: number; // base unit in px, e.g. 4
    scale: number[]; // multipliers, e.g. [1, 2, 3, 4, 6, 8, 12, 16]
  };
  radius: {
    style: "sharp" | "soft" | "full";
    value: string; // css value, e.g. "0px" | "8px" | "9999px"
  };
  shadow: {
    style: "none" | "soft" | "hard-offset";
    value: string; // css box-shadow value
  };
}

// ============================================
// Input Types (من الـ questionnaire)
// ============================================

export type IndustryOption =
  | "real_estate"
  | "education"
  | "healthcare"
  | "tech"
  | "retail"
  | "other";

export type PersonalityOption = "formal" | "balanced" | "playful";

export type DensityOption = "minimal" | "balanced" | "bold";

// ============================================
// Design Style — يتم اختياره من العميل مباشرة (بصرياً، عبر أمثلة صور)
// مش قرار LLM. القيمة دي بتتحول لـ preset ثابت (radius/shadow/spacing)
// عبر STYLE_PRESETS في constants.ts — الـ LLM ما بيلمسش القرار ده خالص.
// ============================================
export type DesignStyle =
  | "brutalism"
  | "neo_brutalism"
  | "minimal"
  | "glassmorphism"
  | "grid_based"
  | "soft_modern";

export interface QuestionnaireInput {
  brandName?: string;
  industry: IndustryOption;
  personality: PersonalityOption;
  density: DensityOption;
  designStyle: DesignStyle; // إجباري — العميل بيختاره من الأمثلة البصرية
  preferredColors?: string[]; // hex codes, optional, used only if no logo
}

export interface ExtractedLogoColors {
  colors: string[]; // hex codes extracted from logo, 3-5 colors
}

export interface GenerateTokensRequest {
  questionnaire: QuestionnaireInput;
  logoColors?: ExtractedLogoColors; // undefined if no logo uploaded
}

// ============================================
// Raw LLM output (قبل الـ post-processing)
// الموديل بيرجع نسخة "خام" من غير shades كاملة أو validation
// ============================================

export interface RawLLMTokenOutput {
  colors: {
    primary: string; // hex, base color only
    secondary: string;
    accent: string;
    neutral: string;
    semantic: {
      success: string;
      warning: string;
      error: string;
    };
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  // ملحوظة: radius و shadow اتشالوا من هنا — بقوا deterministic
  // من STYLE_PRESETS مش قرار LLM (شوف constants.ts)
}
