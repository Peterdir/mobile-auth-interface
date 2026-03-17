import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PresenceState {
    statusMap: Record<number, string>; // Maps userId -> UserStatus ('ONLINE', 'OFFLINE', 'IDLE', 'DND')
}

const initialState: PresenceState = {
    statusMap: {},
};

const presenceSlice = createSlice({
    name: 'presence',
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<{ userId: number; status: string }>) => {
            state.statusMap[action.payload.userId] = action.payload.status;
        },
        setMultipleStatuses: (state, action: PayloadAction<Record<number, string>>) => {
            state.statusMap = { ...state.statusMap, ...action.payload };
        },
    },
});

export const { setStatus, setMultipleStatuses } = presenceSlice.actions;
export default presenceSlice.reducer;
