import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IProduct, IFormOrderData } from "src/types";
import { mockedGetProductsApi, mockedDoOrder, toggleLikeApi } from "../../../services/api";
import { addAndDeleteToFavoriteItems } from '../../slices/userUIData';
import { useAppDispatch, useAppSelector  }  from '../../hooks/hooks';
import { selectIdUser  } from '../../selectors/user-selectors/user-selectors';
import { type TRootState  } from '../../store/store';

const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = createAsyncThunk<IProduct[], void, { state: TRootState }>(
  "getProducts",
  async (_, { rejectWithValue}) => {

    try {
      const products = await mockedGetProductsApi();
      return products;
    } catch (err) {
      
            return rejectWithValue('Token expired, please try again');
          }  
    
  },
);

export const doOrder = createAsyncThunk<string, IFormOrderData>(
  "doOrder",
  async (data, { rejectWithValue}) => {
    try {
      const order = await mockedDoOrder(data);
      console.log(order)
      return order;
    } catch (err) {
      return rejectWithValue('Error order')
  }
}
);

export const toggleLike = createAsyncThunk<
  void, 
  string, 
  { state: TRootState }
>(
  'toggleLike', 
  async (productId, { dispatch }) => {  
    
    try {
      const data = await toggleLikeApi({productId: productId});
      const success = data.success;
      if (success ) {
        dispatch(addAndDeleteToFavoriteItems(productId));
      }
    } catch (err) {
      
      console.error(err)
    }
  }
);