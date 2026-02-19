import { type ChangeEvent } from "react";

export type RevealElementUIProps = {
  visible?: boolean;
  onClick: () => void;
};

export type InputUIProps = {
  passwordInput: boolean;
  title: string;
  type: "text" | "email" | "date" | "search" | "password";
  placeholder: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  error?: boolean;
  errorText?: string;
  halfSize?: boolean; // для использования в составе компонентов для ввода даты и пола
  largeSize?: boolean; // для использования, но без кнопки редактирования
  withEditButton?: boolean; // для использования на странице профиля
  dataCy?: string;
};
