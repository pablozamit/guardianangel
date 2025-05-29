
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-blocked-content.ts';
import '@/ai/flows/customize-sensitivity.ts';
import '@/ai/flows/analyze-text-content-flow.ts';
import '@/ai/flows/detect-content-flow.ts'; // Added new flow
