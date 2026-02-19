import type { FC } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./inputDropDownCalendar.module.css";
import type { InputDropDownCalendarProps } from "./type";
import { SimpleDatePicker } from "../../calendar/datepicker";

// Функция проверки правильности формата даты (DD/MM/YYYY).
const isValidDateFormat = (dateStr: string) => {
  // Поддерживаем три варианта разделителя: точка `.`, дефис `-` и слэш `/`
  const regex = /^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/;
  return regex.test(dateStr);
};

export const InputDropDownCalendar: FC<InputDropDownCalendarProps> = ({
  onChangeDate,
  className = "",
  id,
  title,
  value,
  placeholder,
  error,
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Получаем цель клика
      const targetNode = event.target as HTMLElement;

      // Проверяем, произошло ли событие внутри самого компонента или вне
      if (
        containerRef.current &&
        !containerRef.current.contains(targetNode) &&
        !(calendarRef.current && calendarRef.current.contains(targetNode))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const [selectDate, setSelectDate] = useState<Date | null>(value || null); // Дата, выбранная в календаре
  const [isOpen, setIsOpen] = useState(false); // Флаг открытия окна календаря
  const [manualInput, setManualInput] = useState<string>(""); // Ручной ввод даты

  const handleOnChange = (date: Date | null) => {
    setManualInput("");
    setSelectDate(date);
    onChangeDate(date);
    setIsOpen(false);
  };

  // Обработчик изменения при вводе вручную
  const handleManualInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = event.target.value.trim();
    if (inputValue === "") {
      setSelectDate(null);
      onChangeDate(null); // Оповещаем родительский компонент об очистке выбора
      setManualInput("");
      return;
    }
    // Проверяем, является ли введённая строка валидной датой
    if (isValidDateFormat(inputValue)) {
      try {
        // Замещаем точки на запятые, чтобы корректно передать новую дату
        let parsedDate = new Date(inputValue.replace(/\./g, ","));

        if (!isNaN(parsedDate.getTime())) {
          setSelectDate(parsedDate); // Устанавливаем выбор даты
          onChangeDate(parsedDate); // Отправляем реальную дату в колбек
        }
      } catch (err) {}
    }

    setManualInput(inputValue); // Сохраняем текущее значение ввода
  };

  return (
    <>
      <div className={`${styles.container} ${className}`}>
        <label className={styles.label} htmlFor={id}>
          {title}
        </label>

        <div
          ref={containerRef}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className={styles.select}
        >
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
            value={manualInput || (selectDate?.toLocaleDateString() ?? "")}
            onChange={handleManualInputChange}
            onFocus={() => setIsOpen(true)}
            data-cy={"registrationInputBirthday"}
          />
          <svg
            className={styles.calendar}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
          >
            <path
              fill="var(--text-color)"
              d="M8.34904 6.18605c-.38139 0-.69767-.31628-.69767-.69768v-2.7907c0-.38139.31628-.69767.69767-.69767.3814 0 .69768.31628.69768.69767v2.7907c0 .3814-.31628.69768-.69768.69768Zm7.44186 0c-.3814 0-.6976-.31628-.6976-.69768v-2.7907c0-.38139.3162-.69767.6976-.69767s.6977.31628.6977.69767v2.7907c0 .3814-.3163.69768-.6977.69768ZM8.81402 14.3256c-.12093 0-.24186-.0279-.35349-.0744-.12093-.0465-.21395-.1117-.30697-.1954-.16744-.1767-.26977-.4093-.26977-.6605 0-.1209.02791-.2418.07442-.3534.04651-.1117.11163-.214.19535-.307.09302-.0837.18604-.1489.30697-.1954.33489-.1395.75349-.0651 1.01396.1954.16744.1767.26976.4186.26976.6604 0 .0559-.0093.121-.0186.1861-.0093.0558-.02791.1116-.05582.1674-.0186.0559-.0465.1117-.08371.1675-.02791.0465-.07442.093-.11163.1395-.17675.1674-.41861.2698-.66047.2698Zm3.25588 0c-.1209 0-.2419-.0279-.3535-.0744-.1209-.0466-.214-.1117-.307-.1954-.1674-.1768-.2698-.4093-.2698-.6605 0-.1209.028-.2418.0745-.3535.0465-.1116.1116-.2139.1953-.3069.093-.0837.1861-.1489.307-.1954.3349-.1488.7535-.0651 1.0139.1954.1675.1767.2698.4186.2698.6604 0 .0558-.0093.121-.0186.1861-.0093.0558-.0279.1116-.0558.1674-.0186.0558-.0465.1116-.0837.1675-.0279.0465-.0744.093-.1117.1395-.1767.1674-.4186.2698-.6604.2698Zm3.2558 0c-.1209 0-.2418-.0279-.3534-.0744-.121-.0466-.214-.1117-.307-.1954-.0372-.0465-.0744-.093-.1117-.1395-.0372-.0559-.0651-.1117-.0837-.1675-.0279-.0558-.0465-.1116-.0558-.1674-.0093-.0651-.0186-.1303-.0186-.1861 0-.2418.1023-.4837.2698-.6604.093-.0837.186-.1489.307-.1954.3441-.1488.7534-.0651 1.0139.1954.1674.1767.2698.4186.2698.6604 0 .0558-.0093.121-.0186.1861-.0093.0558-.0279.1116-.0558.1674-.0187.0558-.0466.1116-.0838.1675-.0279.0465-.0744.093-.1116.1395-.1767.1674-.4186.2698-.6605.2698Zm-6.51168 3.2558c-.12093 0-.24186-.0279-.35349-.0744-.11163-.0465-.21395-.1117-.30697-.1954-.16744-.1767-.26977-.4186-.26977-.6604 0-.121.02791-.2419.07442-.3535.04651-.121.11163-.2233.19535-.307.34418-.3442.97674-.3442 1.32093 0 .16744.1768.26976.4186.26976.6605 0 .2418-.10232.4837-.26976.6604-.17675.1675-.41861.2698-.66047.2698Zm3.25588 0c-.2419 0-.4837-.1023-.6605-.2698-.1674-.1767-.2698-.4186-.2698-.6604 0-.121.028-.2419.0745-.3535.0465-.121.1116-.2233.1953-.307.3442-.3442.9768-.3442 1.3209 0 .0838.0837.1489.186.1954.307.0465.1116.0744.2325.0744.3535 0 .2418-.1023.4837-.2698.6604-.1767.1675-.4186.2698-.6604.2698Zm3.2558 0c-.2418 0-.4837-.1023-.6604-.2698-.0837-.0837-.1489-.186-.1954-.3069-.0465-.1117-.0744-.2326-.0744-.3535 0-.1209.0279-.2419.0744-.3535.0465-.1209.1117-.2233.1954-.307.2139-.2139.5395-.3163.8372-.2512.0651.0093.1209.028.1767.0559.0558.0186.1117.0465.1675.0837.0465.0279.093.0744.1395.1116.1674.1768.2698.4186.2698.6605 0 .2418-.1024.4837-.2698.6604-.1767.1675-.4186.2698-.6605.2698Zm4.6513-7.59074H4.16301c-.3814 0-.69768-.31628-.69768-.69768 0-.38139.31628-.69767.69768-.69767H19.977c.3814 0 .6976.31628.6976.69767 0 .3814-.3162.69768-.6976.69768Z"
            />
            <path
              fill="var(--text-color)"
              d="M15.7907 22H8.34884C4.95349 22 3 20.0465 3 16.6512V8.74419c0-3.39535 1.95349-5.34883 5.34884-5.34883h7.44186c3.3953 0 5.3488 1.95348 5.3488 5.34883v7.90701c0 3.3953-1.9535 5.3488-5.3488 5.3488ZM8.34884 4.7907c-2.66047 0-3.95349 1.29303-3.95349 3.95349v7.90701c0 2.6604 1.29302 3.9535 3.95349 3.9535h7.44186c2.6605 0 3.9535-1.2931 3.9535-3.9535V8.74419c0-2.66046-1.293-3.95349-3.9535-3.95349H8.34884Z"
            />
          </svg>
        </div>

        {isOpen && (
          <div
            ref={calendarRef}
            className={`${isOpen ? `${styles.optionsContainerOpen} ${styles.optionsContainer}` : styles.optionsContainer}`}
          >
            <SimpleDatePicker onChange={handleOnChange} selected={value} />
          </div>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </>
  );
};
