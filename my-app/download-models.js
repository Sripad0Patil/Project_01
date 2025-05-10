import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    binary: false
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    binary: true
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    binary: false
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    binary: true
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
    binary: false
  },
  {
    name: 'face_recognition_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1',
    binary: true
  },
  {
    name: 'face_expression_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
    binary: false
  },
  {
    name: 'face_expression_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
    binary: true
  }
];

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const downloadFile = (model) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, model.name);
    const file = fs.createWriteStream(filePath);

    https.get(model.url, response => {
      if (model.binary) {
        response.setEncoding('binary');
      }

      let data = '';
      response.on('data', chunk => {
        if (model.binary) {
          data += chunk;
        } else {
          data += chunk.toString();
        }
      });

      response.on('end', () => {
        if (model.binary) {
          fs.writeFileSync(filePath, data, 'binary');
        } else {
          fs.writeFileSync(filePath, data);
        }
        console.log(`Downloaded ${model.name}`);
        resolve();
      });

    }).on('error', err => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${model.name}:`, err.message);
      reject(err);
    });
  });
};

// Download files sequentially to avoid any race conditions
async function downloadModels() {
  for (const model of models) {
    try {
      await downloadFile(model);
    } catch (err) {
      console.error(`Failed to download ${model.name}:`, err);
    }
  }
}

downloadModels(); 