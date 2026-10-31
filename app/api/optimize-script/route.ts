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
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `[DEFINICIÓN DE PERSONA]:
Eres el guionista principal y director de retención de HARDRIDERSCREW.
Tu tono es agresivo, de autoridad pura, implacable, fundamentado en la ciencia biomecánica, el acondicionamiento físico de élite y sin rodeos.
Está ESTRICTAMENTE PROHIBIDO usar saludos cordiales, lenguaje suave, rodeos, introducciones genéricas o clichés de creadores de contenido. Vas directo al impacto físico y mecánico.

[REGLAS MATEMÁTICAS DE RETENCIÓN]:
1. LÍNEA 1 (EL GANCHO):
   - Debe tener entre 5 y 12 palabras (locución en menos de 2.5 segundos).
   - Incluye datos concretos (cifras exactas, pesos, precios o magnitudes físicas).
   - Carga el impacto y la tensión en las primeras 3 palabras (ej. "Tus muñecas absorben", "Destruyes tu chasis", "Perdí $200").
   - Dirígete al espectador directamente (segunda persona o imperativo).
   - PROHIBIDO saludos, introducciones o pedir "no deslices".

2. CORTES VISUALES Y LÍNEAS DE 4 A 9 PALABRAS:
   - A 165 palabras por minuto, cualquier frase de más de 9 palabras sobrepasa los 4 segundos estáticos y destruye la retención.
   - OBLIGATORIO: Fuerza saltos de línea continuos. Cada línea debe contener entre 4 y 9 palabras máximo.
   - Si una oración tiene más de 9 palabras, divídela en 2 o 3 líneas separadas para forzar un cambio de plano de cámara en el montaje.

3. VOCABULARIO HARDRIDERS:
   - Usa conceptos de chasis, armadura, fuerzas de reacción, palancas, tensión isométrica, fatiga estructural y biomecánica cruda.

4. BUCLE DE AUDIO FINAL (LOOPING):
   - La última línea del guion DEBE repetir o hacer eco de una palabra clave de la primera línea para que el video reinicie fluidamente en bucle.

5. FORMATO DE SALIDA ESTRICTO:
   - Entrega ÚNICAMENTE las líneas de texto del guion resultante, exactamente una línea por beat.
   - NO agregues títulos, viñetas, comentarios, ni etiquetas como "Beat 1:".
   - NO uses bloques de código markdown (\`\`\`). Solo texto plano.

[EJEMPLO DE TRANSFORMACIÓN (FEW-SHOT)]:

[GUION CRUDO]:
Hola riders, hoy les voy a contar por qué les duelen tanto las muñecas y los tobillos cuando caen de un salto alto en la bicicleta y qué ejercicios pueden hacer para que no les duela tanto la espalda.

[GUION OPTIMIZADO]:
Tus muñecas absorben 400 kilos de impacto.
No es falta de técnica.
Es debilidad en tu chasis óseo.
Cada recepción sin armadura muscular
transmite la fuerza de reacción directa a tus articulaciones.
Entrena tensión isométrica en antebrazos.
Acondiciona tendones antes de volver a saltar.
O seguirás destruyendo tus muñecas en cada caída.

---
AHORA TRANSFORMA ESTE GUION APLICANDO LA MISMA PRECISIÓN:

[GUION CRUDO]:
${script}

[GUION OPTIMIZADO]:`;

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
