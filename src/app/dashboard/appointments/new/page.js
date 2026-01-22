'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import client from '../../../../lib/apolloClient';
import Link from 'next/link';

// QUERY
const GET_FORM_DATA = gql`
  query GetFormData {
    hearingAids {
      id
      brand
      deviceModel
    }
    audiograms {
      id
      date
      diagnosis
    }
  }
`;

// MUTATION
const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($date: ISO8601DateTime!, $reason: String!, $hearingAidId: ID, $audiogramId: ID) {
    createAppointment(input: {
      appointmentDate: $date,
      reason: $reason,
      hearingAidId: $hearingAidId,
      audiogramId: $audiogramId
    }) {
      appointment {
        id
        status
      }
      errors
    }
  }
`;

// 1. INTERNAL COMPONENT: Contains the logic that uses useSearchParams
function AppointmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pre-select Hearing Aid if coming from "Book Trial" button
  const preSelectedHearingAid = searchParams.get('hearingAidId');

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: 'General Checkup',
    hearingAidId: preSelectedHearingAid || '',
    audiogramId: ''
  });

  // Use the new combined query
  const { data: formDataResult, loading: formLoading } = useQuery(GET_FORM_DATA, { client, fetchPolicy: 'network-only' });
  const [createAppt, { loading: submitting }] = useMutation(CREATE_APPOINTMENT, { client });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Combine date and time
    const isoDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    try {
      const { data } = await createAppt({
        variables: {
          date: isoDateTime,
          reason: formData.reason,
          hearingAidId: formData.hearingAidId || null,
          audiogramId: formData.audiogramId || null
        }
      });

      if (data.createAppointment.errors.length > 0) {
        alert("Error: " + data.createAppointment.errors.join(", "));
      } else {
        alert("Appointment requested successfully!");
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert("System Error: Could not book appointment.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">✕ Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* DATE & TIME */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
              <input 
                type="time" 
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          {/* REASON */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Visit</label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            >
              <option value="General Checkup">General Checkup / Diagnosis</option>
              <option value="Hearing Aid Fitting">Hearing Aid Fitting / Trial</option>
              <option value="Maintenance">Device Maintenance</option>
              <option value="Consultation">Doctor Consultation</option>
            </select>
          </div>

          {/* AUDIOGRAM SELECTOR */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Attach Assessment Result (Optional)
            </label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
              value={formData.audiogramId}
              onChange={(e) => setFormData({...formData, audiogramId: e.target.value})}
              disabled={formLoading}
            >
              <option value="">-- No specific assessment --</option>
              {formDataResult && formDataResult.audiograms.map(audio => (
                <option key={audio.id} value={audio.id}>
                  {new Date(audio.date).toLocaleDateString()} - {audio.diagnosis}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Helps the doctor review your case before arrival.</p>
          </div>

          {/* HEARING AID SELECTOR */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trial Device (Optional)
            </label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
              value={formData.hearingAidId}
              onChange={(e) => setFormData({...formData, hearingAidId: e.target.value})}
              disabled={formLoading}
            >
              <option value="">-- No specific device --</option>
              {formDataResult && formDataResult.hearingAids.map(ha => (
                <option key={ha.id} value={ha.id}>
                  {ha.brand} - {ha.deviceModel}
                </option>
              ))}
            </select>
            {formLoading && <p className="text-xs text-blue-500 mt-1">Loading data...</p>}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 2. MAIN EXPORT: Wraps the content in Suspense to fix the build error
export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-semibold animate-pulse">Loading booking form...</p>
      </div>
    }>
      <AppointmentFormContent />
    </Suspense>
  );
}