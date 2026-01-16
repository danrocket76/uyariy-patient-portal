'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import client from '../../../../lib/apolloClient';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AudiogramDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) router.push('/login');

    const GET_ONE_AUDIOGRAM = gql`
      query GetOneAudiogram($id: ID!) {
        audiogram(id: $id) {
          id
          createdAt
          thresholds
          notes
          recommendations {
            hearingAid {
              id
              brand
              deviceModel
              price
              imageUrl
              description
            }
          }
        }
      }
    `;

    client.query({ query: GET_ONE_AUDIOGRAM, variables: { id } })
    .then((res) => {
      const audioData = res.data.audiogram;
      setData(audioData);
      
      if (audioData.thresholds) {
        const leftFreqs = Object.keys(audioData.thresholds.left || {});
        const rightFreqs = Object.keys(audioData.thresholds.right || {});
        const allFreqs = [...new Set([...leftFreqs, ...rightFreqs])].sort((a, b) => Number(a) - Number(b));
        
        const formatted = allFreqs.map(freq => ({
          frequency: `${freq}Hz`,
          left: audioData.thresholds.left?.[freq] || null,
          right: audioData.thresholds.right?.[freq] || null,
        }));
        setChartData(formatted);
      }
      setLoading(false);
    })
    .catch((err) => console.error(err));
  }, [id, router]);

  if (loading) return <div className="p-20 text-center text-blue-600 font-bold">Loading Analysis...</div>;
  if (!data) return <div className="p-20 text-center text-red-500">Record not found.</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hearing Analysis</h1>
            <p className="text-gray-500">Report ID: #{data.id}</p>
          </div>
          <Link href="/dashboard" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition font-medium text-sm">
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CHART SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Visual Audiogram</h3>
             <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb"/>
                  <XAxis dataKey="frequency" stroke="#9ca3af" fontSize={12} tick={{dy: 10}} />
                  <YAxis reversed={true} domain={[0, 120]} stroke="#9ca3af" fontSize={12} label={{ value: 'dB', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="left" stroke="#2563eb" strokeWidth={3} name="Left Ear" dot={{ r: 6, fill: "#2563eb" }} connectNulls />
                  <Line type="monotone" dataKey="right" stroke="#dc2626" strokeWidth={3} name="Right Ear" dot={{ r: 6, fill: "#dc2626" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE & NOTES */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Doctor is Notes</h3>
              <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                `{data.notes || "No clinical notes available."}`
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Data Points</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-3">Hz</th>
                      <th className="p-3 text-blue-600">Left</th>
                      <th className="p-3 text-red-600">Right</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartData.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium">{row.frequency}</td>
                        <td className="p-3 text-blue-600 font-bold">{row.left || '-'}</td>
                        <td className="p-3 text-red-600 font-bold">{row.right || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* NEW SECTION: RECOMMENDED HEARING AIDS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            ✅ Recommended Solutions
          </h2>
          
          {(!data.recommendations || data.recommendations.length === 0) ? (
            <div className="text-center p-10 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No specific hearing aids recommended for this result yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.recommendations.map((rec) => {
                // --- SAFETY CHECK (The Fix) ---
                // If hearingAid is null (deleted), we skip it to prevent crash
                if (!rec.hearingAid) return null;

                return (
                  <div key={rec.hearingAid.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition bg-white flex flex-col">
                    {rec.hearingAid.imageUrl && (
                      <img src={rec.hearingAid.imageUrl} alt={rec.hearingAid.deviceModel} className="w-full h-48 object-contain mb-4 rounded-lg bg-gray-50" />
                    )}
                    <div className="mb-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">
                        {rec.hearingAid.brand}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{rec.hearingAid.deviceModel}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {rec.hearingAid.description || "High-performance hearing device."}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">${rec.hearingAid.price}</span>
                      <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}