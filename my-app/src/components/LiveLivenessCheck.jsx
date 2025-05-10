import React, { useState, useRef, useEffect } from 'react';
import "../Form.css";
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const LiveLivenessCheck = ({ onVerificationComplete, photoBase64 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('initial');
  const [error, setError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = [
          faceapi.nets.tinyFaceDetector,
          faceapi.nets.faceLandmark68Net,
          faceapi.nets.faceRecognitionNet,
          faceapi.nets.faceExpressionNet
        ];

        for (let i = 0; i < models.length; i++) {
          await models[i].loadFromUri(MODEL_URL);
        }

        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading models:', err);
        setModelsLoaded(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!photoBase64) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [photoBase64]);

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !photoBase64 || !modelsLoaded) return;

    try {
      setVerificationStatus('processing');

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      
      const formData = new FormData();
      formData.append('liveImage', blob, 'capture.jpg');
      
      const referenceResponse = await fetch(photoBase64);
      const referenceBlob = await referenceResponse.blob();
      formData.append('referenceImage', referenceBlob, 'reference.jpg');

      const response = await fetch('http://localhost:3000/api/compare-faces', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        if (result.match) {
          setVerificationStatus('success');
          onVerificationComplete(true);
        } else {
          setVerificationStatus('failed');
          onVerificationComplete(false);
        }
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('failed');
      onVerificationComplete(false);
    }
  };

  return (
    <div className="liveness-check">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: isCameraOn ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="controls">
        {verificationStatus === 'initial' && (
          <button 
            onClick={captureAndVerify} 
            disabled={!isCameraOn || !modelsLoaded || !photoBase64}
            className="start-button"
          >
            Start Verification
          </button>
        )}
        {verificationStatus === 'processing' && (
          <div className="verification-status comparing">
            <div className="loading-animation">
              <div className="face-scan">
                <div className="scan-circle"></div>
                <div className="face-outline">👤</div>
                <div className="scan-line"></div>
              </div>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
            <p>Scanning your face for verification</p>
          </div>
        )}
        {verificationStatus === 'success' && (
          <div className="verification-status success">
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
              <div className="success-message">Face Verification Successful!</div>
            </div>
            <button 
              className="next-button"
              onClick={() => onVerificationComplete(true)}
            >
              Proceed to Next Step
            </button>
          </div>
        )}
        {verificationStatus === 'failed' && (
          <div>
            <div className="verification-status failed">
              ❌ Face verification failed
            </div>
            <button onClick={captureAndVerify} className="retry-button">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLivenessCheck;



// import React, { useRef, useState } from "react";

// const LiveLivenessCheckWithCompare = ({ panFilename }) => {
//   const videoRef = useRef(null);
//   const [captured, setCaptured] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error("Failed to access webcam:", err);
//     }
//   };

//   const captureImage = () => {
//     if (!videoRef.current) return;
//     const canvas = document.createElement("canvas");
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//     const dataUrl = canvas.toDataURL("image/jpeg");
//     setCaptured(dataUrl);
//   };

//   const handleCompare = async () => {
//     if (!captured || !panFilename) return alert("Both images are required!");

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/compare-faces", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           selfieDataUrl: captured,
//           panFile: panFilename
//         })
//       });

//       const result = await response.json();
//       console.log(result);

//       if (result.success && result.match) {
//         alert("✅ Face match successful!");
//       } else {
//         alert("❌ Face does not match.");
//       }
//     } catch (error) {
//       console.error("Error comparing faces:", error);
//       alert("Server error during face comparison.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="liveness-check">
//       {!captured ? (
//         <>
//           <video ref={videoRef} autoPlay playsInline width="300" height="225" />
//           <button type="button" onClick={startCamera}>Start Camera</button>
//           <button type="button" onClick={captureImage}>Capture</button>
//         </>
//       ) : (
//         <div>
//           <p>Selfie captured</p>
//           <img src={captured} alt="Captured Selfie" width="200" />
//           <button type="button" onClick={handleCompare} disabled={loading}>
//             {loading ? "Comparing..." : "Compare with PAN"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LiveLivenessCheckWithCompare;



// // LiveLivenessCheck.jsx
// import React, { useRef, useState } from "react";

// const LiveLivenessCheck = ({ onCapture }) => {
//   const videoRef = useRef(null);
//   const [captured, setCaptured] = useState(null);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error("Failed to access webcam:", err);
//     }
//   };

//   const captureImage = () => {
//     if (!videoRef.current) return;
//     const canvas = document.createElement("canvas");
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//     const dataUrl = canvas.toDataURL("image/jpeg");
//     setCaptured(dataUrl);
//     if (onCapture) onCapture(dataUrl);
//   };

//   return (
//     <div className="liveness-check">
//       {!captured ? (
//         <>
//           <video ref={videoRef} autoPlay playsInline width="300" height="225" />
//           <button type="button" onClick={startCamera}>Start Camera</button>
//           <button type="button" onClick={captureImage}>Capture</button>
//         </>
//       ) : (
//         <div>
//           <p>Selfie captured</p>
//           <img src={captured} alt="Captured Selfie" width="200" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default LiveLivenessCheck;





  // 

  // const handleCompare = async () => {
  //   const selfieFilename = 'photoFile-name.jpg'; // Get from upload response or context
  //   const panFilename = 'panCardFile-name.jpg';  // Get from upload response or context
  
  //   const response = await fetch('http://localhost:5000/api/compare-faces', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ selfieFile: selfieFilename, panFile: panFilename })
  //   });
  
  //   const result = await response.json();
  //   console.log(result);
  
  //   if (result.success && result.match) {
  //     alert("Face match successful!");
  //   } else {
  //     alert("Face does not match.");
  //   }
  // };
  