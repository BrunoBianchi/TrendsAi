"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateImages;
const apiKey = process.env.leonardo_api_key;
async function generateImages(title, image_description) {
    const generationData = {
        height: 512,
        modelId: "1dd50843-d653-4516-a8e3-f0238ee453ff",
        contrast: 3,
        num_images: 1,
        prompt: `${image_description}`,
        width: 512,
    };
    try {
        // 1. Gerar a imagem (primeira requisição POST)
        const generationResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(generationData)
        });
        if (!generationResponse.ok) {
            throw new Error(`Erro na geração da imagem HTTP! status: ${generationResponse.status}`);
        }
        const generationJsonResponse = await generationResponse.json();
        const generationId = generationJsonResponse.sdGenerationJob.generationId; // Extrai o generationId
        // Aguardar alguns segundos para a imagem ser gerada (opcional, mas recomendado)
        await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos
        // 2. Obter a imagem gerada (segunda requisição GET)
        const getImageResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            }
        });
        if (!getImageResponse.ok) {
            throw new Error(`Erro ao obter a imagem HTTP! status: ${getImageResponse.status}`);
        }
        const getImageJsonResponse = await getImageResponse.json();
        return getImageJsonResponse.generations_by_pk.generated_images.map((image) => {
            return image.id;
        });
    }
    catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}
