import { WCAG_AA_MIN_CONTRAST, STYLE_PRESETS, RADIUS_VALUES, SHADOW_VALUES, TYPOGRAPHY_SCALE, SPACING_UNIT_PX, SPACING_SCALE } from "./constants";
import { ColorScale, ColorShadeKey, DesignStyle, DesignTokens, QuestionnaireInput, RawLLMTokenOutput } from "./types";

// ============================================
// أدوات تحويل الألوان (hex ↔ RGB ↔ HSL)
// كل الحسابات هنا كود عادي رياضي — مفيش LLM يلمسها،
// عشان النتيجة تبقى deterministic ومضمونة 100%
// ============================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hN = h / 360;
  const sN = s / 100;
  const lN = l / 100;

  if (sN === 0) {
    const gray = lN * 255;
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;

  return {
    r: hue2rgb(p, q, hN + 1 / 3) * 255,
    g: hue2rgb(p, q, hN) * 255,
    b: hue2rgb(p, q, hN - 1 / 3) * 255,
  };
}

// ============================================
// WCAG contrast calculation (relative luminance formula)
// ============================================

function relativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * لو الـ contrast بين لون وbackground (أبيض أو أسود حسب الأقرب) مش كافي،
 * بنعدل الـ lightness تدريجياً (بخطوات صغيرة) لحد ما نوصل للحد الأدنى
 * المطلوب في WCAG AA، أو نوصل لحد أقصى من المحاولات فنرجع أقرب نتيجة.
 *
 * السبب في الاختيار ده: تعديل الـ HSL lightness بيحافظ على الـ hue
 * الأصلي (يعني اللون لسه "هو نفسه" بصرياً)، بدل ما نستبدل اللون بالكامل.
 */
export function ensureContrast(
  hex: string,
  backgroundHex: string,
  minContrast: number = WCAG_AA_MIN_CONTRAST,
  maxIterations: number = 20
): string {
  let currentHex = hex;
  let currentContrast = contrastRatio(currentHex, backgroundHex);

  if (currentContrast >= minContrast) return currentHex;

  const backgroundLum = relativeLuminance(hexToRgb(backgroundHex));
  const shouldDarken = backgroundLum > 0.5; // لو الخلفية فاتحة، لازم النص يبقى أغمق

  const hsl = rgbToHsl(hexToRgb(currentHex));
  const step = shouldDarken ? -4 : 4;

  for (let i = 0; i < maxIterations; i++) {
    hsl.l = Math.max(0, Math.min(100, hsl.l + step));
    currentHex = rgbToHex(hslToRgb(hsl));
    currentContrast = contrastRatio(currentHex, backgroundHex);
    if (currentContrast >= minContrast) break;
    // لو وصلنا لأقصى حد (أبيض أو أسود تماماً) ومفيش فايدة، نوقف
    if (hsl.l <= 0 || hsl.l >= 100) break;
  }

  return currentHex;
}

// ============================================
// توليد shade scale (50-900) من لون أساسي واحد
// المنطق: 500 = اللون الأساسي نفسه تقريباً، وكل ما نبعد عنه
// (لفوق = أفتح، لتحت = أغمق) بنعدل الـ lightness بنسبة ثابتة
// ============================================

const SHADE_LIGHTNESS_MAP: Record<ColorShadeKey, number> = {
  "50": 95,
  "100": 90,
  "200": 80,
  "300": 70,
  "400": 60,
  "500": 50, // القريب من الأساسي
  "600": 42,
  "700": 34,
  "800": 26,
  "900": 18,
};

export function generateColorScale(baseHex: string): ColorScale {
  const baseHsl = rgbToHsl(hexToRgb(baseHex));
  const shades = {} as Record<ColorShadeKey, string>;

  for (const key of Object.keys(SHADE_LIGHTNESS_MAP) as ColorShadeKey[]) {
    const targetLightness = SHADE_LIGHTNESS_MAP[key];
    const shadeHsl: HSL = { h: baseHsl.h, s: baseHsl.s, l: targetLightness };
    shades[key] = rgbToHex(hslToRgb(shadeHsl));
  }

  return { base: baseHex.toUpperCase(), shades };
}

// ============================================
// التجميع النهائي: من RawLLMTokenOutput + designStyle → DesignTokens كامل
// ============================================

export function buildFinalTokens(
  raw: RawLLMTokenOutput,
  questionnaire: QuestionnaireInput
): DesignTokens {
  const preset = STYLE_PRESETS[questionnaire.designStyle];

  // تحقق من التباين مع الخلفية الافتراضية (بيضاء) — الحالة الأكثر شيوعاً
  // كنص/عناصر UI فوق خلفية فاتحة. لو الـ UI هيستخدم dark mode لاحقاً،
  // ده هيحتاج معالجة إضافية في v2.
  const WHITE = "#FFFFFF";
  const safePrimary = ensureContrast(raw.colors.primary, WHITE);
  const safeSecondary = ensureContrast(raw.colors.secondary, WHITE);
  const safeAccent = ensureContrast(raw.colors.accent, WHITE);
  const safeNeutral = ensureContrast(raw.colors.neutral, WHITE);

  return {
    meta: {
      brandName: questionnaire.brandName || "Untitled Brand",
      industry: questionnaire.industry,
      designStyle: questionnaire.designStyle,
      personality: questionnaire.personality,
      density: questionnaire.density,
      generatedAt: new Date().toISOString(),
    },
    colors: {
      primary: generateColorScale(safePrimary),
      secondary: generateColorScale(safeSecondary),
      accent: generateColorScale(safeAccent),
      neutral: generateColorScale(safeNeutral),
      semantic: {
        success: ensureContrast(raw.colors.semantic.success, WHITE),
        warning: ensureContrast(raw.colors.semantic.warning, WHITE),
        error: ensureContrast(raw.colors.semantic.error, WHITE),
      },
    },
    typography: {
      headingFont: raw.typography.headingFont,
      bodyFont: raw.typography.bodyFont,
      scale: TYPOGRAPHY_SCALE,
    },
    spacing: {
      unit: SPACING_UNIT_PX,
      scale: SPACING_SCALE,
    },
    radius: {
      style: preset.radius,
      value: RADIUS_VALUES[preset.radius],
    },
    shadow: {
      style: preset.shadow,
      value: SHADOW_VALUES[preset.shadow],
    },
  };
}
