import ffmpeg from 'fluent-ffmpeg';

// Configure FFmpeg path
ffmpeg.setFfmpegPath('C:\\users\\Bruno\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-7.1-essentials_build\\bin\\ffmpeg.exe');

const outputPath = './assets/outvideos/output.mp4';
const audioPath = './assets/soundtrack/dark-fantasy.mp3';

// Função que gera o vídeo concatenando os vídeos informados e adiciona áudio,
// adaptando-os para o formato vertical ideal para o TikTok (1080x1920)
export default async function generateVideo(videos: string[]) {
  let filterCommands: string[] = [];
  let inputStreams: string[] = [];

  // Para cada vídeo, aplica o filtro que redimensiona e preenche (pad) para 1080x1920
  videos.forEach((_, index) => {
    filterCommands.push(
      `[${index}:v]scale=1080:1920:force_original_aspect_ratio=decrease,` +
      `pad=1080:1920:(1080-iw)/2:(1920-ih)/2[vid${index}]`
    );
    inputStreams.push(`[vid${index}]`);
  });

  // Concatena os vídeos (apenas vídeo, sem áudio)
  filterCommands.push(
    `${inputStreams.join('')}concat=n=${videos.length}:v=1:a=0[v]`,
    // O áudio é o próximo input após os vídeos, logo o índice é "videos.length"
    `[${videos.length}:a]apad[a]`
  );

  const command = ffmpeg();

  // Adiciona os vídeos como inputs
  videos.forEach(video => {
    command.input(video);
  });
  
  // Adiciona o áudio como input
  command.input(audioPath);

  command
    .complexFilter(filterCommands)
    .outputOptions([
      '-map [v]',         // Mapeia o stream de vídeo processado
      '-map [a]',         // Mapeia o stream de áudio processado
      '-t 15',            // Limita o output a 15 segundos
      '-shortest',
      '-movflags +faststart'
    ])
    .videoCodec('libx264')
    .audioCodec('aac')
    .fps(60)
    .on('start', () => {
      console.log('Starting processing...');
    })
    .on('progress', (progress: any) => {
      console.log(`Processing: ${Math.floor(progress.percent)}% complete`);
    })
    .on('error', (err) => {
      console.error('Error:', err.message);
    })
    .on('end', () => {
      console.log('Processing completed successfully!');
    })
    .save(outputPath)
}
