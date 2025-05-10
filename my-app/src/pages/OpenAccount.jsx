import React, { useState } from "react";
import "./OpenAccount.css";
import LiveLivenessCheck from "../components/LiveLivenessCheck";

function OpenAccount() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    accountType: '',
    bank: '',
    aadhaarNumber: '',
    panNumber: '',
    photoFile: null,
    panCardFile: null,
    aadhaarFile: null,
    faceVerified: false
  });
  const [files, setFiles] = useState({
    photo: null,
    aadhaar: null,
    panCard: null,
    signature: null
  });
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    console.log('File upload:', name, file);
    
    // Update files state
    setFiles(prev => {
      const newFiles = {
        ...prev,
        [name]: file
      };
      console.log('Updated files state:', newFiles);
      return newFiles;
    });

    // Clear any existing errors for this file
    setErrors(prev => {
      const newErrors = {
        ...prev,
        [name]: null,
        [`${name}File`]: null
      };
      console.log('Cleared errors for:', name, 'New errors:', newErrors);
      return newErrors;
    });
  };

  const handleFaceVerification = (success) => {
    if (success) {
      setFormData(prev => ({
        ...prev,
        faceVerified: true
      }));
      // Clear any face verification errors
      setErrors(prev => ({
        ...prev,
        faceVerified: null
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    console.log('=== VALIDATION START ===');
    console.log('Validating step:', step);
    console.log('Current files:', files);
    console.log('Current form data:', formData);
    
    switch (step) {
      case 1:
        // Only validate basic information in step 1
        if (!formData.fullName?.trim()) errors.fullName = 'Full Name is required';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        if (!formData.phone?.trim()) errors.phone = 'Phone is required';
        if (!formData.age?.trim()) errors.age = 'Age is required';
        if (!formData.accountType?.trim()) errors.accountType = 'Account Type is required';
        if (!formData.bank?.trim()) errors.bank = 'Bank is required';
        if (!formData.aadhaarNumber?.trim()) errors.aadhaarNumber = 'Aadhaar Number is required';
        if (!formData.panNumber?.trim()) errors.panNumber = 'PAN Number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber.trim())) errors.panNumber = 'Invalid PAN format';
        break;
      case 2:
        // Simplified validation for step 2
        if (!files.panCard) errors.panCardFile = 'PAN Card document is required';
        if (!files.aadhaar) errors.aadhaarFile = 'Aadhaar Card document is required';
        if (!files.signature) errors.signature = 'Signature is required';
        break;
      case 3:
        if (!files.photo) {
          errors.photoFile = 'Photo is required';
        } else if (!formData.faceVerified) {
          errors.faceVerified = 'Please complete face verification';
        }
        break;
    }
    
    console.log('Validation errors:', errors);
    console.log('=== VALIDATION END ===');
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    console.log('=== NEXT BUTTON CLICKED ===');
    console.log('Current step:', currentStep);
    console.log('Files state:', files);
    console.log('Form data:', formData);
    
    if (currentStep === 2) {
      const hasAllFiles = Boolean(files.panCard && files.aadhaar && files.signature);
      console.log('Step 2 check - Has all files:', hasAllFiles);
      
      if (hasAllFiles) {
        console.log('Moving to step 3');
        setCurrentStep(3);
        return;
      }
    }
    
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to step:', currentStep + 1);
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Validation failed. Current errors:', errors);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const formDataToSend = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // Add all files
    Object.entries(files).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/submit-account', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          setCurrentStep(1);
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            age: '',
            accountType: '',
            bank: '',
            aadhaarNumber: '',
            panNumber: '',
            photoFile: null,
            panCardFile: null,
            aadhaarFile: null,
            faceVerified: false
          });
          setFiles({
            photo: null,
            aadhaar: null,
            panCard: null,
            signature: null
          });
        }, 2000);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  // Update the areAllFilesUploaded function to be more specific
  const areAllFilesUploaded = () => {
    const hasAllFiles = Boolean(files.panCard && files.aadhaar && files.signature);
    console.log('Checking files:', {
      panCard: files.panCard,
      aadhaar: files.aadhaar,
      signature: files.signature,
      hasAllFiles
    });
    return hasAllFiles;
  };

  // Add this function to check if basic info is complete
  const isBasicInfoComplete = () => {
    return formData.fullName?.trim() &&
           formData.email?.trim() &&
           formData.phone?.trim() &&
           formData.age?.trim() &&
           formData.accountType?.trim() &&
           formData.bank?.trim() &&
           formData.aadhaarNumber?.trim();
  };

  return (
    <div className="account-container">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-animation">
              <span className="checkmark-circle">
                <span className="checkmark-stem"></span>
                <span className="checkmark-kick"></span>
              </span>
              <span className="success-message">Details submitted successfully!</span>
            </div>
          </div>
        </div>
      )}
      <div className="account-wrapper">
        <div className="account-box">
          <div className="account-header">
            <h1 className="account-title">Open New Account</h1>
            <p className="account-subtitle">Complete the following steps to open your account</p>
          </div>

          <div className="progress-container">
            <div className="progress-steps">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="progress-step">
                  <div className={`step-number ${currentStep >= num ? 'active' : ''}`}>
                    {num}
                  </div>
                  <div className="step-label">
                    {num === 1 ? 'Basic Details' :
                     num === 2 ? 'Documents' :
                     num === 3 ? 'Face Verification' : 'Review'}
                  </div>
                </div>
              ))}
              <div className="progress-line">
                <div className="progress-line-fill" 
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="form-content">
            <div className="form-section">
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="form-title">Personal Information</h2>
                    <p className="text-gray-600">Please fill in your details to proceed</p>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="form-card">
                      <div className="form-header">
                        <div className="form-icon">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="form-title">Basic Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="input-group">
                          <label className="input-label">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your full name"
                          />
                          {errors.fullName && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.fullName}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your email address"
                          />
                          {errors.email && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.email}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your phone number"
                          />
                          {errors.phone && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.phone}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your age"
                          />
                          {errors.age && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.age}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">PAN Number</label>
                          <input
                            type="text"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your PAN number"
                            maxLength={10}
                          />
                          {errors.panNumber && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.panNumber}
                          </p>}
                        </div>
                      </div>
                    </div>

                    <div className="form-card">
                      <div className="form-header">
                        <div className="form-icon">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <h3 className="form-title">Account Details</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="input-group">
                          <label className="input-label">Account Type</label>
                          <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleInputChange}
                            className="input-field"
                          >
                            <option value="">Select Account Type</option>
                            <option value="savings">Savings Account</option>
                            <option value="current">Current Account</option>
                            <option value="fixed">Fixed Deposit</option>
                          </select>
                          {errors.accountType && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.accountType}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">Bank</label>
                          <select
                            name="bank"
                            value={formData.bank}
                            onChange={handleInputChange}
                            className="input-field"
                          >
                            <option value="">Select Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="HDFC">HDFC Bank</option>
                            <option value="ICICI">ICICI Bank</option>
                          </select>
                          {errors.bank && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.bank}
                          </p>}
                        </div>

                        <div className="input-group">
                          <label className="input-label">Aadhaar Number</label>
                          <input
                            type="text"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter your Aadhaar number"
                          />
                          {errors.aadhaarNumber && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.aadhaarNumber}
                          </p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="form-title">Upload Documents</h2>
                    <p className="text-gray-600">Please upload the required documents to proceed</p>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="form-card">
                      <div className="form-header">
                        <div className="form-icon">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="form-title">Required Documents</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="upload-area">
                          <label className="input-label">Photo</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-white rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors duration-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="upload-text">
                                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="upload-hint">PNG, JPG or JPEG (MAX. 2MB)</p>
                              </div>
                              <input
                                type="file"
                                name="photo"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                              />
                            </label>
                          </div>
                          {files.photo && (
                            <div className="file-preview">
                              <span className="file-name">{files.photo.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles(prev => ({ ...prev, photo: null }));
                                  setFormData(prev => ({ ...prev, photoFile: null }));
                                }}
                                className="remove-file"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {errors.photoFile && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.photoFile}
                          </p>}
                        </div>

                        <div className="upload-area">
                          <label className="input-label">Aadhaar Card</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-white rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors duration-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="upload-text">
                                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="upload-hint">PNG, JPG or PDF (MAX. 2MB)</p>
                              </div>
                              <input
                                type="file"
                                name="aadhaar"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="hidden"
                              />
                            </label>
                          </div>
                          {files.aadhaar && (
                            <div className="file-preview">
                              <span className="file-name">{files.aadhaar.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles(prev => ({ ...prev, aadhaar: null }));
                                  setFormData(prev => ({ ...prev, aadhaarFile: null }));
                                }}
                                className="remove-file"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {errors.aadhaarFile && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.aadhaarFile}
                          </p>}
                        </div>

                        <div className="upload-area">
                          <label className="input-label">PAN Card</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-white rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors duration-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="upload-text">
                                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="upload-hint">PNG, JPG or PDF (MAX. 2MB)</p>
                              </div>
                              <input
                                type="file"
                                name="panCard"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="hidden"
                              />
                            </label>
                          </div>
                          {files.panCard && (
                            <div className="file-preview">
                              <span className="file-name">{files.panCard.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles(prev => ({ ...prev, panCard: null }));
                                  setFormData(prev => ({ ...prev, panCardFile: null }));
                                }}
                                className="remove-file"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {errors.panCardFile && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.panCardFile}
                          </p>}
                        </div>

                        <div className="upload-area">
                          <label className="input-label">Signature</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-white rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors duration-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <p className="upload-text">
                                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="upload-hint">PNG or JPG (MAX. 2MB)</p>
                              </div>
                              <input
                                type="file"
                                name="signature"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                              />
                            </label>
                          </div>
                          {files.signature && (
                            <div className="file-preview">
                              <span className="file-name">{files.signature.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles(prev => ({ ...prev, signature: null }));
                                }}
                                className="remove-file"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {errors.signature && <p className="error-message">
                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.signature}
                          </p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="form-title">Face Verification</h2>
                  <div className="face-verification">
                    {files.photo ? (
                      <div className="verification-container">
                        <div className="verification-grid">
                          <div className="verification-item">
                            <h3 className="verification-subtitle">Uploaded Photo</h3>
                            <div className="verification-image">
                              <img 
                                src={URL.createObjectURL(files.photo)} 
                                alt="Uploaded photo" 
                                className="w-full h-full object-cover rounded-lg border-2 border-blue-200"
                              />
                            </div>
                          </div>
                          <div className="verification-item">
                            <h3 className="verification-subtitle">Live Verification</h3>
                            <div className="verification-camera">
                              <LiveLivenessCheck
                                photoBase64={URL.createObjectURL(files.photo)}
                                onVerificationComplete={handleFaceVerification}
                                showLoading={false}
                                hideLoadingMessage={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="verification-error">
                        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="error-text">Please upload a photo first</p>
                      </div>
                    )}
                    {errors.faceVerified && (
                      <div className="verification-error">
                        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="error-text">{errors.faceVerified}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="form-title">Review and Submit</h2>
                  <div className="review-section">
                    <h3 className="review-title">Personal Information</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <div className="review-label">Full Name</div>
                        <div className="review-value">{formData.fullName}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Email</div>
                        <div className="review-value">{formData.email}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Phone</div>
                        <div className="review-value">{formData.phone}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Age</div>
                        <div className="review-value">{formData.age}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Account Type</div>
                        <div className="review-value">{formData.accountType}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Bank</div>
                        <div className="review-value">{formData.bank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="review-section">
                    <h3 className="review-title">Uploaded Documents</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <div className="review-label">Photo</div>
                        <div className="review-value">{files.photo?.name || 'Not uploaded'}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Aadhaar Card</div>
                        <div className="review-value">{files.aadhaar?.name || 'Not uploaded'}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">PAN Card</div>
                        <div className="review-value">{files.panCard?.name || 'Not uploaded'}</div>
                      </div>
                      <div className="review-item">
                        <div className="review-label">Signature</div>
                        <div className="review-value">{files.signature?.name || 'Not uploaded'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="navigation-buttons">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="nav-button previous"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="nav-button next"
                  >
                    {currentStep === 1 ? 'Proceed to Upload Documents' : 
                     currentStep === 2 ? 'Next' :
                     'Next'}
                  </button>
                ) : (
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="nav-button submit"
                >
                    Submit
                </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenAccount;





