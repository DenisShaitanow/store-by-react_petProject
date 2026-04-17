import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RegistrationData } from "../../../types";

import {
  registerUser,
  logoutUser,
  checkUserAuth,
  loginUser,
  updateUser,
} from "../../thunks/user";

interface IUserState {
  id: string;
  user: RegistrationData | null;
  isAuth: boolean;
  isAuthChecked: boolean;
  loading: boolean;
  error: string | null;
}

const userId = localStorage.getItem('userId');
const parsedUserId = userId ? JSON.parse(userId).userId : '';

export const initialState: IUserState = {
  id: parsedUserId,
  user: null,
  isAuth: false,
  isAuthChecked: false,
  loading: false,
  error: null,
};

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
      // ========== checkUserAuth ==========
      .addCase(checkUserAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload!.user.profile;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthChecked = true;
        state.error = action.payload as string;
      })

      // ========== loginUser ==========
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('est auth')
        state.loading = false;
        state.user = action.payload.user;
        state.id = action.payload.id;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('net auth')
        state.loading = false;
        state.isAuth = false;
        state.error = action.payload as string;
      })

      // ========== registerUser ==========
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        if (action.payload.userAlreadyReg) {
          /*dodelat pozge*/
          console.error('Пользователь с такой почтой уже существует') 
          state.loading = false;
          state.isAuth = false;
        } else {
          state.loading = false;
          state.user = action.payload.user;
          state.id = action.payload.id;
          state.isAuth = true;
        }
       
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuth = false;
        state.error = action.payload as string;
      })

      

      // ========== logoutUser ==========
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuth = false;
        state.id = '';
        localStorage.removeItem('userId'); // очистить localStorage при выходе
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ========== updateUser ==========
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        console.log(action.payload)
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError } = userSlice.actions;
export const userReducer = userSlice.reducer;