import {
  env,
  AutoTokenizer,
  AutoProcessor,
  SiglipTextModel,
  SiglipVisionModel,
  RawImage,
} from '@huggingface/transformers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

env.allowLocalModels = false;
env.allowRemoteModels = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_ID = 'Xenova/siglip-base-patch16-224';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/api/cameras?limit=20';

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function main() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`API unavailable (${res.status}): start tauri-backend first`);
  }
  const json = await res.json();
  const cameras = json.data.filter((c) => c.description_en);
  console.log(`Loaded ${cameras.length} cameras with description_en.`);

  const options = { dtype: 'q8' };
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
  const processor = await AutoProcessor.from_pretrained(MODEL_ID);
  const textModel = await SiglipTextModel.from_pretrained(MODEL_ID, options);
  const visionModel = await SiglipVisionModel.from_pretrained(MODEL_ID, options);

  const textInputs = await tokenizer(
    cameras.map((c) => c.description_en),
    { padding: 'max_length', truncation: true },
  );
  const { pooler_output: textOutput } = await textModel(textInputs);
  const dim = textOutput.dims[1];
  const textVecs = cameras.map((_, i) => Array.from(textOutput.data.slice(i * dim, (i + 1) * dim)));

  const mediaDir = path.resolve(__dirname, '../../tauri-backend/static/media');
  for (let idx = 0; idx < cameras.length; idx += 1) {
    const cam = cameras[idx];
    const filename = path.basename(cam.image_url || `camera_${cam.id}.jpg`);
    const imgPath = path.join(mediaDir, filename);
    const img = await RawImage.read(imgPath);
    const imgInputs = await processor(img);
    const { pooler_output: imgOut } = await visionModel(imgInputs);
    const imgVec = Array.from(imgOut.data);

    const scored = cameras
      .map((c, j) => ({ model: c.model_name, score: cosineSimilarity(imgVec, textVecs[j]) }))
      .sort((a, b) => b.score - a.score);

    console.log(`\nImage [${filename}] (${cam.model_name}):`);
    scored.forEach((s, rank) => {
      console.log(`  #${rank + 1} ${s.model}: ${s.score.toFixed(4)}`);
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
