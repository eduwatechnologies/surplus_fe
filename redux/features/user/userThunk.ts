import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "./type";
import axiosInstance from "@/redux/apis/common/aixosInstance";

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (userData: User, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signup", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Sign up failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      localStorage.setItem("userToken", response?.data?.accessToken);
      localStorage.setItem("refreshToken", response?.data?.refreshToken);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (
    data: { email: string; verificationCode: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/auth/verify", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Email verification failed"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/auth/profile", profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Profile update failed"
      );
    }
  }
);

export const currentUser = createAsyncThunk(
  "auth/currentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/user");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Failed to fetch user"
      );
    }
  }
);

export const resendVerificationCode = createAsyncThunk(
  "auth/resendVerificationCode",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/resend-verification", {
        email,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Failed to resend verification code"
      );
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset ",
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/request-password-reset ",
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Password reset failed"
      );
    }
  }
);

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode  ",
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/verify-reset-code  ",
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Password reset failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { email: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || "Password reset failed"
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/auth/update-password", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "UpdatePassword reset failed"
      );
    }
  }
);

export const updatePin = createAsyncThunk(
  "auth/updatePin",
  async (data: { oldpin: string; newpin: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/update-pin", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Updatepin reset failed"
      );
    }
  }
);

export const addPin = createAsyncThunk(
  "auth/addPin",
  async (data: { pin: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/add-pin", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "pin reset failed");
    }
  }
);


// authSlice.ts
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/logout");
      localStorage.removeItem("userToken"); // 👈 clear frontend token
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Logout failed");
    }
  }
);
