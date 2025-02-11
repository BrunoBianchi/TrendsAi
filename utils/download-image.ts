import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export default async function download (url:string,name:string) {
    const stream = fs.createWriteStream(`${name}.jpg`);
    const { body } = await fetch('https://example.com');
    await finished(Readable.fromWeb(body as any).pipe(stream));
}