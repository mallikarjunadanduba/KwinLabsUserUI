import axios from "axios";
import { BaseUrl } from "BaseUrl";
import Swal from "sweetalert2";

// tod GET McqTopic DATA
export const fetchMcqTopic = async (headers) => {
  try {
    const response = await axios.get(`${BaseUrl}/mcqtopic/v1/getAllMCQTopicByPagination/{pageNumber}/{pageSize}?pageNumber=0&pageSize=10000`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch McqTopic data', 'error');
    throw error;
  }
};

// ✅ Get MCQ data for quiz/test filters
export const getMcqDataByRequest = async (filterData, headers) => {
  try {
    const res = await axios.post(`${BaseUrl}/mcqquetions/v1/getMCQDataByMCQDataRequest`, filterData, { headers });
    return res.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch filtered MCQ data', 'error');
    throw error;
  }
};

// -----------------------------
// ✅ McqExamHistory APIs
// -----------------------------

// ✅ CREATE or UPDATE ExamHistory
export const saveOrUpdateExamHistory = async (pdata, headers) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/mcqexam/v1/saveOrUpdateExamHistory`,
      JSON.stringify(pdata),
      { headers }
    );
    Swal.fire('Success', 'Exam history saved successfully', 'success');
    return res.data;
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save exam history', 'error');
    throw error;
  }
};

// ✅ GET ExamHistory by ID
export const getExamHistoryById = async (headers, id) => {
  try {
    const res = await axios.get(`${BaseUrl}/mcqexam/v1/getExamHistoryById/${id}`, {
      headers,
    });
    return res.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch exam history by ID', 'error');
    throw error;
  }
};

// ✅ GET All ExamHistories by Seeker ID
export const getExamHistoriesBySeekerId = async (headers, seekerId) => {
  try {
    const res = await axios.get(`${BaseUrl}/mcqexam/v1/getExamHistoriesBySeekerId/${seekerId}`, {
      headers,
    });
    return res.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch exam histories', 'error');
    throw error;
  }
};

// ✅ DELETE ExamHistory by ID
export const deleteExamHistoryById = async (headers, id) => {
  try {
    const res = await axios.delete(`${BaseUrl}/mcqexam/v1/deleteExamHistoryById/${id}`, {
      headers,
    });
    Swal.fire('Success', res.data, 'success');
  } catch (error) {
    Swal.fire('Error', 'Failed to delete exam history', 'error');
  }
};

// -----------------------------
// ✅ McqExamResult APIs
// -----------------------------

// ✅ CREATE or UPDATE ExamResult
export const saveOrUpdateExamResult = async (pdata, headers) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/mcqexam/v1/saveOrUpdateExamResult`,
      JSON.stringify(pdata),
      { headers }
    );
    Swal.fire('Success', 'Exam result saved successfully', 'success');
    return res.data;
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save exam result', 'error');
    throw error;
  }
};

// ✅ GET ExamResult by ID
export const getExamResultById = async (headers, id) => {
  try {
    const res = await axios.get(`${BaseUrl}/mcqexam/v1/getExamResultById/${id}`, {
      headers,
    });
    return res.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch exam result by ID', 'error');
    throw error;
  }
};

// ✅ GET All Results by ExamHistory ID
export const getResultsByExamHistoryId = async (headers, historyId) => {
  try {
    const res = await axios.get(`${BaseUrl}/mcqexam/v1/getResultsByExamHistoryId/${historyId}`, {
      headers,
    });
    return res.data;
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch exam results', 'error');
    throw error;
  }
};

// ✅ DELETE ExamResult by ID
export const deleteExamResultById = async (headers, id) => {
  try {
    const res = await axios.delete(`${BaseUrl}/mcqexam/v1/deleteExamResultById/${id}`, {
      headers,
    });
    Swal.fire('Success', res.data, 'success');
  } catch (error) {
    Swal.fire('Error', 'Failed to delete exam result', 'error');
  }
};
