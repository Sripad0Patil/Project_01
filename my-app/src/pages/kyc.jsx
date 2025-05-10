
import React, { useState, useRef } from "react";
import "../Form.css";

function KYC({ name, phone, setStep }) {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState(""); // Added PAN number state
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [kycResult, setKycResult] = useState(null);
  const [dragActive, setDragActive] = useState({
    aadhaar: false,
    photo: false,
    panCard: false,
    signature: false
  });

  // References for file inputs
  const aadhaarInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const panCardInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const kycData = new FormData();
    kycData.append("name", name);
    kycData.append("phone", phone);
    kycData.append("aadhaarNumber", aadhaarNumber);
    kycData.append("panNumber", panNumber); // Added PAN number to form data
    kycData.append("aadhaarFile", aadhaarFile);
    kycData.append("panCardFile", panCardFile);
    kycData.append("photoFile", photoFile);
    kycData.append("signatureFile", signatureFile);

    try {
      const res = await fetch("http://localhost:5000/api/verify-kyc", {
        method: "POST",
        body: kycData,
      });

      if (!res.ok) throw new Error("KYC verification failed.");
      const result = await res.json();
      setKycResult(result);
    } catch (error) {
      console.error("Error:", error);
      alert("Error verifying KYC. Please try again.");
    }
  };

  const reset = () => {
    setStep(1);
  };

  // Handle drag events
  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  // Handle drop event
  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      switch(field) {
        case 'aadhaar':
          setAadhaarFile(file);
          break;
        case 'photo':
          setPhotoFile(file);
          break;
        case 'panCard':
          setPanCardFile(file);
          break;
        case 'signature':
          setSignatureFile(file);
          break;
        default:
          break;
      }
    }
  };

  // File input change handler
  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  return (
    <div className="form-container">
      {!kycResult ? (
        <>
          <h2>KYC Verification</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input 
              type="text" 
              placeholder="Aadhaar Number" 
              value={aadhaarNumber} 
              maxLength="12" 
              onChange={(e) => setAadhaarNumber(e.target.value)} 
              required 
            />
            
            {/* Added PAN Number input field */}
            <input 
              type="text" 
              placeholder="PAN Number" 
              value={panNumber} 
              maxLength="10" 
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())} 
              required 
            />
            
            <label>Upload Aadhaar Document</label>
            <div 
              className={`drag-drop-zone ${dragActive.aadhaar ? "drag-active" : ""}`}
              onDragEnter={(e) => handleDrag(e, 'aadhaar')}
              onDragOver={(e) => handleDrag(e, 'aadhaar')}
              onDragLeave={(e) => handleDrag(e, 'aadhaar')}
              onDrop={(e) => handleDrop(e, 'aadhaar')}
              onClick={() => aadhaarInputRef.current.click()}
            >
              <p>{aadhaarFile ? aadhaarFile.name : "Drag and drop Aadhaar document here or click to upload"}</p>
              <input 
                ref={aadhaarInputRef}
                type="file" 
                accept=".pdf,.jpg,.png" 
                onChange={(e) => handleFileChange(e, setAadhaarFile)} 
                style={{ display: 'none' }}
                required 
              />
            </div>
            
            <label>Upload Selfie/Photo</label>
            <div 
              className={`drag-drop-zone ${dragActive.photo ? "drag-active" : ""}`}
              onDragEnter={(e) => handleDrag(e, 'photo')}
              onDragOver={(e) => handleDrag(e, 'photo')}
              onDragLeave={(e) => handleDrag(e, 'photo')}
              onDrop={(e) => handleDrop(e, 'photo')}
              onClick={() => photoInputRef.current.click()}
            >
              <p>{photoFile ? photoFile.name : "Drag and drop photo here or click to upload"}</p>
              <input 
                ref={photoInputRef}
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setPhotoFile)} 
                style={{ display: 'none' }}
                required 
              />
            </div>
            
            <label>Upload PAN Card</label>
            <div 
              className={`drag-drop-zone ${dragActive.panCard ? "drag-active" : ""}`}
              onDragEnter={(e) => handleDrag(e, 'panCard')}
              onDragOver={(e) => handleDrag(e, 'panCard')}
              onDragLeave={(e) => handleDrag(e, 'panCard')}
              onDrop={(e) => handleDrop(e, 'panCard')}
              onClick={() => panCardInputRef.current.click()}
            >
              <p>{panCardFile ? panCardFile.name : "Drag and drop PAN card here or click to upload"}</p>
              <input 
                ref={panCardInputRef}
                type="file" 
                accept=".pdf,.jpg,.png" 
                onChange={(e) => handleFileChange(e, setPanCardFile)} 
                style={{ display: 'none' }}
                required 
              />
            </div>
            
            <label>Upload Signature</label>
            <div 
              className={`drag-drop-zone ${dragActive.signature ? "drag-active" : ""}`}
              onDragEnter={(e) => handleDrag(e, 'signature')}
              onDragOver={(e) => handleDrag(e, 'signature')}
              onDragLeave={(e) => handleDrag(e, 'signature')}
              onDrop={(e) => handleDrop(e, 'signature')}
              onClick={() => signatureInputRef.current.click()}
            >
              <p>{signatureFile ? signatureFile.name : "Drag and drop signature here or click to upload"}</p>
              <input 
                ref={signatureInputRef}
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setSignatureFile)} 
                style={{ display: 'none' }}
                required 
              />
            </div>
            
            <button type="submit">Verify KYC</button>
          </form>
        </>
      ) : (
        <div className="kyc-result">
          <h2>KYC Verification Results</h2>
          <p><strong>Name Match:</strong> {kycResult.name_score}%</p>
          <p><strong>Aadhaar # Match:</strong> {kycResult.aadhaar_number_match ? '✅' : '❌'} ({kycResult.aadhaar_number})</p>
          <p><strong>Face Similarity:</strong> {kycResult.face_score?.toFixed(1)}%</p>
          <p><strong>Phone Lookup Name:</strong> {kycResult.phone_lookup_name}</p>
          <p><strong>Phone Name Match:</strong> {kycResult.phone_name_match ? '✅' : '❌'}</p>
          <p><strong>Overall Verified:</strong> {kycResult.verified ? '✅ PASS' : '❌ FAIL'}</p>
          <button onClick={reset}>Back to Form</button>
        </div>
      )}
    </div>
  );
}

export default KYC;

