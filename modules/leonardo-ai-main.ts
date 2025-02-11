import generateImages from "./leonardo-ai/generate-images";
import generateMotion from "./leonardo-ai/generate-motion";
const apiKey = process.env.leonardo_api_key;

class leonardo {

    public async generateAndGetImage(title:string,image_description:string) {
        return await generateImages(title,image_description)
      }
      public async generateMotion(image_id:string) { 
        	return await generateMotion(image_id)
      }
      public async getMotion(image_id:string) { 
       const response =  await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${image_id}`,{
            method: 'GET',	
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            }
        }).then(res=>res.json())
        return response.generations_by_pk.generated_images.map((motion:any) => { 
            return motion.motionMP4URL
        })
      }
}

export default new leonardo();