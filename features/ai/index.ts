import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
    apikey: process.env.OPENROUTER_API_KEY

});