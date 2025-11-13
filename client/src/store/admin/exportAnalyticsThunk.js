import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const exportAnalytics = createAsyncThunk(
  'admin/exportAnalytics',
  async ({ format }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/admin/export`,
        { format },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Important for file download
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, format };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to export analytics');
    }
  }
);