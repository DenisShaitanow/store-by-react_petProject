import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IProduct } from "../../types/index";
import { getProducts, doOrder } from "../thunks/userUIData/userUIData-thunks";
import { act } from "react";

interface IUserState {
  loadingProducts: boolean;
  products: IProduct[];
  favoriteItems: string[];
  notifications: { id: string; text: string }[];
  basket: Array<{ item: IProduct; count: number }>;
  error: string;
  orders: string[];
  errorOrder: string;
  loadingOrder: boolean;
}

export const initialState: IUserState = {
  loadingProducts: false,
  products: [],
  favoriteItems: [],
  notifications: [],
  basket: [],
  error: "",
  orders: [],
  errorOrder: "",
  loadingOrder: false,
};

const userUIDataSlice = createSlice({
  name: "userUIData",
  initialState,
  reducers: {
    resetFavoriteItems: (state) => {
      state.favoriteItems = [];
    },
    resetNotifications: (state) => {
      state.notifications = [];
    },
    resetBusket: (state) => {
      state.basket = [];
    },
    addAndDeleteToFavoriteItems: (state, action) => {
      const productId = action.payload;
      const indexOfProduct = state.products.findIndex(
        (product) => product.id === productId,
      );

      if (indexOfProduct >= 0) {
        state.products[indexOfProduct].isLiked =
          !state.products[indexOfProduct].isLiked;

        if (state.favoriteItems.includes(productId)) {
          state.favoriteItems = state.favoriteItems.filter(
            (id) => id !== productId,
          );
        } else {
          state.favoriteItems.push(productId);
        }
      }
      localStorage.setItem("products", JSON.stringify(state.products));
    },
    addToBusket: (state, action: PayloadAction<IProduct>) => {
      const existingItem = state.basket.find(
        (unit) => unit.item.id === action.payload.id,
      );
      existingItem
        ? existingItem.count++
        : state.basket.push({ item: action.payload, count: 1 });
      localStorage.setItem("basket", JSON.stringify(state.basket));
    },
    removeFromBusket: (state, action: PayloadAction<IProduct>) => {
      const existingItem = state.basket.find(
        (unit) => unit.item.id === action.payload.id,
      );
      if (existingItem) {
        if (existingItem.count > 1) {
          existingItem.count--;
        } else {
          console.log("aaaa");
          state.basket = state.basket.filter(
            (item) => item.item.id !== action.payload.id,
          );
        }
        localStorage.setItem("basket", JSON.stringify(state.basket));
      }
    },

    removeFromFavoriteItems: (state, action: PayloadAction<string>) => {
      state.favoriteItems = state.favoriteItems.filter(
        (item) => item !== action.payload,
      );
      localStorage.setItem(
        "products",
        JSON.stringify(
          state.favoriteItems.filter((item) => item !== action.payload),
        ),
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loadingProducts = true;
      })
      .addCase(
        getProducts.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.products = action.payload;
          state.loadingProducts = false;
        },
      )
      .addCase(getProducts.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(doOrder.pending, (state) => {
        state.loadingOrder = true;
      })
      .addCase(doOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.orders = [...state.orders, action.payload];
        state.loadingProducts = false;
        state.basket = [];
      })
      .addCase(doOrder.rejected, (state, action) => {
        state.errorOrder = action.payload as string;
      });
  },
});

export const {
  resetFavoriteItems,
  resetNotifications,
  resetBusket,
  addToBusket,
  removeFromBusket,
  removeFromFavoriteItems,
  addAndDeleteToFavoriteItems,
} = userUIDataSlice.actions;

export const userUIDataReducer = userUIDataSlice.reducer;
