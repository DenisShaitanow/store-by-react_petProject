import styles from "./CardPage.module.css";
import { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ButtonUI } from "../../ui/button";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { type IProduct } from "../../types";
import { selectProducts } from "../../services/selectors/userUIData-selectors/userUIData-selectors";
import { Link } from "react-router-dom";
import {
  addToBusket,
  removeFromBusket,
} from "../../services/slices/userUIData";
import { selectIsAuth } from "../../services/selectors/user-selectors/user-selectors";

const CardPage: FC = () => {
  const dispatch = useAppDispatch();
  const { idCardR } = useParams();
  const idCard: string = idCardR ? idCardR.slice(3) : "";
  const products: IProduct[] = useAppSelector(selectProducts);
  const [PutToBasketButton, setPut] = useState<boolean>(false);
  let card: IProduct;

  const navigate = useNavigate();

  useEffect(() => {
    if (!idCardR || !idCardR.includes("id=")) {
      navigate("*");
      return;
    }
  }, [idCardR, navigate]);

  if (idCard) {
    card = products.find((item) => item.id === idCard)!;
  } else {
    console.log(idCardR);
    throw new Error("Товар не найден");
  }

  const isAuth = useAppSelector(selectIsAuth);

  const handleputTobasket = () => {
    if (PutToBasketButton) {
      dispatch(removeFromBusket(card));
    } else {
      dispatch(addToBusket(card));
    }

    setPut(!PutToBasketButton);
  };

  if (idCard && card) {
    return (
      <div className={styles.container}>
        <div className={styles.leftHalf}>
          <img className={styles.image} src={card.image}></img>
          <p className={styles.price}>{`${card.price}₽`}</p>
          <ButtonUI
            dataCy="putToBasketButton"
            disabled={!isAuth}
            label={
              !isAuth
                ? "Авторизуйтесь пожалуйста"
                : PutToBasketButton
                  ? "Убрать из корзины"
                  : "Положить в корзину"
            }
            className={styles.button}
            onClick={handleputTobasket}
          />
          {!isAuth && (
            <span className={styles.regPleaseTransparant}>
              Для покупки товара, вам необходимо авторизоваться.
            </span>
          )}
        </div>

        <div className={styles.information}>
          <h2 className={styles.title}>{card.title}</h2>
          <p className={styles.description}>{card.description}</p>
        </div>
        <Link to="/" className={styles.back}>
          <ButtonUI label="Назад" className={styles.buttonBack} />
        </Link>
      </div>
    );
  } else {
    return (
      <div className={`${styles.container} ${styles.column}`}>
        <svg
          className={styles.svg}
          width="200px"
          height="200px"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>ic_fluent_emoji_sad_24_filled</title>
          <desc>Created with Sketch.</desc>
          <g
            id="🔍-Product-Icons"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <g
              id="ic_fluent_emoji_sad_24_filled"
              fill="#abd27a"
              fill-rule="nonzero"
            >
              <path
                d="M12.0000002,1.99896738 C17.523704,1.99896738 22.0015507,6.47681407 22.0015507,12.0005179 C22.0015507,17.5242217 17.523704,22.0020684 12.0000002,22.0020684 C6.47629639,22.0020684 1.99844971,17.5242217 1.99844971,12.0005179 C1.99844971,6.47681407 6.47629639,1.99896738 12.0000002,1.99896738 Z M12.0000001,13.4979816 C10.3651558,13.4979816 8.83296242,14.155799 7.71175097,15.3007764 C7.4219453,15.5967249 7.4269251,16.0715726 7.72287367,16.3613782 C8.01882223,16.6511839 8.49366985,16.6462041 8.78347552,16.3502555 C9.62535029,15.4905359 10.7726114,14.9979816 12.0000001,14.9979816 C13.2246935,14.9979816 14.3696444,15.4883577 15.211114,16.3447396 C15.5014236,16.6401939 15.976279,16.6443646 16.2717333,16.354055 C16.5671876,16.0637455 16.5713583,15.5888901 16.2810488,15.2934358 C15.1603686,14.1528953 13.6312483,13.4979816 12.0000001,13.4979816 Z M9.00044779,8.75115873 C8.3104845,8.75115873 7.75115873,9.3104845 7.75115873,10.0004478 C7.75115873,10.6904111 8.3104845,11.2497368 9.00044779,11.2497368 C9.69041108,11.2497368 10.2497368,10.6904111 10.2497368,10.0004478 C10.2497368,9.3104845 9.69041108,8.75115873 9.00044779,8.75115873 Z M15.0004478,8.75115873 C14.3104845,8.75115873 13.7511587,9.3104845 13.7511587,10.0004478 C13.7511587,10.6904111 14.3104845,11.2497368 15.0004478,11.2497368 C15.6904111,11.2497368 16.2497368,10.6904111 16.2497368,10.0004478 C16.2497368,9.3104845 15.6904111,8.75115873 15.0004478,8.75115873 Z"
                id="🎨-Color"
              ></path>
            </g>
          </g>
        </svg>
        <p className={styles.notFoundParagraph}>Товар не найден</p>
      </div>
    );
  }
};

export default CardPage;
