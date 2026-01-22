'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend 
} from 'recharts';
import Link from 'next/link';

const GET_SINGLE_AUDIOGRAM = gql`
  query GetAudiogram($id: ID!) {
    audiogram(id: $id) {
      id
      diagnosis
      date
      thresholds 
      recommendations {
        hearingAid {
          id
          brand
          deviceModel
          price
        }
      }
    }
  }
`;

export default function ViewAssessment() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_SINGLE_AUDIOGRAM, { variables: { id } });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading chart...</div>;
  
  
  if (error || !data?.audiogram) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4">
      <p>Error loading result (It might have been deleted).</p>
      <Link href="/dashboard" className="text-blue-600 underline">Back to Dashboard</Link>
    </div>
  );

  const audio = data.audiogram;
  const thresholds = audio.thresholds || {};
  
  
  const rightEarData = thresholds.right || thresholds || {};
  const leftEarData = thresholds.left || {}; 

  const freqLabels = ["125", "250", "500", "1000", "2000", "4000", "8000"];
  const chartData = freqLabels.map((freq) => ({
    name: `${freq}Hz`,
    rightEar: rightEarData[freq] ? parseInt(rightEarData[freq]) : null,
    leftEar: leftEarData[freq] ? parseInt(leftEarData[freq]) : null,
  }));

  
  const validRecommendations = audio.recommendations?.filter(r => r && r.hearingAid) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Assessment Details</h1>
             <p className="text-sm text-gray-500">Performed on {new Date(audio.date).toLocaleDateString()}</p>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition">
            ✕ Close
          </Link>
        </div>

        {/* DIAGNOSIS */}
        <div className={`p-6 rounded-2xl text-center mb-8 border-2 ${audio.diagnosis?.includes('Normal') ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
          <p className="text-xs uppercase font-bold opacity-60 tracking-wider">Clinical Diagnosis</p>
          <p className="text-3xl font-extrabold mt-2">{audio.diagnosis}</p>
        </div>

        {/* CHART */}
        <div className="h-96 w-full mb-10">
          <h3 className="text-center font-bold text-gray-700 mb-4">Audiogram Chart</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis reversed domain={[-10, 120]} stroke="#6b7280" label={{ value: 'dB HL', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Normal Limit', fill: '#22c55e', fontSize: 12 }} />
              <Line type="monotone" dataKey="rightEar" name="Right Ear (Red)" stroke="#ef4444" strokeWidth={3} dot={{r:6, fill:"#ef4444"}} connectNulls />
              <Line type="monotone" dataKey="leftEar" name="Left Ear (Blue)" stroke="#3b82f6" strokeWidth={3} dot={{r:6, shape:"square", fill:"#3b82f6"}} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RECOMMENDATIONS */}
        {validRecommendations.length > 0 ? (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>🩺</span> Recommended Devices
             </h3>
             <div className="space-y-3">
                {validRecommendations.map(rec => (
                  <div key={rec.hearingAid.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                     <div>
                        <p className="font-bold text-gray-900">{rec.hearingAid.deviceModel}</p>
                        <p className="text-sm text-gray-500">{rec.hearingAid.brand}</p>
                        <p className="text-blue-600 font-bold text-sm">${rec.hearingAid.price}</p>
                     </div>
                     <Link href={`/dashboard/appointments/new?hearingAidId=${rec.hearingAid.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                        Book Trial
                     </Link>
                  </div>
                ))}
             </div>
             <p className="text-xs text-blue-600 mt-4 italic">
               * Recommendations based on this specific test result.
             </p>
          </div>
        ) : (
          
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500">No specific automated recommendations for this result.</p>
          </div>
        )}

      </div>
    </div>
  );
}