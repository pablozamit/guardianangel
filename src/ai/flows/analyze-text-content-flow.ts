
'use server';
/**
 * @fileOverview Analiza un fragmento de texto para determinar si es potencialmente erótico.
 *
 * - analyzeTextContent - Función que maneja el análisis del contenido textual.
 * - AnalyzeTextContentInput - El tipo de entrada para la función analyzeTextContent.
 * - AnalyzeTextContentOutput - El tipo de retorno para la función analyzeTextContent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextContentInputSchema = z.object({
  textContent: z.string().min(10, { message: "El texto debe tener al menos 10 caracteres."}).describe('El fragmento de texto a analizar.'),
});
export type AnalyzeTextContentInput = z.infer<typeof AnalyzeTextContentInputSchema>;

const AnalyzeTextContentOutputSchema = z.object({
  isPotentiallyErotic: z.boolean().describe('Indica si el texto se considera potencialmente erótico.'),
  analysis: z.string().describe('Una breve explicación de por qué el texto fue clasificado de esa manera.'),
  confidenceScore: z.number().min(0).max(1).optional().describe('Un puntaje de confianza opcional (0-1) sobre la clasificación.'),
});
export type AnalyzeTextContentOutput = z.infer<typeof AnalyzeTextContentOutputSchema>;

export async function analyzeTextContent(input: AnalyzeTextContentInput): Promise<AnalyzeTextContentOutput> {
  return analyzeTextContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextContentPrompt',
  input: {schema: AnalyzeTextContentInputSchema},
  output: {schema: AnalyzeTextContentOutputSchema},
  prompt: `Eres un asistente de IA especializado en la moderación de contenido para la aplicación Ángel Guardián. Tu tarea es analizar el siguiente texto proporcionado por el usuario y determinar si es de naturaleza predominantemente erótica o sexualmente explícita.

Texto a analizar:
"{{{textContent}}}"

Considera el contexto, el lenguaje utilizado, las descripciones y el tema general. No seas demasiado sensible; el objetivo es identificar contenido claramente erótico, no simples menciones de romance o cuerpo humano en contextos no sexuales.

Responde con un objeto JSON que incluya:
1.  "isPotentiallyErotic": un booleano (true si es predominantemente erótico, false en caso contrario).
2.  "analysis": una breve explicación (1-2 frases) de tu razonamiento.
3.  "confidenceScore": (opcional) un número entre 0 y 1 indicando tu confianza en la clasificación (ej. 0.9 para alta confianza).

Ejemplo de respuesta si el contenido es erótico:
{
  "isPotentiallyErotic": true,
  "analysis": "El texto contiene descripciones explícitas de actos sexuales y lenguaje sugerente.",
  "confidenceScore": 0.95
}

Ejemplo de respuesta si el contenido NO es erótico:
{
  "isPotentiallyErotic": false,
  "analysis": "El texto describe una escena romántica pero no contiene elementos explícitamente eróticos.",
  "confidenceScore": 0.85
}

Por favor, proporciona tu análisis para el texto ingresado.
`,
  config: { // Ajustar la configuración de seguridad si es necesario para permitir el análisis de este tipo de contenido.
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE', // Esto es crucial para que el LLM pueda procesar y evaluar el contenido potencialmente erótico.
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const analyzeTextContentFlow = ai.defineFlow(
  {
    name: 'analyzeTextContentFlow',
    inputSchema: AnalyzeTextContentInputSchema,
    outputSchema: AnalyzeTextContentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Manejar el caso donde la salida es null o undefined,
      // posiblemente debido a filtros de seguridad del modelo no relacionados con el contenido en sí.
      return {
        isPotentiallyErotic: false,
        analysis: "No se pudo procesar el texto. El contenido podría haber activado filtros de seguridad generales o ser inválido.",
      };
    }
    return output;
  }
);
