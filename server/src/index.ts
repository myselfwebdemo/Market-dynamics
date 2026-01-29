import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
// console.log("API KEY:", !!process.env.OAAK);

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OAAK,
});

app.post('/api/classify', async (req: any, res: any) => {
    const { externalityQuery, market_structure, industry } = req.body;

    const prompt = `
        JSON:type:no_effect/positive/negative,
        demand:decrease/increase/no_impact,
        supply:decrease/increase/no_impact,
        effect:float range -1.00 to +1.00 inclusive
        Ext:${externalityQuery}
        Mkt:${market_structure}
        Ind:${industry}
    `;

    try {
        const response = await client.responses.create({
            model: 'gpt-4.1-nano',
            input: [
                { role: 'system', content: 'Classify economic externality in JSON only' },
                { role: 'user', content: prompt }
            ]
        });

        res.json(response.output_text);
    } catch (err: any) {
        res.status(err.status).json({ ErrorAPI: err.error.message });
    }
});

app.listen(3000, () => {
  console.log('⊢𐫰𐫰 Run started 𐫰𐫰⊣');
});

