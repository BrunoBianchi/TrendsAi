import OpenAI from "openai";
export default class ai extends OpenAI {
    constructor() {
        super({ apiKey: process.env.open_ai_api_key });
    }
    public async getTodaysTreding() { 
        const completion = await this.chat.completions.create({
            model: "gpt-4o",
            store: true,
            messages: [
                {"role": "user", "content": 
                    `Generate a viral TikTok video concept that reimagines ANY chosen theme as dark fantasy. Follow these rules:  

1. **Core Instruction**:  
   - Transform the user's suggested theme into medieval dark fantasy while preserving its core identity  
   - All 6 images must exclusively feature elements from the transformed theme  
   - All images must have at least one character and show their faces
   - Use a theme from a series,movie,cartoon or any other media but it doenst have to be the main theme, it can be dragon, mediavel, famous actors and etc...
   - all images must have a related landscape of the theme
   - try not to repeat the same theme 

2. **Output Format**:  
   WITHOUT ANY COMENTS!
   - Format must work with json, so make it right
   - it must be like the following without any special chars !
   - no character 2E in ascii
   -  no json , no comments, no special chars, no spaces, no new lines, no tabs, no nothing
   - Just the txt
   {  
     "videoTitle": "Dark Fantasy [Original Theme Name] Imagine by AI: [Epic Subtitle] #FantasyRemix",  
     "videoTags":"#Tags related to the theme",
     "images": [  
       {  
         "description": "[Camera technique] of [dark fantasy version of theme's element 1]. Must include:\\n1) [Medievalized texture]\\n2) [Supernatural twist]\\n3) [Theme-specific weapon/tool]\\nLighting: [Dark fantasy effect]\\nMotion: [Fantastical movement]"  
       }  
     ]  
   }  
   `}
            ] 
        });
        const content = completion.choices[0]?.message?.content;
        console.log(content )
        return JSON.parse(content? content : "{}");
    }

}



