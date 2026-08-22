import { Vibrant } from "node-vibrant/node";
import { ExtractedLogoColors } from "./types";

/**
 * يستخرج الألوان المسيطرة من صورة اللوجو باستخدام node-vibrant.
 *
 * ليه node-vibrant تحديداً: بيرجع "swatches" مصنفة (Vibrant, Muted,
 * DarkVibrant, LightVibrant, DarkMuted, LightMuted) مبنية على تحليل
 * فعلي للألوان المميزة في الصورة — مش مجرد average pixel color اللي
 * غالباً بيطلع رمادي باهت مع اللوجوهات (لأنها بتحتوي عادة على مساحات
 * بيضاء/شفافة كبيرة حوالين العناصر الملونة).
 *
 * الفلترة هنا بتشيل الـ swatches اللي مش موجودة (node-vibrant ممكن
 * ترجع null لبعض الأنواع لو الصورة مفيهاش تنوع كافٍ)، وبترتب النتيجة
 * من الأكثر تميزاً (Vibrant) للأقل، عشان أول لون في المصفوفة يبقى
 * أقوى مرشح لـ primary.
 *
 * @param imageBuffer - محتوى ملف اللوجو كـ Buffer (من الـ upload مباشرة)
 * @returns 3-5 ألوان hex، أو مصفوفة فاضية لو فشل الاستخراج
 */
export async function extractLogoColors(
  imageBuffer: Buffer
): Promise<ExtractedLogoColors> {
  try {
    const palette = await Vibrant.from(imageBuffer).getPalette();

    // الترتيب ده مقصود: بنفضل الألوان "الحية" الأول لأنها الأنسب
    // لتكون primary/accent، والـ muted/dark كـ fallback أو secondary
    const orderedSwatchKeys = [
      "Vibrant",
      "DarkVibrant",
      "LightVibrant",
      "Muted",
      "DarkMuted",
      "LightMuted",
    ] as const;

    const colors: string[] = [];
    for (const key of orderedSwatchKeys) {
      const swatch = palette[key];
      if (swatch) {
        colors.push(swatch.hex);
      }
      if (colors.length >= 5) break;
    }

    return { colors };
  } catch (err) {
    // لو الاستخراج فشل (صورة تالفة، format غير مدعوم، إلخ)، منوقفش
    // الـ pipeline كله — بنرجع مصفوفة فاضية والـ caller (route.ts)
    // هيكمل من غير logoColors (fallback موجود في llmPrompt.ts أصلاً)
    console.error("Logo color extraction failed:", err);
    return { colors: [] };
  }
}
