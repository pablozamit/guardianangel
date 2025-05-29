// SummarizeBlockedContent story implementation.

'use server';

/**
 * @fileOverview Summarizes the content blocked by the app on a daily basis.
 *
 * - summarizeBlockedContent - A function that handles the summarization of blocked content.
 * - SummarizeBlockedContentInput - The input type for the summarizeBlockedContent function.
 * - SummarizeBlockedContentOutput - The return type for the summarizeBlockedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBlockedContentInputSchema = z.object({
  blockedContent: z
    .array(z.string())
    .describe('An array of descriptions of the content that was blocked.'),
});
export type SummarizeBlockedContentInput = z.infer<typeof SummarizeBlockedContentInputSchema>;

const SummarizeBlockedContentOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the type of content that was blocked, including the categories and any notable trends.'
    ),
});
export type SummarizeBlockedContentOutput = z.infer<typeof SummarizeBlockedContentOutputSchema>;

export async function summarizeBlockedContent(
  input: SummarizeBlockedContentInput
): Promise<SummarizeBlockedContentOutput> {
  return summarizeBlockedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBlockedContentPrompt',
  input: {schema: SummarizeBlockedContentInputSchema},
  output: {schema: SummarizeBlockedContentOutputSchema},
  prompt: `You are an AI assistant helping a guardian understand the content blocked by the Guardian Angel app.

You will receive a list of descriptions of content that was blocked by the app.

Based on this information, provide a summary of the type of content that was blocked, including the categories and any notable trends.

Blocked Content: {{{blockedContent}}}
`,
});

const summarizeBlockedContentFlow = ai.defineFlow(
  {
    name: 'summarizeBlockedContentFlow',
    inputSchema: SummarizeBlockedContentInputSchema,
    outputSchema: SummarizeBlockedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
