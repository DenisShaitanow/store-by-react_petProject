import { type TRootState } from "@store/store";

export const selectUser = (state: TRootState) => state.user.user;
export const selectIdUser = (state: TRootState) => state.user.id;
export const selectIsAuthChecked = (state: TRootState) =>
  state.user.isAuthChecked;
export const selectIsAuth = (state: TRootState) => state.user.isAuth;
export const selectUserLoading = (state: TRootState) => state.user.loading;
export const selectUserError = (state: TRootState) => state.user.error;
