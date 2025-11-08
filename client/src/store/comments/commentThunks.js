import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Generic comment thunks that work for both posts and events
export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ resourceType, resourceId, content, parentCommentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/comments/${resourceType}/${resourceId}`,
        { content, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const getComments = createAsyncThunk(
  'comments/getComments',
  async ({ resourceType, resourceId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiUrl}/comments/${resourceType}/${resourceId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ resourceType, resourceId, commentId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.put(
        `${apiUrl}/comments/${commentId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ resourceType, resourceId, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.delete(
        `${apiUrl}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  'comments/toggleCommentLike',
  async ({ resourceType, resourceId, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const flagComment = createAsyncThunk(
  'comments/flagComment',
  async ({ resourceType, resourceId, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/comments/${resourceType}/${resourceId}/${commentId}/flag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to flag comment');
    }
  }
);