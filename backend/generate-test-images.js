const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Create test-images directory if it doesn't exist
const testImagesDir = path.join(__dirname, 'test-images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
}

// Function to create a dummy face image
async function createDummyFaceImage(filename, width = 800, height = 800) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Draw face shape (more realistic oval)
  const centerX = width / 2;
  const centerY = height / 2;
  const faceWidth = width * 0.4;
  const faceHeight = height * 0.5;

  // Create face gradient
  const faceGradient = ctx.createRadialGradient(
    centerX - faceWidth * 0.1, centerY - faceHeight * 0.1, 5,
    centerX, centerY, faceWidth
  );
  faceGradient.addColorStop(0, '#ffe0bd');
  faceGradient.addColorStop(0.5, '#ffcd94');
  faceGradient.addColorStop(1, '#eac086');

  // Draw face base
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, faceWidth / 2, faceHeight / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = faceGradient;
  ctx.fill();

  // Add face shading
  const shadowGradient = ctx.createRadialGradient(
    centerX + faceWidth * 0.2, centerY, 0,
    centerX + faceWidth * 0.2, centerY, faceWidth * 0.8
  );
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = shadowGradient;
  ctx.fill();

  // Draw eyes
  const eyeWidth = faceWidth * 0.15;
  const eyeHeight = faceHeight * 0.08;
  const eyeY = centerY - faceHeight * 0.1;

  // Left eye
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.ellipse(centerX - faceWidth * 0.25, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left iris
  ctx.beginPath();
  ctx.fillStyle = '#4b2c20';
  ctx.ellipse(centerX - faceWidth * 0.25, eyeY, eyeWidth * 0.5, eyeHeight * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left pupil
  ctx.beginPath();
  ctx.fillStyle = '#000000';
  ctx.ellipse(centerX - faceWidth * 0.25, eyeY, eyeWidth * 0.25, eyeHeight * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.ellipse(centerX + faceWidth * 0.25, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Right iris
  ctx.beginPath();
  ctx.fillStyle = '#4b2c20';
  ctx.ellipse(centerX + faceWidth * 0.25, eyeY, eyeWidth * 0.5, eyeHeight * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right pupil
  ctx.beginPath();
  ctx.fillStyle = '#000000';
  ctx.ellipse(centerX + faceWidth * 0.25, eyeY, eyeWidth * 0.25, eyeHeight * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw eyebrows
  ctx.strokeStyle = '#4b2c20';
  ctx.lineWidth = 4;

  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX - faceWidth * 0.4, eyeY - eyeHeight * 2);
  ctx.quadraticCurveTo(
    centerX - faceWidth * 0.25,
    eyeY - eyeHeight * 2.5,
    centerX - faceWidth * 0.1,
    eyeY - eyeHeight * 2
  );
  ctx.stroke();

  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX + faceWidth * 0.4, eyeY - eyeHeight * 2);
  ctx.quadraticCurveTo(
    centerX + faceWidth * 0.25,
    eyeY - eyeHeight * 2.5,
    centerX + faceWidth * 0.1,
    eyeY - eyeHeight * 2
  );
  ctx.stroke();

  // Draw nose
  ctx.beginPath();
  ctx.strokeStyle = '#deb887';
  ctx.lineWidth = 3;
  const noseY = centerY + faceHeight * 0.1;
  ctx.moveTo(centerX, eyeY + eyeHeight * 2);
  ctx.quadraticCurveTo(
    centerX + faceWidth * 0.1,
    noseY,
    centerX,
    noseY
  );
  ctx.quadraticCurveTo(
    centerX - faceWidth * 0.1,
    noseY,
    centerX,
    noseY
  );
  ctx.stroke();

  // Draw mouth
  const mouthY = centerY + faceHeight * 0.2;
  ctx.beginPath();
  ctx.strokeStyle = '#cc9999';
  ctx.lineWidth = 3;
  ctx.moveTo(centerX - faceWidth * 0.2, mouthY);
  ctx.quadraticCurveTo(
    centerX,
    mouthY + faceHeight * 0.05,
    centerX + faceWidth * 0.2,
    mouthY
  );
  ctx.stroke();

  // Add lips
  ctx.beginPath();
  ctx.fillStyle = '#cc9999';
  ctx.moveTo(centerX - faceWidth * 0.2, mouthY);
  ctx.quadraticCurveTo(
    centerX,
    mouthY + faceHeight * 0.05,
    centerX + faceWidth * 0.2,
    mouthY
  );
  ctx.quadraticCurveTo(
    centerX,
    mouthY + faceHeight * 0.02,
    centerX - faceWidth * 0.2,
    mouthY
  );
  ctx.fill();

  // Add cheeks
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 150, 150, 0.2)';
  ctx.ellipse(centerX - faceWidth * 0.3, centerY + faceHeight * 0.1, faceWidth * 0.15, faceHeight * 0.1, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + faceWidth * 0.3, centerY + faceHeight * 0.1, faceWidth * 0.15, faceHeight * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Add face contour
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 2;
  ctx.ellipse(centerX, centerY, faceWidth / 2, faceHeight / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Save with high quality
  const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
  fs.writeFileSync(path.join(testImagesDir, filename), buffer);
}

// Function to create a dummy document image
async function createDummyDocumentImage(filename, type, width = 800, height = 600) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Add document type text
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText(type.toUpperCase(), width/2, 50);

  // Add dummy content based on document type
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Name: John Doe`, 50, 100);
  ctx.fillText(`ID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 50, 130);
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 50, 160);

  // Add a small face photo to the document
  const photoSize = height/3;
  await createDummyFaceImage('temp-face.jpg', photoSize, photoSize);
  const faceImage = await loadImage(path.join(testImagesDir, 'temp-face.jpg'));
  ctx.drawImage(faceImage, width - photoSize - 50, 50, photoSize, photoSize);
  fs.unlinkSync(path.join(testImagesDir, 'temp-face.jpg'));

  // Save with high quality
  const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
  fs.writeFileSync(path.join(testImagesDir, filename), buffer);
}

// Function to create a dummy signature
async function createDummySignature(filename, width = 400, height = 200) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw signature
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 100);
  ctx.bezierCurveTo(100, 50, 200, 150, 350, 100);
  ctx.stroke();

  // Save with high quality
  const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
  fs.writeFileSync(path.join(testImagesDir, filename), buffer);
}

// Generate all test images
async function generateTestImages() {
  console.log('Generating test images...');

  // Generate face images
  await createDummyFaceImage('test-face.jpg');
  await createDummyFaceImage('live-face.jpg');
  await createDummyFaceImage('photo.jpg', 400, 500); // Passport photo size

  // Generate document images
  await createDummyDocumentImage('aadhaarCard.jpg', 'Aadhaar Card');
  await createDummyDocumentImage('panCard.jpg', 'PAN Card');
  await createDummyDocumentImage('pan-card.jpg', 'PAN Card'); // Duplicate for verification

  // Generate signature
  await createDummySignature('signature.jpg');

  console.log('Test images generated successfully in:', testImagesDir);
}

// Run the generation
generateTestImages().catch(console.error); 