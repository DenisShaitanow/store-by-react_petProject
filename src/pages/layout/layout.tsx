import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { logoutUser } from "../../services/thunks/user";
import { selectIsAuth } from "../../services/selectors/user-selectors/user-selectors";
import { Outlet } from "react-router-dom";
import { HeaderUI } from "../../ui/header";
import { SpinnerPulse } from '../../ui/spinnerPulse';
import styles from "./layout.module.css";
import { useEffect, useContext } from "react";
import { selectUserLoading } from '../../services/selectors/user-selectors/user-selectors';
import { selectUser } from "../../services/selectors/user-selectors/user-selectors";
import { getCookie } from "../../services/cookie";
import { checkUserAuth } from "../../services/thunks/user";
import { ThemeContext } from "../../context/themeContext/ThemeContext";
import { getProducts } from "../../services/thunks/userUIData/userUIData-thunks";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { theme } = useContext(ThemeContext);

  const isRegistrationPage =
    location.pathname === "/registration" ||
    location.pathname === "/loginClient";

  const isAuth: boolean = useAppSelector(selectIsAuth) || false;
  const isLoading: boolean = useAppSelector(selectUserLoading) || false;

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
    dispatch(checkUserAuth());
    dispatch(getProducts());
  }, [dispatch]);


  return (
    <>
     {isLoading ? (
      <SpinnerPulse className={styles.spinner} />
    ) : (
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
    )}
    </>
  )

}

export default Layout;
