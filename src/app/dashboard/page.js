'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery, useMutation } from '@apollo/client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// QUERY TO FETCH DATA
const GET_USER_DATA = gql`
  query GetUserData {
    audiograms {
      id
      date
      diagnosis
      frequencies # Needed if you want to show a mini-preview later
    }
    appointments {
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

// MUTATION TO DELETE
const DELETE_AUDIOGRAM = gql`
  mutation DeleteAudiogram($id: ID!) {
    deleteAudiogram(input: { id: $id }) {
      id
      errors
    }
  }
`;

export default function Dashboard() {
  const router = useRouter();
  
  // --- DATA FETCHING ---
  const { data, loading, error, refetch } = useQuery(GET_USER_DATA, {
    fetchPolicy: 'network-only' 
  });
  
  const [deleteAudiogram] = useMutation(DELETE_AUDIOGRAM);

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user_role');
    router.push('/login');
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this result? This cannot be undone.")) {
      try {
        await deleteAudiogram({ variables: { id } });
        refetch(); 
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Could not delete item. Check console for details.");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading your portal...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500">Error loading data. Please log in again.</div>;

  const audiograms = data?.audiograms || [];
  const appointments = data?.appointments || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-500">Welcome back to UYARIY Health.</p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="mt-4 md:mt-0 px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition flex items-center gap-2"
          >
            <span>🚪</span> Log Out
          </button>
        </div>

        {/* --- ACTION BUTTONS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Actions Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 flex flex-col justify-center gap-4">
            <h2 className="text-2xl font-bold mb-2">Hearing Health Actions</h2>
            
            {/* BUTTON 1: NEW ASSESSMENT */}
            <Link 
              href="/dashboard/assessment/new"
              className="w-full bg-white text-blue-700 px-6 py-4 rounded-xl font-bold shadow-md hover:bg-gray-50 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-blue-100 p-2 rounded-lg">🎧</span>
                <span>New Hearing Assessment</span>
              </div>
              <span className="group-hover:translate-x-1 transition">➔</span>
            </Link>

            {/* BUTTON 2: BOOK APPOINTMENT */}
            <Link 
              href="/dashboard/appointments/new"
              className="w-full bg-blue-500 text-white border border-blue-400 px-6 py-4 rounded-xl font-bold hover:bg-blue-400 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-blue-600 p-2 rounded-lg">📅</span>
                <span>Schedule Appointment</span>
              </div>
              <span className="group-hover:translate-x-1 transition">➔</span>
            </Link>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-2xl">
                <p className="text-3xl font-bold text-purple-700">{audiograms.length}</p>
                <p className="text-sm text-purple-600">Total Assessments</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <p className="text-3xl font-bold text-green-700">{appointments.filter(a => a.status !== 'completed').length}</p>
                <p className="text-sm text-green-600">Upcoming Visits</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. RECENT RESULTS LIST  --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AUDIOGRAMS LIST */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📊</span> Recent Results
            </h2>
            
            {audiograms.length > 0 ? (
              <ul className="space-y-4">
                {audiograms.map((audio) => (
                  <li key={audio.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition border border-gray-100 hover:border-blue-100">
                    
                    {/* CLICK TO VIEW (Link Wrapper) */}
                    <Link href={`/dashboard/assessment/${audio.id}`} className="flex-grow cursor-pointer block">
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-blue-700 transition">
                          {audio.diagnosis || "Hearing Assessment"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(audio.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      {/* VIEW ICON BUTTON */}
                      <Link 
                        href={`/dashboard/assessment/${audio.id}`}
                        className="p-2 text-blue-300 hover:text-blue-600 hover:bg-blue-100 rounded-full transition"
                        title="View Details"
                      >
                        👁️
                      </Link>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(audio.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                        title="Delete Result"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-full mb-3 text-2xl">📉</div>
                <p className="text-gray-400 mb-4">No hearing tests saved yet.</p>
                <Link href="/dashboard/assessment/new" className="text-blue-600 font-bold hover:underline text-sm">
                  Start your first test
                </Link>
              </div>
            )}
          </div>

          {/* APPOINTMENTS LIST */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
             <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🗓️</span> Upcoming Appointments
            </h2>

            {appointments.length > 0 ? (
              <ul className="space-y-4">
                {appointments.map((apt) => (
                  <li key={apt.id} className="flex flex-col p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex justify-between items-start">
                      <div>
                         <p className="font-bold text-green-900">
                           {new Date(apt.appointmentDate).toLocaleDateString()}
                         </p>
                         <p className="text-sm text-green-700">
                           {new Date(apt.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>
                      </div>
                      <span className="px-2 py-1 bg-white text-green-700 text-xs font-bold rounded uppercase tracking-wide border border-green-200">
                        {apt.status}
                      </span>
                    </div>
                    {apt.hearingAid && (
                       <p className="text-xs text-green-600 mt-2 pt-2 border-t border-green-200">
                         Trial for: <strong>{apt.hearingAid.brand} {apt.hearingAid.deviceModel}</strong>
                       </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-full mb-3 text-2xl">📅</div>
                <p className="text-gray-400 mb-4">No upcoming visits.</p>
                <Link href="/dashboard/appointments/new" className="text-green-600 font-bold hover:underline text-sm">
                  Schedule one now
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}