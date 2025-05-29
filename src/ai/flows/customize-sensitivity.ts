'use server';
/**
 * @fileOverview Allows guardians to adjust the sensitivity of the content detection.
 *
 * - customizeSensitivity - A function that handles the customization of content detection sensitivity.
 * - CustomizeSensitivityInput - The input type for the customizeSensitivity function.
 * - CustomizeSensitivityOutput - The return type for the customizeSensitivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeSensitivityInputSchema = z.object({
  sensitivityLevel: z
    .number()
    .min(0)
    .max(1)
    .describe("A value between 0 and 1 representing the sensitivity level, where 0 is the least sensitive and 1 is the most sensitive."),
});
export type CustomizeSensitivityInput = z.infer<typeof CustomizeSensitivityInputSchema>;

const CustomizeSensitivityOutputSchema = z.object({
  success: z.boolean().describe('Whether the sensitivity level was successfully updated.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type CustomizeSensitivityOutput = z.infer<typeof CustomizeSensitivityOutputSchema>;

export async function customizeSensitivity(input: CustomizeSensitivityInput): Promise<CustomizeSensitivityOutput> {
  return customizeSensitivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeSensitivityPrompt',
  input: {schema: CustomizeSensitivityInputSchema},
  output: {schema: CustomizeSensitivityOutputSchema},
  prompt: `You are a configuration expert for the Guardian Angel application.

The guardian wants to adjust the sensitivity of the content detection.  The sensitivity level is {{sensitivityLevel}}, where 0 is the least sensitive and 1 is the most sensitive.

Respond with a JSON object indicating whether the sensitivity level was successfully updated and a message indicating the result of the operation.`, // Added prompt content here
});

const customizeSensitivityFlow = ai.defineFlow(
  {
    name: 'customizeSensitivityFlow',
    inputSchema: CustomizeSensitivityInputSchema,
    outputSchema: CustomizeSensitivityOutputSchema,
  },
  async input => {
    // In a real implementation, this would update the sensitivity setting in a database or configuration file.
    // This example simply returns a success message.
    const {output} = await prompt(input);
    return output!;
  }
);
