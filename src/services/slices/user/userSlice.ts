import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RegistrationData } from "../../../types";

import {
  registerUser,
  logoutUser,
  checkUserAuth,
  loginUser,
  updateUser,
  changeDataInPersonalCabinet,
} from "../../thunks/user";
import { act } from "react";

interface IUserState {
  id: string
  user: RegistrationData | null;
  isAuth: boolean;
  isAuthChecked: boolean;
  loading: boolean;
  error: string | null;
}


const userId = localStorage.getItem('userId');
const parsedUserId = userId ? JSON.parse(userId).userId : '';

export const initialState: IUserState = {
  id:  parsedUserId,
  user: null,
  isAuth: false,
  isAuthChecked: false,
  loading: false,
  error: null,
};

// слайс для пользователей
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkUserAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
        state.loading = false;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.isAuthChecked = true;
        state.loading = false;
      })

      // login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.id = action.payload.id
        state.isAuth = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        
        state.isAuth = false;
        state.loading = false;
      })

      // register
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.id = action.payload.id;
        state.isAuth = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        
        state.isAuth = false;
        state.loading = false;
      })

      //changeDataInPersonalCabinet
      .addCase(changeDataInPersonalCabinet.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuth = true;
        state.loading = false;
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
        state.loading = false;
      })

      // update
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })

      // общие обработчики
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload as string;
        },
      );
  },
});

export const { resetError } = userSlice.actions;
export const userReducer = userSlice.reducer;
