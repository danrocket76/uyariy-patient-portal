'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams para leer URL

import { gql, useMutation, useQuery } from '@apollo/client';
import client from '../../../../lib/apolloClient';
import Link from 'next/link';

// 1. Query para llenar el selector de audífonos
const GET_HEARING_AIDS = gql`
  query GetHearingAids {
    hearingAids {
      id
      brand
      deviceModel
    }
  }
`;

// 2. Mutación para crear la cita
const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($date: ISO8601DateTime!, $reason: String!, $hearingAidId: ID) {
    createAppointment(input: {
      appointmentDate: $date,
      reason: $reason,
      hearingAidId: $hearingAidId
    }) {
      appointment {
        id
        status
      }
      errors
    }
  }
`;

export default function NewAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Si venimos de un botón "Probar este audífono", pre-seleccionamos el ID
  const preSelectedHearingAid = searchParams.get('hearingAidId');

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: 'General Checkup',
    hearingAidId: preSelectedHearingAid || ''
  });

  const { data: haData, loading: haLoading } = useQuery(GET_HEARING_AIDS, { client });
  const [createAppt, { loading: submitting }] = useMutation(CREATE_APPOINTMENT, { client });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Combinar fecha y hora en formato ISO
    const isoDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    try {
      const { data } = await createAppt({
        variables: {
          date: isoDateTime,
          reason: formData.reason,
          hearingAidId: formData.hearingAidId || null // Enviar null si está vacío
        }
      });

      if (data.createAppointment.errors.length > 0) {
        alert("Error: " + data.createAppointment.errors.join(", "));
      } else {
        alert("Appointment requested successfully!");
        router.push('/dashboard'); // Volver al inicio
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
          
          {/* FECHA Y HORA */}
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

          {/* MOTIVO */}
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

          {/* SELECTOR DE AUDÍFONOS (Interacción Módulos) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trial Device (Optional)
            </label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
              value={formData.hearingAidId}
              onChange={(e) => setFormData({...formData, hearingAidId: e.target.value})}
              disabled={haLoading}
            >
              <option value="">-- No specific device --</option>
              {haData && haData.hearingAids.map(ha => (
                <option key={ha.id} value={ha.id}>
                  {ha.brand} - {ha.deviceModel}
                </option>
              ))}
            </select>
            {haLoading && <p className="text-xs text-blue-500 mt-1">Loading devices...</p>}
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