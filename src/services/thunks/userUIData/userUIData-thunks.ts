import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IProduct, IFormOrderData } from "src/types";
import { mockedGetProductsApi, mockedDoOrder } from "../../../services/api";
import { addAndDeleteToFavoriteItems } from '../../slices/userUIData';
import { useAppDispatch, useAppSelector  }  from '../../hooks/hooks';
import { selectIdUser  } from '../../selectors/user-selectors/user-selectors';
import { type TRootState  } from '../../store/store';

const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = createAsyncThunk<IProduct[], void, { state: TRootState }>(
  "getProducts",
  async (_, { rejectWithValue, getState }) => {

    const userId = selectIdUser(getState()) || '';

    const userIdLocal = localStorage.getItem('userId');
    const parsedUserIdLocal = userIdLocal ? JSON.parse(userIdLocal).userId : '';

    try {
      const products = await mockedGetProductsApi({userId: userId || parsedUserIdLocal || ''});
      return products;
    } catch (err) {
      return rejectWithValue("Ошибка на сервере, нет товаров.");
    }
  },
);

export const doOrder = createAsyncThunk<string, IFormOrderData>(
  "doOrder",
  async (data, { rejectWithValue }) => {
    try {
      const order = await mockedDoOrder(data);
      return order;
    } catch (err) {
      return rejectWithValue("Ошибка на сервере при создании заказа.");
    }
  },
);

export const toggleLike = createAsyncThunk<
  void, 
  string, 
  { state: TRootState }
>(
  'toggleLike', 
  async (productId, { dispatch, getState }) => {  
    
    const userId = selectIdUser(getState()) || ''; 
    
    dispatch(addAndDeleteToFavoriteItems(productId));
    
    try {
      const response = await fetch(`${API_URL}/toogleLikeCard`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ userId: userId, id: productId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка регистрации like');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      dispatch(addAndDeleteToFavoriteItems(productId));
      throw error;
    }
  }
);