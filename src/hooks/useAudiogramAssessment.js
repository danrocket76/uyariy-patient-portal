import { useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { gql, useMutation } from '@apollo/client';

const CREATE_AUDIOGRAM = gql`
  mutation CreateAudiogram($input: CreateAudiogramInput!) {
    createAudiogram(input: $input) {
      audiogram {
        id
        diagnosis
        recommendations {
          hearingAid {
            id
            brand
            deviceModel
            price
          }
        }
      }
      errors
    }
  }
`;

export function useAudiogramAssessment() {
  // STATE
  const [rightFrequencies, setRightFrequencies] = useState({ 125: 10, 250: 10, 500: 20, 1000: 20, 2000: 30, 4000: 40, 8000: 50 });
  const [leftFrequencies, setLeftFrequencies] = useState({ 125: 10, 250: 10, 500: 20, 1000: 20, 2000: 30, 4000: 40, 8000: 50 });
  
  const [step, setStep] = useState(1); 
  const [diagnosis, setDiagnosis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [backendRecommendations, setBackendRecommendations] = useState([]);
  const fileInputRef = useRef(null);

  const [createAudiogram, { loading: saving }] = useMutation(CREATE_AUDIOGRAM);

  // LOGIC: AI Handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analyze_audiogram`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        }
      );

      const aiData = response.data;

      if (aiData.right) {
        const newRight = { ...rightFrequencies };
        Object.keys(newRight).forEach(freq => {
          if (aiData.right[freq] !== null && aiData.right[freq] !== undefined) {
            newRight[parseInt(freq)] = parseInt(aiData.right[freq]);
          }
        });
        setRightFrequencies(newRight);
      }

      if (aiData.left) {
        const newLeft = { ...leftFrequencies };
        Object.keys(newLeft).forEach(freq => {
          if (aiData.left[freq] !== null && aiData.left[freq] !== undefined) {
            newLeft[parseInt(freq)] = parseInt(aiData.left[freq]);
          }
        });
        setLeftFrequencies(newLeft);
      }

      alert("✅ AI Analysis Successful! Both ears updated.");

    } catch (error) {
      console.error("AI Error:", error);
      alert("⚠️ AI service unavailable. Please enter values manually.");
    } finally {
      setAnalyzing(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // LOGIC: Diagnosis Calculation
  const calculateDiagnosis = () => {
    const avgRight = (rightFrequencies[500] + rightFrequencies[1000] + rightFrequencies[2000] + rightFrequencies[4000]) / 4;
    const avgLeft = (leftFrequencies[500] + leftFrequencies[1000] + leftFrequencies[2000] + leftFrequencies[4000]) / 4;
    const average = (avgRight + avgLeft) / 2;
    
    if (average < 25) return "Normal Hearing";
    if (average < 40) return "Mild Hearing Loss";
    if (average < 55) return "Moderate Hearing Loss";
    if (average < 70) return "Moderately Severe Hearing Loss";
    if (average < 90) return "Severe Hearing Loss";
    return "Profound Hearing Loss";
  };

  // LOGIC: Save to Backend
  const handleSave = async () => {
    const diag = calculateDiagnosis();
    setDiagnosis(diag);

    try {
      const { data } = await createAudiogram({
        variables: {
          input: {
            thresholds: { right: rightFrequencies, left: leftFrequencies }, 
            diagnosis: diag,
            notes: "Web Portal Assessment"
          }
        }
      });
      
      if (data?.createAudiogram?.audiogram?.recommendations) {
        const validRecs = data.createAudiogram.audiogram.recommendations.filter(r => r.hearingAid);
        setBackendRecommendations(validRecs);
      }
      setStep(2);

    } catch (err) {
      console.error("Save Error:", err);
      alert("Note: Connection issue saving to history, but showing preview.");
      setStep(2);
    }
  };

  return {
    step, setStep,
    rightFrequencies, setRightFrequencies,
    leftFrequencies, setLeftFrequencies,
    diagnosis,
    analyzing,
    saving,
    fileInputRef,
    backendRecommendations,
    handleFileChange,
    handleSave,
    triggerFileInput: () => fileInputRef.current.click()
  };
}