import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALLOWED_FONTS, STYLE_PRESETS } from "./constants";
import { QuestionnaireInput, ExtractedLogoColors, RawLLMTokenOutput } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * بناء الـ system prompt. القرار الأساسي هنا:
 * - نديله قيود صارمة (قوائم محددة) بدل حرية كاملة، عشان نقفل
 *   نسبة الـ "generic AI look" اللي المشروع كله بيحاول يتجنبها.
 * - لو فيه ألوان مستخرجة من اللوجو، لازم يستخدمها كنقطة انطلاق
 *   حقيقية مش يتجاهلها ويخترع ألوان تانية.
 */
function buildSystemPrompt(designStyle: keyof typeof STYLE_PRESETS): string {
  const styleInfo = STYLE_PRESETS[designStyle];

  return `أنت خبير Design Systems متخصص في بناء design tokens لتطبيقات وواجهات حقيقية.
مهمتك: تحويل معلومات عن براند (industry, personality, density, ألوان اللوجو لو موجودة)
إلى قرارات الألوان والخطوط فقط. الـ design style تم اختياره مسبقاً من العميل مباشرة
(ليس قرارك)، وأنت مُلزم بالتوافق معه.

الـ design style المُختار: "${styleInfo.label}" — ${styleInfo.description}

قواعد صارمة يجب الالتزام بها:
1. اختر الخطوط (headingFont, bodyFont) فقط من هذه القائمة، بالضبط كما هي مكتوبة:
   ${ALLOWED_FONTS.join(", ")}
   اختر خطوطاً تناسب طابع "${styleInfo.label}" تحديداً (مثال: خطوط geometric/bold
   تناسب neo-brutalism، خطوط أنيقة خفيفة تناسب minimal أو glassmorphism).
2. إذا توفرت ألوان مستخرجة من اللوجو، استخدمها كأساس حقيقي لـ primary/secondary/accent —
   لا تتجاهلها ولا تخترع ألوان بديلة كاملة. يمكنك تعديل الإضاءة (lightness) بسيطاً
   فقط إذا لزم لضمان التباين، لكن الـ hue الأساسي يجب أن يبقى من اللوجو.
3. إذا لم تتوفر ألوان من اللوجو، ابنِ palette متماسكة (primary + secondary + accent)
   متجانسة مع الـ industry والـ personality المحددة، وتناسب طابع "${styleInfo.label}"
   (مثال: neo-brutalism يميل لألوان جريئة صريحة، minimal يميل لألوان محايدة هادئة،
   glassmorphism يميل لألوان فاتحة/pastel تناسب الشفافية). تجنب الافتراضي الشائع
   (indigo/purple gradient) إلا إذا كان مبرراً فعلاً بالسياق.
4. neutral color: دائماً درجة رمادية (يمكن أن تميل قليلاً للحرارة أو البرودة حسب باقي الألوان).
5. الألوان الدلالية (success/warning/error): استخدم قيم واضحة الدلالة
   (أخضر/أصفر أو برتقالي/أحمر) لكن منسجمة مع الـ palette العام وليست صارخة بلا داعٍ.
6. لا تقترح قيم radius أو shadow — هذه القيم محددة مسبقاً حسب الـ style ولا تدخل ضمن مهمتك.
7. أعد الإجابة كـ JSON صالح فقط، بدون أي نص إضافي، بدون markdown code fences.
   يجب أن يطابق الشكل التالي بالضبط:

{
  "colors": {
    "primary": "#RRGGBB",
    "secondary": "#RRGGBB",
    "accent": "#RRGGBB",
    "neutral": "#RRGGBB",
    "semantic": {
      "success": "#RRGGBB",
      "warning": "#RRGGBB",
      "error": "#RRGGBB"
    }
  },
  "typography": {
    "headingFont": "اسم من القائمة",
    "bodyFont": "اسم من القائمة"
  }
}`;
}

function buildUserPrompt(
  questionnaire: QuestionnaireInput,
  logoColors?: ExtractedLogoColors
): string {
  const parts: string[] = [];

  parts.push(`Industry: ${questionnaire.industry}`);
  parts.push(`Personality: ${questionnaire.personality}`);
  parts.push(`Density: ${questionnaire.density}`);

  if (questionnaire.brandName) {
    parts.push(`Brand name: ${questionnaire.brandName}`);
  }

  if (logoColors && logoColors.colors.length > 0) {
    parts.push(
      `الألوان المستخرجة من اللوجو (استخدمها كأساس حقيقي): ${logoColors.colors.join(", ")}`
    );
  } else if (questionnaire.preferredColors && questionnaire.preferredColors.length > 0) {
    parts.push(
      `ألوان مفضلة من العميل (لا يوجد لوجو): ${questionnaire.preferredColors.join(", ")}`
    );
  } else {
    parts.push("لا توجد ألوان مقترحة — ابنِ palette من الصفر بناءً على industry و personality.");
  }

  return parts.join("\n");
}

/**
 * يستدعي Gemini API ويرجع الـ raw tokens (قبل الـ post-processing).
 * لو الـ response مش JSON صالح أو ناقص حقول، بيرمي error عشان
 * الـ caller يتعامل معاه (retry أو fallback) بدل ما نمرر بيانات فاسدة.
 *
 * الموديل المستخدم: gemini-3.6-flash — مناسب هنا لأن المهمة (اختيار
 * ألوان وخط من قيود واضحة، إرجاع JSON) لا تحتاج قدرات reasoning
 * معقدة، وGemini Flash متاح مجاناً بحصة يومية سخية (~1500 طلب/يوم)
 * عبر Google AI Studio، وهو كافٍ جداً لحجم الاستخدام المتوقع.
 */
export async function generateRawTokens(
  questionnaire: QuestionnaireInput,
  logoColors?: ExtractedLogoColors
): Promise<RawLLMTokenOutput> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: buildSystemPrompt(questionnaire.designStyle),
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    buildUserPrompt(questionnaire, logoColors)
  );

  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed: RawLLMTokenOutput;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse LLM response as JSON: ${cleaned.slice(0, 200)}`);
  }

  validateRawShape(parsed);
  return parsed;
}

/**
 * تحقق بسيط من شكل الـ response قبل ما نسيبه يكمل لباقي الـ pipeline.
 * مش تحقق كامل من الـ types (ده بيحصل في tokenValidator.ts) — بس تأكيد
 * إن الحقول الأساسية موجودة عشان منكسرش لاحقاً بـ undefined.
 */
function validateRawShape(data: unknown): asserts data is RawLLMTokenOutput {
  if (typeof data !== "object" || data === null) {
    throw new Error("LLM response is not an object");
  }
  const d = data as Record<string, unknown>;
  if (!d.colors || !d.typography) {
    throw new Error("LLM response missing required top-level keys");
  }
  const colors = d.colors as Record<string, unknown>;
  const requiredColors = ["primary", "secondary", "accent", "neutral", "semantic"];
  for (const key of requiredColors) {
    if (!colors[key]) {
      throw new Error(`LLM response missing colors.${key}`);
    }
  }
  const typography = d.typography as Record<string, unknown> | undefined;
  if (!typography?.headingFont || !typography?.bodyFont) {
    throw new Error("LLM response missing typography fields");
  }
}
