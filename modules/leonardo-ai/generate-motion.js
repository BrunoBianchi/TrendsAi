"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateMotion;
const apiKey = process.env.leonardo_api_key;
async function generateMotion(image_id) {
    const generationData = {
        imageId: image_id,
        motionStrength: 2,
        isPublic: true
    };
    const generationResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd ', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer a77f070b-842c-44a8-9ba6-943813dbcaa1`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(generationData)
    }).then(res => res.json());
    return generationResponse;
}
