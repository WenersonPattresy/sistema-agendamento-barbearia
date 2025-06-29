// frontend/src/AppointmentForm.jsx

import { useState, useEffect, useCallback } from 'react';

function AppointmentForm() {
  const [name, setName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [services, setServices] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  
  const availableTimeSlots = [ '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00' ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);
        const result = await response.json();
        if (result.success) {
          setServices(result.data);
        }
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      }
    };
    fetchServices();
  }, []);

  const fetchBookedTimes = useCallback(async (selectedDate) => {
    if (!selectedDate) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/booked-times/${selectedDate}`);
      const result = await response.json();
      if (result.success) {
        setBookedTimes(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar horários ocupados:", error);
    }
  }, []);

  useEffect(() => {
    setTime('');
    fetchBookedTimes(date);
  }, [date, fetchBookedTimes]);

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
    const appointmentData = { customer_name: name, service_id: serviceId, date, time };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`Agendamento confirmado!`);
        setName(''); setServiceId(''); setDate(''); setTime('');
        fetchBookedTimes(date);
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agende seu Horário</h1>
          <p className="text-gray-600 mt-2">Preencha as informações abaixo.</p>
        </header>
        <main>
          <form className="space-y-6" onSubmit={handleScheduleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome:</label>
              <input type="text" id="name" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Serviço Desejado:</label>
              <select id="service" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={serviceId} onChange={(e) => setServiceId(e.target.value)} required >
                <option value="">Selecione um serviço</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {Number(service.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data:</label>
              <input type="date" id="date" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora:</label>
              <select id="time" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-200" value={time} onChange={(e) => setTime(e.target.value)} required disabled={!date} >
                <option value="">Selecione um horário</option>
                {availableTimeSlots.map(slot => (
                  <option key={slot} value={slot} disabled={bookedTimes.includes(slot)} className="disabled:text-gray-400" >
                    {slot} {bookedTimes.includes(slot) ? '(Ocupado)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Agendar Agora
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AppointmentForm;
