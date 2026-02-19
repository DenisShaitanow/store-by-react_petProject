import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { logoutUser } from "../../services/thunks/user";
import { selectIsAuth } from "../../services/selectors/user-selectors/user-selectors";
import { Outlet } from "react-router-dom";
import { HeaderUI } from "../../ui/header";
import styles from "./layout.module.css";
import { useEffect, useContext } from "react";

import { selectUser } from "../../services/selectors/user-selectors/user-selectors";
import { getCookie } from "../../services/cookie";
import { checkUserAuth } from "../../services/thunks/user";
import { ThemeContext } from "../../context/themeContext/ThemeContext";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { theme } = useContext(ThemeContext);

  const isRegistrationPage =
    location.pathname === "/registration" ||
    location.pathname === "/loginClient";

  const isAuth: boolean = useAppSelector(selectIsAuth) || false;

  const user = useAppSelector(selectUser);

  const handleLogin = () => {
    navigate("/loginClient");
  };

  const handleRegister = () => {
    navigate("/registration");
  };

  const handleClickLogout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    const accessToken = getCookie("accessToken") || "";
    if (accessToken) {
      dispatch(checkUserAuth(accessToken)); // отправляем запрос на проверку токена
    }
  }, []);

  return (
    <div className={styles.layout}>
      {!isRegistrationPage && (
        <HeaderUI
          handleClickLogout={handleClickLogout}
          user={user!}
          onLoginClick={handleLogin}
          onRegisterClick={handleRegister}
          isModal={false}
          isAuth={isAuth}
          isNotification={false}
          theme={theme}
        />
      )}

      <Outlet />
    </div>
  );
}

export default Layout;
