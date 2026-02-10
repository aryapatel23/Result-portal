
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resultReducer from './slices/resultSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        results: resultReducer,
    },
});
