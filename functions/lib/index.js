"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askClaude = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const anthropicKey = (0, params_1.defineSecret)('ANTHROPIC_KEY');
exports.askClaude = (0, https_1.onCall)({ secrets: [anthropicKey], cors: true, region: 'us-central1' }, async (request) => {
    var _a, _b, _c;
    const { question, tools } = request.data;
    if (!(question === null || question === void 0 ? void 0 : question.trim()))
        throw new https_1.HttpsError('invalid-argument', 'question is required');
    if (!(tools === null || tools === void 0 ? void 0 : tools.length))
        throw new https_1.HttpsError('invalid-argument', 'tools list is required');
    const key = anthropicKey.value();
    const toolList = tools.map(t => `${t.name} (${t.cat}): ${t.desc}`).join('\n');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 350,
            messages: [{
                    role: 'user',
                    content: `Você é um assistente do FormCraft que recomenda ferramentas digitais.\n\nFerramentas disponíveis:\n${toolList}\n\nPergunta do usuário: "${question}"\n\nRecomende de 1 a 3 ferramentas da lista acima que resolvem melhor a dor do usuário. Responda em português, de forma direta. Para cada ferramenta recomendada, cite o nome EXATAMENTE como está na lista e explique em uma frase curta por quê ela ajuda. Não invente ferramentas fora da lista.`,
                }],
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new https_1.HttpsError('internal', `Claude API error: ${err}`);
    }
    const data = await res.json();
    return { answer: (_c = (_b = (_a = data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : '' };
});
//# sourceMappingURL=index.js.map