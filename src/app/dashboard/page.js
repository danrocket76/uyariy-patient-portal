'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import client from '../../lib/apolloClient';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medicalData, setMedicalData] = useState({ audiograms: [], appointments: [] });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    } else {
      // Consulta GraphQL para traer Datos + Citas + Audífonos vinculados
      const GET_USER_DATA = gql`
        query GetUserData {
          myAudiograms {
            id
            createdAt
            thresholds
          }
          myAppointments {
            id
            appointmentDate
            status
            hearingAid {
              brand
              deviceModel
            }
          }
        }
      `;

      client.query({ query: GET_USER_DATA })
        .then((response) => {
          setTimeout(() => {
            setMedicalData({
              audiograms: response.data.myAudiograms,
              appointments: response.data.myAppointments
            });
            setLoading(false);
          }, 0);
        })
        .catch(() => {
          Cookies.remove('token');
          router.push('/login');
        });
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="font-semibold">Loading your records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Health Dashboard</h1>
            <p className="text-gray-500">Welcome back to Uyariy.</p>
          </div>
          <div className="flex gap-4">
            {/* Botón para ir a la App Rails (Test Auditivo Complejo) */}
            <a 
              href="http://localhost:3000/audiograms/new" 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-200"
            >
              + Start New Hearing Test
            </a>
            <button 
              onClick={() => { Cookies.remove('token'); router.push('/login'); }}
              className="px-5 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECCIÓN 1: AUDIOGRAMAS */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">📊</span>
              My Diagnoses
            </h2>
            
            <div className="space-y-4">
              {medicalData.audiograms.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                  <p className="text-gray-400">No audiograms found.</p>
                  <a href="http://localhost:3000/audiograms/new" className="text-blue-600 font-semibold text-sm mt-2 block hover:underline">Take a test now</a>
                </div>
              ) : (
                medicalData.audiograms.map((audio) => (
                  <div key={audio.id} className="p-5 bg-white border border-gray-200 rounded-xl card-hover flex justify-between items-center group">
                    <div>
                      <div className="text-sm text-gray-400 font-medium mb-1">
                        Date: {new Date(audio.createdAt).toLocaleDateString()}
                      </div>
                      <div className="font-semibold text-gray-800">Audiological Exam #{audio.id}</div>
                    </div>
                    <Link 
                      href={`/dashboard/audiogram/${audio.id}`}
                      className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition text-sm font-medium"
                    >
                      View Results →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* SECCIÓN 2: CITAS (Actualizada con Botón Book New) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
            
            {/* HEADER DE CITAS CON BOTÓN DE ACCIÓN */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <span className="p-2 bg-green-100 text-green-600 rounded-lg">📅</span>
                My Appointments
              </h2>
              {/* BOTÓN NUEVO: Agendar Cita */}
              <Link 
                href="/dashboard/appointments/new"
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-medium shadow-md shadow-green-100"
              >
                + Book New
              </Link>
            </div>
            
            <div className="space-y-4">
              {medicalData.appointments.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                  <p className="text-gray-400">No appointments scheduled.</p>
                  <p className="text-xs text-gray-400 mt-1">Click `+ Book New`` to schedule one.</p>
                </div>
              ) : (
                medicalData.appointments.map((app) => (
                  <div key={app.id} className="p-5 bg-white border border-gray-200 rounded-xl card-hover">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status || 'Pending'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : 'Date pending'}
                      </span>
                    </div>
                    
                    {app.hearingAid ? (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Fitting For:</p>
                        <p className="text-gray-800 font-medium">{app.hearingAid.brand} {app.hearingAid.deviceModel}</p>
                      </div>
                    ) : (
                      <p className="text-gray-800 font-medium">General Checkup / Diagnosis</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}