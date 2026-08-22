# Brand Tokens Generator — MVP Plan

## المشكلة
أدوات الـ vibe coding (v0, Lovable, Bolt) بترجع نفس الـ generic AI aesthetic لأن محدش
بيحط "design layer" قبل الكود يحدد فيه design tokens مبنية فعلياً على هوية العميل
(لوجو، ألوان، شخصية البراند).

## الحل
Tool مستقل: العميل يرفع لوجو (اختياري) + يجاوب على أسئلة قصيرة → الأداة تطلع
JSON design tokens (colors, typography, spacing, radius, shadow style) جاهز
يتحط كـ seed لأي AI coding tool.

## نطاق الـ MVP (Phase 1 فقط)
✅ IN SCOPE:
- Upload لوجو (اختياري)
- Questionnaire: 4-5 أسئلة ثابتة (industry, personality, density, ألوان مفضلة لو مفيش لوجو)
- **اختيار Design Style بصرياً من العميل مباشرة** (مش قرار LLM) — عرض صور أمثلة
  لكل style (brutalism, neo_brutalism, minimal, glassmorphism, grid_based, soft_modern)
  والعميل يختار اللي يعجبه
- Color extraction من اللوجو (لو موجود) — algorithmic, مش LLM
- LLM call واحد: يقرر roles الألوان + يختار خطوط من قائمة محدودة، **متسقين مع
  الـ style المختار**. اللي مش بيقرره: radius/shadow (دول deterministic من STYLE_PRESETS)
- Post-processing: WCAG contrast validation + auto-fix + shade scale generation (50-900) — كود عادي مش LLM
- Output: JSON بس، بشكل ثابت (schema محدد)
- زر Download JSON

❌ OUT OF SCOPE (v2+):
- Visual preview حي
- حفظ history / accounts
- تصدير Tailwind config / CSS variables
- UI kit / components فعلية
- حقن مباشر في v0/Lovable/OpenCode (API integration)

## الـ Pipeline
```
1. Input:
   - لوجو (optional)
   - إجابات الأسئلة (industry, personality, density)
   - Design Style (إجباري — العميل يختاره بصرياً من صور أمثلة، مش LLM)
   ↓
2. IF لوجو موجود → استخراج 3-5 ألوان مسيطرة (node-vibrant / color-thief)
   ELSE → تخطي، اعتماد كامل على إجابات الأسئلة
   ↓
3. LLM step (Claude API):
   - Input: الألوان المستخرجة (لو موجودة) + إجابات الأسئلة + الـ Design Style (كـ context ثابت)
   - Output: خام JSON بالـ colors + fonts فقط (متسقين مع الـ style المختار)
   - الخطوط تُختار من قائمة مُعرّفة مسبقاً (مش hallucination حر)
   - radius/shadow مش من مسؤولية الـ LLM خالص
   ↓
4. Post-processing (كود عادي):
   - WCAG AA contrast check لكل زوج (text/background)
   - لو فشل → تعديل الـ lightness تلقائياً لحد ما ينجح
   - بناء shade scale (50→900) رياضياً من كل لون أساسي
   - radius/shadow/spacingDensity: lookup مباشر من STYLE_PRESETS[designStyle]
   ↓
5. Output: JSON نهائي مطابق للـ schema + Download button
```

## Design Style Presets (deterministic، مش LLM)
كل style معرف في `constants.ts` (`STYLE_PRESETS`) بـ: label, description, imagePath,
radius, shadow, spacingDensity. القيم دي ثابتة رياضياً — الـ LLM بيستخدم اسم الـ
style بس كسياق لاختيار الألوان/الخطوط المناسبة، ومبيلمسش radius/shadow خالص.

**الصور**: كل style ليه `imagePath` متوقع في `/public/style-examples/{key}.png`.
Taha هيضيف الصور دي بنفسه (mockups أو أمثلة، مش screenshots من مواقع حقيقية
لتجنب أي إشكالية نسخ محتوى).

## الـ JSON Schema (نهائي — v1)
```typescript
interface DesignTokens {
  meta: {
    brandName: string;
    industry: string;
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
    headingFont: string; // من قائمة محددة مسبقاً
    bodyFont: string;
    scale: {
      xs: string; sm: string; base: string; lg: string;
      xl: string; "2xl": string; "3xl": string; "4xl": string;
    };
  };
  spacing: {
    unit: number; // base unit بالـ px
    scale: number[]; // multipliers
  };
  radius: {
    style: "sharp" | "soft" | "full"; // 0px / 8px / 9999px baseline
    value: string;
  };
  shadow: {
    style: "none" | "soft" | "hard-offset"; // hard-offset = neo-brutalism style
    value: string;
  };
}

interface ColorScale {
  base: string; // hex
  shades: {
    "50": string; "100": string; "200": string; "300": string; "400": string;
    "500": string; "600": string; "700": string; "800": string; "900": string;
  };
}
```

## أسئلة الـ Questionnaire (ثابتة)
1. **Design Style** (إجباري) — اختيار بصري من 6 صور أمثلة (brutalism, neo_brutalism,
   minimal, glassmorphism, grid_based, soft_modern)
2. Industry/domain (dropdown: real estate, education, healthcare, tech, retail, other)
3. Personality: formal ↔ playful (slider أو 3 خيارات)
4. Density: minimal ↔ bold/rich (slider أو 3 خيارات)
5. (IF no logo) ألوان مفضلة؟ (اختياري، free text أو color picker)
6. (optional) اسم البراند (للـ meta فقط)

## الـ Stack
- Next.js (App Router) — زي البورتفوليو
- API Route واحد: `/api/generate-tokens`
- Anthropic API (Claude) للـ LLM step
- `node-vibrant` أو مكتبة مشابهة لاستخراج الألوان
- مفيش database في الـ MVP ده (كل حاجة stateless، JSON بيرجع مباشرة للـ client)

## هيكل الملفات
```
/app
  /api/generate-tokens/route.ts
/lib
  colorExtraction.ts
  llmPrompt.ts
  tokenValidator.ts
  types.ts
  constants.ts   ← قائمة الخطوط المسموحة + industry options
/components
  UploadForm.tsx
  ResultView.tsx
```

## ترتيب البناء (Explore → Plan → Implement)
1. types.ts (الـ schema) — الأساس اللي كل حاجة تانية تتبني عليه
2. constants.ts (قائمة الخطوط + industries)
3. llmPrompt.ts — بناء الـ prompt + استدعاء الـ API (نختبره منفصل الأول، manual test)
4. colorExtraction.ts
5. tokenValidator.ts (WCAG check + shade generation)
6. API route بيربط كل حاجة
7. UI (UploadForm + ResultView) — آخر حاجة

## معايير النجاح للـ MVP
- الـ output بيرجع JSON صالح مطابق للـ schema 100% من المرات
- كل الألوان بتعدي WCAG AA contrast check
- لو رفعت لوجو، الألوان الأساسية في الـ output مرتبطة فعلياً بألوان اللوجو (مش عشوائية)
- الناتج "محسوس" مختلف عن بعضه بين industries/personalities مختلفة (مش نفس الـ output تقريباً كل مرة)
