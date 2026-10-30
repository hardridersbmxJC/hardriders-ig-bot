import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentWorkspaceId } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY no está configurada en las variables de entorno. Añade GEMINI_API_KEY a tu archivo .env.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const script = typeof body.script === "string" ? body.script.trim() : "";

    if (!script) {
      return NextResponse.json(
        { success: false, error: "El guion a optimizar no puede estar vacío." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Eres un guionista y director de montaje experto en Reels de Instagram con máxima retención.
Reescribe y optimiza el siguiente guion aplicando las reglas de oro de retención algorítmica:

REGLAS ESTRICTAS DE OPTIMIZACIÓN:
1. LÍNEA 1 (EL GANCHO):
   - Debe tener entre 5 y 12 palabras (locución en menos de 2.5 segundos).
   - Incluye datos concretos (cifras, precios en dólares o cantidades).
   - Incluye tensión o advertencia (ej. "deja de", "el peor error", "nunca", "perdí $200").
   - Coloca el impacto en las 3 primeras palabras.
   - Dirígete al espectador directamente (segunda persona o imperativo).
   - PROHIBIDO saludos, presentaciones o pedir "no deslices".

2. CORTES DINÁMICOS (MÁXIMO 4 SEGUNDOS POR LÍNEA):
   - A 165 palabras por minuto, 11 palabras ya superan los 4 segundos estáticos.
   - OBLIGATORIO: Fuerza saltos de línea continuos. Cada línea debe tener entre 4 y 9 palabras máximo.
   - Si una oración tiene más de 9 palabras, divídela en 2 o 3 líneas separadas para obligar a un corte de cámara.

3. BUCLE DE AUDIO (LOOPING):
   - La última línea DEBE repetir una palabra clave de la primera línea para generar retención en reproducción automática.

4. FORMATO DE SALIDA:
   - Entrega ÚNICAMENTE las líneas de texto del guion resultante, exactamente una línea por beat.
   - NO agregues títulos, viñetas, comentarios, ni etiquetas como "Beat 1:".
   - NO uses bloques de código markdown (\`\`\`). Solo texto plano.

GUION ORIGINAL:
${script}

GUION OPTIMIZADO:`;

    const result = await model.generateContent(prompt);
    let optimizedText = result.response.text().trim();

    // Eliminar posibles bloques de markdown residuales
    optimizedText = optimizedText
      .replace(/^```[a-z]*\n/i, "")
      .replace(/\n```$/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    return NextResponse.json({
      success: true,
      optimizedScript: optimizedText,
    });
  } catch (error) {
    console.error("[Optimize Script API] Error:", error);
    const message =
      error instanceof Error ? error.message : "Error al procesar la solicitud con Gemini";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
