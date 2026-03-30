import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getServiceVariations,
  handleVerifyMeter,
  payElectricity,
  payExam,
  purchaseAirtime,
  purchaseData,
  subscribeCable,

} from "./serviceThunk";

interface ServiceState {
  data: Record<string, any> | null;
  dataServices:any;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ServiceState = {
  data: {},
  dataServices:[],
  loading: false,
  error: null,
  success: false,
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(purchaseData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(purchaseData.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(purchaseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(purchaseAirtime.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(purchaseAirtime.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(purchaseAirtime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(payElectricity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(payElectricity.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(payElectricity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(subscribeCable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(subscribeCable.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(subscribeCable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(payExam.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(payExam.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(payExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getServiceVariations.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getServiceVariations.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(getServiceVariations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(handleVerifyMeter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(handleVerifyMeter.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(handleVerifyMeter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      

  },
});

export default serviceSlice.reducer;
