import api, { toAppError } from './axios';

// POST /appointments — the server returns { appointment }.
export async function createAppointment(appointment) {
  try {
    const response = await api.post('/appointments', appointment);
    return response.data.data.appointment;
  } catch (error) {
    throw toAppError(error, 'Your appointment could not be booked.');
  }
}

// GET /appointments/my — the server returns { items, page, pages, total }.
export async function getMyAppointments(scope) {
  try {
    const response = await api.get('/appointments/my', {
      params: { scope: scope },
    });
    return response.data.data;
  } catch (error) {
    throw toAppError(error, 'We could not load your appointments.');
  }
}

// GET /appointments/:id — the server returns { appointment }.
export async function getAppointment(id) {
  try {
    const response = await api.get('/appointments/' + id);
    return response.data.data.appointment;
  } catch (error) {
    throw toAppError(error, 'We could not load this appointment.');
  }
}

// PATCH /appointments/:id/cancel — the server returns { appointment }.
export async function cancelAppointment(id, cancellationReason) {
  try {
    const response = await api.patch('/appointments/' + id + '/cancel', {
      cancellationReason: cancellationReason,
    });
    return response.data.data.appointment;
  } catch (error) {
    throw toAppError(error, 'We could not cancel this appointment.');
  }
}

// PATCH /appointments/:id/reschedule — the server returns { appointment }.
export async function rescheduleAppointment(id, updates) {
  try {
    const response = await api.patch('/appointments/' + id + '/reschedule', updates);
    return response.data.data.appointment;
  } catch (error) {
    throw toAppError(error, 'We could not reschedule this appointment.');
  }
}

// GET /admin/appointments — the server returns { items, page, pages, total }.
export async function getAdminAppointments(params) {
  try {
    const response = await api.get('/admin/appointments', { params: params });
    return response.data.data;
  } catch (error) {
    throw toAppError(error, 'We could not load appointments.');
  }
}

// PATCH /admin/appointments/:id/status — the server returns { appointment }.
export async function updateAdminAppointmentStatus(id, updates) {
  try {
    const response = await api.patch('/admin/appointments/' + id + '/status', updates);
    return response.data.data.appointment;
  } catch (error) {
    throw toAppError(error, 'The appointment status could not be updated.');
  }
}

// GET /admin/dashboard — read only the counts our own API sends.
export async function getAdminDashboard() {
  try {
    const response = await api.get('/admin/dashboard');
    const body = response.data.data;

    return {
      doctors: body.doctors.total,
      patients: body.patients,
      appointments: body.appointments.total,
      pending: body.appointments.pending,
      confirmed: body.appointments.confirmed,
      completed: body.appointments.completed,
    };
  } catch (error) {
    throw toAppError(error, 'We could not load the dashboard.');
  }
}

const appointmentApi = {
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getAdminAppointments,
  updateAdminAppointmentStatus,
  getAdminDashboard,
};

export default appointmentApi;
