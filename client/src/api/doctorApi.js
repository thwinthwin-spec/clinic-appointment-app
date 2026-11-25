import api, { toAppError } from './axios';

// GET /doctors — the server returns { items, page, pages, total }.
export async function listDoctors(params) {
  try {
    const response = await api.get('/doctors', { params: params });
    return response.data.data;
  } catch (error) {
    throw toAppError(error, 'We could not load the doctor list.');
  }
}

// GET /doctors/:id — the server returns { doctor, availableSlotCount }.
export async function getDoctor(id) {
  try {
    const response = await api.get('/doctors/' + id);
    return response.data.data.doctor;
  } catch (error) {
    throw toAppError(error, 'We could not load this doctor.');
  }
}

// GET /doctors/:id/slots — the server returns { date, booked, available }.
export async function getSlots(id, date) {
  try {
    const response = await api.get('/doctors/' + id + '/slots', {
      params: { date: date },
    });
    return response.data.data;
  } catch (error) {
    throw toAppError(error, 'We could not load the available time slots.');
  }
}

// POST /doctors — admin only, returns { doctor }.
export async function createDoctor(doctor) {
  try {
    const response = await api.post('/doctors', doctor);
    return response.data.data.doctor;
  } catch (error) {
    throw toAppError(error, 'The doctor could not be created.');
  }
}

// PUT /doctors/:id — admin only, returns { doctor }.
export async function updateDoctor(id, doctor) {
  try {
    const response = await api.put('/doctors/' + id, doctor);
    return response.data.data.doctor;
  } catch (error) {
    throw toAppError(error, 'The doctor could not be updated.');
  }
}

// DELETE /doctors/:id — admin only.
export async function deleteDoctor(id) {
  try {
    const response = await api.delete('/doctors/' + id);
    return response.data.data;
  } catch (error) {
    throw toAppError(error, 'The doctor could not be deleted.');
  }
}

const doctorApi = {
  listDoctors,
  getDoctor,
  getSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};

export default doctorApi;
