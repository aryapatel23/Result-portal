import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// --- Async Thunks ---

// Fetch all results (Admin) or Teacher's class results
export const fetchResults = createAsyncThunk(
    'results/fetchResults',
    async ({ role }, { rejectWithValue }) => {
        try {
            const endpoint = role === 'admin'
                ? '/results/admin'
                : '/teacher/dashboard'; // Teacher dashboard includes results
            const response = await axios.get(endpoint);

            if (role === 'teacher') {
                // Teacher dashboard returns { teacher, results, ... }
                return response.data.results || [];
            } else {
                // Admin returns array of results directly
                return response.data;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
        }
    }
);

// Add a new result
export const addResult = createAsyncThunk(
    'results/addResult',
    async ({ resultData, role }, { rejectWithValue }) => {
        try {
            const endpoint = role === 'teacher' ? '/teacher/results' : '/results';
            const response = await axios.post(endpoint, resultData);
            return response.data.result || response.data; // Adjust based on API response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add result');
        }
    }
);

// Update a result
export const updateResult = createAsyncThunk(
    'results/updateResult',
    async ({ id, resultData, role }, { rejectWithValue }) => {
        try {
            // Endpoint might differ slightly, but usually PUT /results/:id or /teacher/results/:id
            // Based on TeacherEditResult.jsx: /teacher/results/:id
            // AdminResultView doesn't implemented edit but let's assume /results/:id
            const endpoint = role === 'teacher' ? `/teacher/results/${id}` : `/results/${id}`;
            const response = await axios.put(endpoint, resultData);
            return response.data.result || resultData; // Optimistically return data if backend doesn't return full object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update result');
        }
    }
);

// Delete a result
export const deleteResult = createAsyncThunk(
    'results/deleteResult',
    async (id, { rejectWithValue }) => {
        try {
            // AdminResultView uses: /results/:id (via http://localhost:5000/api/results/:id)
            await axios.delete(`/results/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete result');
        }
    }
);

// --- Slice ---

const resultSlice = createSlice({
    name: 'results',
    initialState: {
        results: [],
        loading: false,
        error: null,
        operationLoading: false, // For add/update/delete operations
    },
    reducers: {
        clearResultError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Results
            .addCase(fetchResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResults.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload;
            })
            .addCase(fetchResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add Result
            .addCase(addResult.pending, (state) => {
                state.operationLoading = true;
                state.error = null;
            })
            .addCase(addResult.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.results.push(action.payload);
            })
            .addCase(addResult.rejected, (state, action) => {
                state.operationLoading = false;
                state.error = action.payload;
            })

            // Update Result
            .addCase(updateResult.pending, (state) => {
                state.operationLoading = true;
                state.error = null;
            })
            .addCase(updateResult.fulfilled, (state, action) => {
                state.operationLoading = false;
                const index = state.results.findIndex((r) => r.id === action.payload.id || r._id === action.payload._id);
                if (index !== -1) {
                    state.results[index] = { ...state.results[index], ...action.payload };
                }
            })
            .addCase(updateResult.rejected, (state, action) => {
                state.operationLoading = false;
                state.error = action.payload;
            })

            // Delete Result
            .addCase(deleteResult.pending, (state) => {
                state.operationLoading = true;
                state.error = null;
            })
            .addCase(deleteResult.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.results = state.results.filter((r) => r._id !== action.payload);
            })
            .addCase(deleteResult.rejected, (state, action) => {
                state.operationLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearResultError } = resultSlice.actions;

export default resultSlice.reducer;
