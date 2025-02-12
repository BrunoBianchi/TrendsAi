"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generate_images_1 = __importDefault(require("./leonardo-ai/generate-images"));
const generate_motion_1 = __importDefault(require("./leonardo-ai/generate-motion"));
const apiKey = process.env.leonardo_api_key;
class leonardo {
    async generateAndGetImage(title, image_description) {
        return await (0, generate_images_1.default)(title, image_description);
    }
    async generateMotion(image_id) {
        return await (0, generate_motion_1.default)(image_id);
    }
    async getMotion(image_id) {
        const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${image_id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        }).then(res => res.json());
        return response.generations_by_pk.generated_images.map((motion) => {
            return motion.motionMP4URL;
        });
    }
}
exports.default = new leonardo();
