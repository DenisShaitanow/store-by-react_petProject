import styles from "./BasketPage.module.css";
import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonUI } from "../../ui/button";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { selectBasket } from "../../services/selectors/userUIData-selectors/userUIData-selectors";
import ProductCardInBasket from "../../ui/productCardinBasket/ProductCardInBasket";
import SadSmile from "../../ui/assets/smiley-sad-fill.svg?react";

const BasketPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productsInBasket = useAppSelector(selectBasket);

  const handleOrder = () => {
    navigate("/formOrder");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      {productsInBasket.length > 0 ? (
        <>
          <div className={styles.cardList}>
            {productsInBasket.map((card) => (
              <ProductCardInBasket
                key={card.item.id}
                card={card.item}
                count={card.count}
              />
            ))}
          </div>
          <ButtonUI
            dataCy="proceedToCheckoutOrder"
            className={styles.buttonBasket}
            label="Перейти к оформлению"
            onClick={handleOrder}
          />
        </>
      ) : (
        <div className={styles.noProducts}>
          <SadSmile />
          <span className={styles.basketEmpty}>Корзина пуста.</span>
          <ButtonUI
            label="Вернуться к покупкам"
            onClick={handleBack}
          ></ButtonUI>
        </div>
      )}
    </div>
  );
};

export default BasketPage;
