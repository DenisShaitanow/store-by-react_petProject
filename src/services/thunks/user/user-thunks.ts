import { setCookie, getCookie } from "../../cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCookie } from "../../cookie";
import {
  mockedRegisterUserApi,
  mockedLogoutApi,
  mockedGetUserApi,
  mockedLoginUserApi,
  changeDataInPersonalCabinetApi,
  refreshToken,
  updateUserData
} from "../../api";
import { type RegistrationData } from "../../../types";

// Регистрация пользователя
export const registerUser = createAsyncThunk<
  {
    user: RegistrationData | null;
    id: string;
    userAlreadyReg: boolean
  },
  RegistrationData
>("user/register", async (data, { rejectWithValue }) => {
  try {
    const response = await mockedRegisterUserApi(data);
    localStorage.setItem("refreshToken", response.refreshToken);
    return { user: response.user, id: response.id, userAlreadyReg: response.userAlreadyReg };
  } catch (err) {
    return rejectWithValue("Ошибка при регистрации");
  }
});

// изменение данных пользователя в личном кабинете
export const changeDataInPersonalCabinet = createAsyncThunk<
  {
    user: RegistrationData | null;
  },
  RegistrationData
>("user/changeDataInPersonalCabinet", async (data, { rejectWithValue }) => {
  try {
    const response = await changeDataInPersonalCabinetApi(data);
    const accessToken = response.accessToken.startsWith("Bearer ")
      ? response.accessToken.slice(7)
      : response.accessToken;
    setCookie("accessToken", accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    return { user: response.user };
  } catch (err) {
    return rejectWithValue("Ошибка при регистрации");
  }
});

// Логин пользователя
export const loginUser = createAsyncThunk<
  {
    user: RegistrationData | null;
    id: string
  },
    { email: string; password: string }
  >(
  "user/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await mockedLoginUserApi(data);
      
      if (user.success) {
        localStorage.setItem("refreshToken", user.refreshToken);
        return {user: user.user, id: user.id};
      } else {
        return rejectWithValue("Неверный email или пароль");
      }
      
    } catch (err) {
      return rejectWithValue("Ошибка при входе");
    }
  },
);

// Проверка авторизации пользователя
export const checkUserAuth = createAsyncThunk(
  "user/checkUserAuth",
  async (_, { rejectWithValue }) => {
    try {
      const data = await mockedGetUserApi();
      return data;
    } catch (err) {
      
          const refresh = (await refreshToken()).success;
          if (refresh) {
            try {
              const data = await mockedGetUserApi();
              return data;
              
            } catch (err) { 
              return rejectWithValue("Не авторизован");
            }
          }
    }
  }
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk<RegistrationData, RegistrationData>(
  "user/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateUserData(data);
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

// Выход пользователя
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await mockedLogoutApi();
      localStorage.removeItem("refreshToken");
    } catch (err) {
      return rejectWithValue("Ошибка при выходе");
    }
  },
);
