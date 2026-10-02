import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccountState {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: IAccount | null;
}

const initialState: AccountState = {
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  user: null,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<ILoginRes>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.access_token;
      state.user = action.payload.user;
    },
    setLogout: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setLogin, setLogout } = accountSlice.actions;

export default accountSlice.reducer;
