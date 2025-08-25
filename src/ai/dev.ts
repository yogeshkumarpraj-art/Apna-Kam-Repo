
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-search.ts';
import '@/ai/flows/skill-suggestion.ts';
import '@/ai/flows/generate-blog-post.ts';
import '@/ai/tools/worker-search.ts';
