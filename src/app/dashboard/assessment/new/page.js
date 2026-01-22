'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend 
} from 'recharts';
import Link from 'next/link';

import { useAudiogramAssessment } from '@/hooks/useAudiogramAssessment';

export default function NewAssessment() {
  
  const logic = useAudiogramAssessment();

  
  const chartData = Object.keys(logic.rightFrequencies).map(freq => ({
    name: `${freq}Hz`,
    rightEar: logic.rightFrequencies[freq],
    leftEar: logic.leftFrequencies[freq]
  }));

  const renderRecommendationsSection = () => {
    if (logic.diagnosis === "Normal Hearing") {
      return (
        <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center">
          <span className="text-4xl">🎉</span>
          <h3 className="text-2xl font-bold text-green-900 mt-4 mb-2">Excellent News!</h3>
          <p className="text-green-800 text-lg">Your results indicate normal hearing.</p>
          <p className="text-sm text-green-600 mt-4">We recommend a routine check-up in 12 months.</p>
        </div>
      );
    }

    if (logic.diagnosis === "Profound Hearing Loss") {
      return (
        <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2"><span>🩺</span> Specialized Care Path</h3>
          <p className="text-purple-800 mb-4">Your hearing loss requires a highly personalized approach.</p>
          <p className="font-bold text-purple-900">Recommended Next Step: Cochlear Implant Evaluation.</p>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
        <h3 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-3"><span>🩺</span> Recommended Treatment</h3>
        <p className="text-sm text-blue-600 mb-6 italic border-b border-blue-200 pb-4">* System recommendation based on audiogram. Validated by Dr. Strange.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logic.backendRecommendations.length > 0 ? (
            logic.backendRecommendations.map(rec => (
              <div key={rec.hearingAid.id} className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg transition flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900">{rec.hearingAid.deviceModel}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{rec.hearingAid.brand}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-4">${rec.hearingAid.price}</p>
                </div>
                <Link href={`/dashboard/appointments/new?hearingAidId=${rec.hearingAid.id}`} className="w-full block text-center bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-bold transition">Book Trial</Link>
              </div>
            ))
          ) : (
             <div className="col-span-2 text-center py-8 text-blue-800 bg-white rounded-xl">
                <p>Based on your specific profile, the doctor will manually select the best options for you.</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div><h1 className="text-3xl font-bold text-gray-900">{logic.step === 1 ? 'New Hearing Assessment' : 'Assessment Results'}</h1></div>
          <Link href="/dashboard" className="text-gray-400 hover:text-red-600 font-bold transition">Exit ✕</Link>
        </div>

        {logic.step === 1 && (
          <div className="space-y-8">
            {/* AI Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div><h3 className="font-bold text-blue-900 text-lg flex items-center gap-2"><span>📄</span> Have a paper audiogram?</h3><p className="text-sm text-blue-700 mt-1">Upload photo for AI analysis.</p></div>
              
              {/* Using ref from the hook */}
              <input type="file" ref={logic.fileInputRef} onChange={logic.handleFileChange} className="hidden" accept="image/*" />
              <button onClick={logic.triggerFileInput} disabled={logic.analyzing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2">{logic.analyzing ? 'Analyzing...' : '📸 Upload & Analyze (AI)'}</button>
            </div>

            {/* Frequency Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="font-bold text-red-600 border-b border-red-100 pb-2 flex justify-between"><span>Right Ear (Red)</span><span>dB</span></h3>
                {Object.keys(logic.rightFrequencies).map((freq) => (
                  <div key={`r-${freq}`} className="flex items-center gap-4">
                    <span className="w-14 text-xs font-bold text-gray-400">{freq}Hz</span>
                    <input type="range" min="-10" max="120" step="5" value={logic.rightFrequencies[freq]} onChange={(e) => logic.setRightFrequencies({...logic.rightFrequencies, [freq]: parseInt(e.target.value)})} className="flex-grow h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500" />
                    <span className="w-8 text-right font-bold text-red-600">{logic.rightFrequencies[freq]}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-blue-600 border-b border-blue-100 pb-2 flex justify-between"><span>Left Ear (Blue)</span><span>dB</span></h3>
                {Object.keys(logic.leftFrequencies).map((freq) => (
                  <div key={`l-${freq}`} className="flex items-center gap-4">
                    <span className="w-14 text-xs font-bold text-gray-400">{freq}Hz</span>
                    <input type="range" min="-10" max="120" step="5" value={logic.leftFrequencies[freq]} onChange={(e) => logic.setLeftFrequencies({...logic.leftFrequencies, [freq]: parseInt(e.target.value)})} className="flex-grow h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    <span className="w-8 text-right font-bold text-blue-600">{logic.leftFrequencies[freq]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={logic.handleSave} disabled={logic.saving} className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center gap-2">{logic.saving ? 'Processing...' : 'Get Diagnosis & Recommendations ➔'}</button>
            </div>
          </div>
        )}

        {logic.step === 2 && (
          <div className="animate-fade-in-up space-y-10">
            <div className={`p-8 rounded-2xl text-center border-2 ${logic.diagnosis.includes('Normal') ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest opacity-60 mb-2">Clinical Diagnosis</h2>
              <p className="text-4xl md:text-5xl font-extrabold">{logic.diagnosis}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-96">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis reversed domain={[-10, 120]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="5 5" label="Normal" />
                    <Line type="monotone" dataKey="rightEar" name="Right Ear" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: "#ef4444" }} />
                    <Line type="monotone" dataKey="leftEar" name="Left Ear" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, shape: "square", fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
            </div>

            {renderRecommendationsSection()}

            <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 pt-8 border-t">
              <button onClick={() => logic.setStep(1)} className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition">Start Over</button>
              <Link href="/dashboard/appointments/new" className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><span>📅</span> Book Follow-up Appointment</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}