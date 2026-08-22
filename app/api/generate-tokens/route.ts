import { NextRequest, NextResponse } from "next/server";
import { extractLogoColors } from "@/lib/colorExtraction";
import { generateRawTokens } from "@/lib/llmPrompt";
import { buildFinalTokens } from "@/lib/tokenValidator";
import { QuestionnaireInput } from "@/lib/types";

/**
 * POST /api/generate-tokens
 *
 * Body: multipart/form-data
 *   - questionnaire: JSON string مطابق لـ QuestionnaireInput
 *   - logo: File (اختياري)
 *
 * الـ pipeline بالترتيب:
 * 1. لو فيه logo → استخراج ألوان (لو فشل، بنكمل من غيرها — مش نوقف الطلب)
 * 2. استدعاء الـ LLM للحصول على raw colors + fonts
 * 3. Post-processing: WCAG fix + shade scales + radius/shadow من الـ preset
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const questionnaireRaw = formData.get("questionnaire");
    if (!questionnaireRaw || typeof questionnaireRaw !== "string") {
      return NextResponse.json(
        { success: false, error: "questionnaire field is required" },
        { status: 400 }
      );
    }

    let questionnaire: QuestionnaireInput;
    try {
      questionnaire = JSON.parse(questionnaireRaw);
    } catch {
      return NextResponse.json(
        { success: false, error: "questionnaire must be valid JSON" },
        { status: 400 }
      );
    }

    if (!questionnaire.designStyle || !questionnaire.industry) {
      return NextResponse.json(
        { success: false, error: "designStyle and industry are required" },
        { status: 400 }
      );
    }

    // Step 1: Logo color extraction (اختياري، failure-tolerant)
    let logoColors;
    const logoFile = formData.get("logo");
    if (logoFile && logoFile instanceof File) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      logoColors = await extractLogoColors(buffer);
      // لو الاستخراج رجع مصفوفة فاضية (فشل صامت)، منبعتش logoColors خالص
      // عشان llmPrompt.ts يعتبرها "مفيش لوجو" ويستخدم الـ fallback logic
      if (logoColors.colors.length === 0) {
        logoColors = undefined;
      }
    }

    // Step 2: LLM call
    const rawTokens = await generateRawTokens(questionnaire, logoColors);

    // Step 3: Post-processing (deterministic)
    const finalTokens = buildFinalTokens(rawTokens, questionnaire);

    return NextResponse.json({ success: true, tokens: finalTokens });
  } catch (err) {
    console.error("generate-tokens error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to generate tokens: ${message}` },
      { status: 500 }
    );
  }
}
