import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { currentUser, loginUser, signUpUser } from "./userThunk";
import { User } from "./type";

// initialize userToken from local storage

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state, action: PayloadAction<any>) => {
        state.loading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload;
        state.loading = false;
        // state.token = action.payload.userToken;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(loginUser.pending, (state, action: PayloadAction<any>) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      .addCase(currentUser.pending, (state, action: PayloadAction<any>) => {
        state.loading = true;
      })
      .addCase(currentUser.fulfilled, (state, action: PayloadAction<any>) => {
        // state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(currentUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
