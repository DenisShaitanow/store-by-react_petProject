import { setCookie, getCookie } from "../../cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCookie } from "../../cookie";
import {
  mockedRegisterUserApi,
  mockedLogoutApi,
  mockedGetUserApi,
  mockedLoginUserApi,
  mockUpdateUserApi,
  changeDataInPersonalCabinetApi,
} from "../../api";
import { type RegistrationData } from "../../../types";

// Регистрация пользователя
export const registerUser = createAsyncThunk<
  {
    user: RegistrationData | null;
    id: string
  },
  RegistrationData
>("user/register", async (data, { rejectWithValue }) => {
  try {
    const response = await mockedRegisterUserApi(data);
    localStorage.setItem("refreshToken", response.refreshToken);
    return { user: response.user, id: response.id };
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
      const response = await mockedLoginUserApi(data);
      if (response.success) {
        localStorage.setItem("refreshToken", response.refreshToken);
      const accessToken = response.accessToken.startsWith("Bearer ")
        ? response.accessToken.slice(7)
        : response.accessToken;
        setCookie("accessToken", accessToken);
        return {user: response.user, id: response.id};
      } else {
        return rejectWithValue("Неверный email или пароль");
      }
      
    } catch (err) {
      return rejectWithValue("Ошибка при входе");
    }
  },
);

// Проверка авторизации пользователя
export const checkUserAuth = createAsyncThunk<RegistrationData, string>(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = getCookie("accessToken");
      const data = await mockedGetUserApi(accessToken || "");
      return data;
    } catch (err) {
      return rejectWithValue("Не авторизован");
    }
  },
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk<RegistrationData, RegistrationData>(
  "user/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await mockUpdateUserApi(data);
      return response.user;
    } catch (err) {
      return rejectWithValue("Ошибка при обновлении данных");
    }
  },
);

// Выход пользователя
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await mockedLogoutApi();
      console.log("exit");
      localStorage.removeItem("refreshToken");
      deleteCookie("accessToken");

      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    } catch (err) {
      return rejectWithValue("Ошибка при выходе");
    }
  },
);
