const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

// Start the server
console.log('Starting server...');
const server = spawn('node', ['index.js'], {
  stdio: 'inherit'
});

// Function to check if server is ready
async function waitForServer() {
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await axios.get('http://localhost:3000/api/health');
      console.log('Server is ready!');
      return true;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        console.error('Server failed to start after', maxAttempts * 2, 'seconds');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Main test sequence
async function runTests() {
  try {
    // Wait for server to be ready
    const serverReady = await waitForServer();
    if (!serverReady) {
      console.error('Server failed to start. Exiting...');
      server.kill();
      process.exit(1);
    }

    console.log('\nGenerating test images...');
    // Generate test images
    const generateImages = spawn('node', ['generate-test-images.js'], {
      stdio: 'inherit'
    });

    generateImages.on('close', (code) => {
      if (code === 0) {
        console.log('\nRunning tests...');
        // Run the tests
        const tests = spawn('node', ['test-endpoints.js'], {
          stdio: 'inherit'
        });

        tests.on('close', (code) => {
          console.log('\nTests completed with code:', code);
          // Kill the server
          server.kill();
          process.exit(code);
        });
      } else {
        console.error('Failed to generate test images');
        server.kill();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    server.kill();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill();
  process.exit();
});

// Start the test sequence
runTests(); 