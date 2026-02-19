import type { FC } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./inputDropDown.module.css";
import type { InputDropDownProps } from "./type";

import AngleOpen from "../../assets/angleOpenInput.svg?react";
import KrestClose from "../../assets/krestCloseInput.svg?react";

const findLabelByValue = (
  options: { value: string; label: string }[],
  value: string,
) => {
  const foundOption = options.find((opt) => opt.value === value);
  return foundOption?.label || "";
};

export const InputDropDown: FC<InputDropDownProps> = ({
  options,
  withInput,
  onChangeOption,
  className = "",
  classNameImageOpen = "",
  id,
  title,
  value, // Получаем начальное значение из props
  placeholder,
  error,
  dataCy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options); // Фильтрованные опции
  const [selectedValue, setSelectedValue] = useState(value); // Новое состояние для хранения выбранного значения
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const val = findLabelByValue(options, value as string);
    setSelectedLabel(val);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      const fakeEvent: React.ChangeEvent<HTMLInputElement> = {
        target: {
          name: id, // Имя поля совпадает с ID компонента
          value: optionValue, // Значение выбираемого варианта
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>; // Приведение типа

      onChangeOption(fakeEvent); // Передаем изменение вверх по дереву компонентов
      setSelectedValue(optionValue); // Устанавливаем выбранное значение
      setSearchTerm(""); // Очищаем строку поиска после выбора варианта
      setIsOpen(false); // Закрываем список
    },
    [onChangeOption, id],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = event.target.value.trim().toLowerCase(); // Преобразование строки в нижний регистр
      setSearchTerm(newSearchTerm);

      // Фильтруем варианты по введённой строке
      const filteredOpts = options.filter((opt) =>
        opt.label.toLowerCase().startsWith(newSearchTerm),
      );
      setFilteredOptions(filteredOpts);

      if (newSearchTerm === "") {
        setIsOpen(false); // Закрываем список, если строка пустая
      } else {
        setIsOpen(true); // Открываем список, если введена хотя бы одна буква
      }
    },
    [options],
  );

  const renderOptions = () =>
    filteredOptions.map((option, index) => (
      <div
        data-cy={`genderOption${index}`}
        key={option.value}
        onClick={() => handleOptionClick(option.value)}
        className={styles.option}
        role="menuitem"
        tabIndex={0}
      >
        {option.label}
      </div>
    ));

  return (
    <>
      <div ref={containerRef} className={`${styles.container} ${className}`}>
        <label className={styles.label} htmlFor={id}>
          {title}
        </label>
        <div className={`${isOpen ? styles.borderDone : ""}`}>
          <div
            data-cy={"inputDroppdownSelect"}
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`${isOpen ? `${styles.selectOpen} ${styles.select} ${classNameImageOpen}` : styles.select}`}
          >
            {withInput && (
              <input
                ref={inputRef}
                type="text"
                id={id}
                name={id}
                autoComplete="off"
                className={`${
                  !!error ? `${styles.inputError}` : ""
                } ${styles.input}`}
                placeholder={placeholder || ""}
                value={
                  searchTerm || selectedLabel // Если есть активный фильтр, используем его, иначе выводим выбранное значение
                }
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)} // Открытие списка при получении фокуса
                onBlur={() => {
                  setTimeout(() => {
                    setIsOpen(false); // Через небольшой таймаут закрываем список, если потеря фокуса произошла вне нажатия кнопки мыши
                  }, 100);
                }}
              />
            )}
            {!withInput && <>{selectedLabel || placeholder} </>}
            {isOpen && <KrestClose className={styles.svg} />}
            {!isOpen && (
              <AngleOpen
                className={styles.svg}
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation(); // Остановка всплытия события
                  setIsOpen(true); // Изменяем состояние
                }}
              />
            )}
          </div>

          {isOpen && (
            <div
              className={`${isOpen ? `${styles.optionsContainerOpen} ${styles.optionsContainer}` : styles.optionsContainer}`}
            >
              {renderOptions()}
            </div>
          )}
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    </>
  );
};
