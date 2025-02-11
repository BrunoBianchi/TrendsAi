import * as dotenv from "dotenv";
dotenv.config();

import ai from "./modules/open-ai";
const openai = new ai();
import cron from "node-cron";
import leonardo from "./modules/leonardo-ai-main";
import generateVideo from "./modules/ffmpeg";

import { google } from "googleapis";
import fs from "fs";

// Configuração do OAuth2 para a API do YouTube
const CLIENT_ID = process.env.client_id;             // Ex: 'seu_client_id'
const CLIENT_SECRET = process.env.client_secret;         // Ex: 'seu_client_secret'
const REDIRECT_URI = process.env.redirect_uri;           // Ex: 'http://localhost:3000/oauth2callback'

// Cria o cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Lê e define o token salvo (token.json deve conter o token obtido via OAuth2)
const token = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
oauth2Client.setCredentials(token);

// Cria a instância da API YouTube com as credenciais
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// Função para fazer o upload do vídeo para o YouTube (Short)
// O vídeo deve ter duração inferior a 60 segundos para ser considerado um Short
async function uploadToYouTubeShorts(videoPath: string, title: string): Promise<string> {
  try {
    const fileSize = fs.statSync(videoPath).size;
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title,
          description: 'Video gerado com IA e publicado via API',
          tags: ['shorts']
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: true
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    }, {
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`${Math.round(progress)}% enviado`);
      }
    });
    console.log('Vídeo enviado com sucesso:', response.data.id);
    return response.data.id as string;
  } catch (error) {
    console.error('Erro ao fazer upload para o YouTube:', error);
    throw error;
  }
}

// Pipeline de processamento: busca tendências, gera imagens, animações, gera o vídeo e faz o upload
async function processPipeline() {
    try {
      // Obtém as tendências do dia (ex.: título e imagens)
      const res = await openai.getTodaysTreding();
      console.log("Tendências obtidas:", res);
  
      // Processa as imagens para gerar as animações (URLs dos vídeos gerados)
      const videoUrls = await Promise.all(
        res.images.map(async (image: any) => {
          const imageId = await leonardo.generateAndGetImage(res.videoTitle, image.description);
          const motion = await leonardo.generateMotion(imageId[0]);
  
          // Aguarda 2 minutos para a geração da animação
          await new Promise(resolve => setTimeout(resolve, 120000));
          console.log("Motion gerado:", motion);
  
          const motionUrl = await leonardo.getMotion(motion.motionSvdGenerationJob.generationId);
          return motionUrl[0]; // Retorna a URL da animação
        })
      );
  
      // Gera o vídeo a partir das URLs processadas
      await generateVideo(videoUrls);
      await new Promise(resolve => setTimeout(resolve, 320000));
      // Define o caminho do vídeo gerado e o título
      const videoPath = './assets/outvideos/output.mp4';
      const title = res.videoTitle || 'YouTube Short gerado';
  
      // Faz o upload do vídeo para o YouTube
      const videoId = await uploadToYouTubeShorts(videoPath, title);
      console.log("ID do vídeo enviado:", videoId);
    } catch (error) {
      console.error("Erro no processamento:", error);
    }
  }
  
  // Agenda a execução do job 4 vezes ao dia (às 00h, 06h, 12h e 18h)
  // A expressão '0 0,6,12,18 * * *' indica: no minuto 0, nos horários 0, 6, 12 e 18 de cada dia.


(async () => { 
    console.log("Iniciando pipeline...");
    await processPipeline();
})();
  cron.schedule('0 0,6,12,18 * * *', async () => {
    console.log("Cron job iniciado:", new Date().toISOString());
    await processPipeline();
  });
  
  console.log("Scheduler iniciado. O job será executado 4 vezes por dia.");