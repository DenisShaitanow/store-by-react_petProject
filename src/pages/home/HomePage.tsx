import styles from "./HomePage.module.css";
import {
  useState,
  useEffect,
  type ChangeEvent,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { getProducts } from "../../services/thunks/userUIData/userUIData-thunks";
import {
  selectProducts,
  selectLoadingProducts,
} from "../../services/selectors/userUIData-selectors/userUIData-selectors";
import type { FC } from "react";
import { ProductCard } from "../../ui/productCard";
import type { IProduct } from "../../ui/productCard/type";
import { CheckboxGroupUI } from "../../ui/checkbox";
import { CheckboxDropdown } from "../../ui/checkboxDropdown";
import { SpinnerPulse } from "../../ui/spinnerPulse";

const categoryMapping: string[] = [
  "t-shirts",
  "shoes",
  "jackets",
  "underwear",
  "hats",
  "trousers",
  "accessories",
];

const sexMapping: Record<string, string> = {
  "Для мужчин": "man",
  "Для женщин": "woman",
};

const HomePage: FC = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectLoadingProducts);

  const productsContainer = useRef<HTMLDivElement>(null);
  const productCard = useRef<HTMLDivElement>(null);
  const productsContainerWidth = productsContainer.current?.clientWidth;
  const [productsToShow, setProductsToShow] = useState<IProduct[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedSex, setSelectedSex] = useState<string[]>([]);
  const [selectedSexData, setSelectedSexData] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    (string | number)[]
  >([]);
  const [selectedCategoriesData, setSelectedCategoriesData] = useState<
    string[]
  >([]);

  const calculateVisibleProductsCount = (width: number) => {
    const productCardWidth = productCard.current?.clientWidth;
    const cardsPerRow = Math.floor(
      (width - 0.1 * width) / (productCardWidth || 160),
    );
    return cardsPerRow * 6;
  };

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const products: IProduct[] = useAppSelector(selectProducts);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Проверяем выбор категории
      if (
        selectedCategoriesData.length > 0 &&
        !selectedCategoriesData.includes(product.category)
      ) {
        return false;
      }
      // Проверяем выбор пола
      if (
        selectedSexData.length > 0 &&
        !selectedSexData.includes(product.sex)
      ) {
        return false;
      }
      return true;
    });
  }, [selectedCategoriesData, selectedSexData, products]);

  useEffect(() => {
    if (productsContainer.current) {
      const containerWidth = productsContainer.current.clientWidth;
      const visibleCardsCount = calculateVisibleProductsCount(containerWidth);
      setProductsToShow(filteredProducts.slice(0, visibleCardsCount));
    }
  }, [filteredProducts, productsContainer]);

  useEffect(() => {
    // функция для изменения количества карточек в зависимости от ширины экрана
    function handleResize() {
      if (productsContainer.current) {
        const currentWidth = productsContainer.current.clientWidth;
        const newVisibleCount = calculateVisibleProductsCount(currentWidth);
        setProductsToShow(filteredProducts.slice(0, newVisibleCount)); // Пересчет и установка новых данных
      }
    }

    // Установка слушателя resize
    window.addEventListener("resize", handleResize);

    // Удаление слушателя при уничтожении компонента
    return () => window.removeEventListener("resize", handleResize);
  }, [filteredProducts]);

  useEffect(() => {
    function handleScroll() {
      const bottomReached =
        document.documentElement.scrollTop + window.innerHeight >=
        document.documentElement.offsetHeight - 20;

      if (
        bottomReached &&
        !isLoadingMore &&
        productsToShow.length < filteredProducts.length
      ) {
        setIsLoadingMore(true);

        // Подгрузка следующей порции товаров
        const nextBatchSize = calculateVisibleProductsCount(
          productsContainerWidth!,
        ); // Размер нового шага загрузки
        const startIndex = productsToShow.length;
        const endIndex = Math.min(startIndex + nextBatchSize, products.length);
        setTimeout(() => {
          setProductsToShow((prev) => [
            ...prev,
            ...filteredProducts.slice(startIndex, endIndex),
          ]);
          setIsLoadingMore(false);
        }, 1000); // задержка для эффекта плавной загрузки
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [products, isLoadingMore, productsToShow]);

  //  обработка инпута пола пользователя, получение данных соответствующих по типу карточке товара
  const handleSex = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedItem: string = e.target.id;
      const selectedItemData: string = sexMapping[selectedItem];
      if (selectedSex.includes(selectedItem)) {
        setSelectedSex((prevSelectedItems) =>
          prevSelectedItems.filter((item) => item !== selectedItem),
        );
        setSelectedSexData((prevSelectedSexData) =>
          prevSelectedSexData.filter((item) => item !== selectedItemData),
        );
      } else {
        setSelectedSex((prevSelectedItems) => [
          ...prevSelectedItems,
          selectedItem,
        ]);
        setSelectedSexData((prevSelectedSexData) => [
          ...prevSelectedSexData,
          selectedItemData,
        ]);
      }
    },
    [setSelectedSex, setSelectedSexData, sexMapping, selectedSex],
  );

  const handleCategories = useCallback(
    (selectedValues: (string | number)[]) => {
      setSelectedCategories(selectedValues);
      setSelectedCategoriesData(
        selectedValues.map((item) => categoryMapping[item as number]),
      );
    },
    [setSelectedCategories, setSelectedCategoriesData, categoryMapping],
  );

  return (
    <>
      <div className={styles.rowContainer}>
        <div className={styles.containerFixed}>
          <div className={styles.filters}>
            <div>
              <CheckboxGroupUI
                title="Пол"
                selectedItems={selectedSex}
                fieldNames={["Для женщин", "Для мужчин"]}
                onChange={handleSex}
              />
            </div>
            <div>
              <CheckboxDropdown
                selectedValues={selectedCategories}
                onChange={handleCategories}
                title="Категория"
                staticMode
                options={[
                  "Рубашки",
                  "Обувь",
                  "Верхняя одежда",
                  "Нижнее белье",
                  "Головные уборы",
                  "Брюки",
                  "Аксессуары",
                ]}
              />
            </div>
          </div>
        </div>
        <span className={styles.greyLine}></span>
        <div className={styles.products} ref={productsContainer}>
          {isLoading ? (
            <SpinnerPulse className={styles.spinner} />
          ) : (
            <>
              {/* Первая карточка с установленным рефом */}
              <ProductCard
                ref={productCard}
                className={styles.product}
                key={productsToShow[0]?.id}
                title={productsToShow[0]?.title}
                description={productsToShow[0]?.description}
                shortDescription={productsToShow[0]?.shortDescription}
                price={productsToShow[0]?.price}
                id={productsToShow[0]?.id}
                image={productsToShow[0]?.image}
                category={productsToShow[0]?.category}
                sex={productsToShow[0]?.sex}
                isLiked={productsToShow[0]?.isLiked}
              />

              {/* Остальные карточки без рефов */}
              {productsToShow.slice(1).map((product) => (
                <ProductCard
                  className={styles.product}
                  key={product.id}
                  title={product.title}
                  description={product.description}
                  shortDescription={product.shortDescription}
                  price={product.price}
                  id={product.id}
                  image={product.image}
                  category={product.category}
                  sex={product.sex}
                  isLiked={product.isLiked}
                />
              ))}
            </>
          )}
        </div>
      </div>
      {isLoadingMore && (
        <div className={styles.spinnerContainer}>
          <SpinnerPulse className={styles.spinnerLoadCards} />
        </div>
      )}
    </>
  );
};

export default HomePage;
