
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Get initial state from localStorage if available
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const initialState = {
    user: user || null,
    token: token || null,
    role: role || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ role, credentials }, { rejectWithValue }) => {
        try {
            let response;
            if (role === 'student') {
                response = await axios.post('/student/login', credentials);
            } else {
                response = await axios.post('/auth/login', credentials);
                if (response.data.user.role !== role) {
                    throw new Error(`This login is for ${role}s only`);
                }
            }

            const data = response.data;

            // Store in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);

            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Login failed'
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.role = action.payload.user.role;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.role = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
