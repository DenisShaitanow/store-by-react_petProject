import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChangeEvent } from "react";

import { InputUIA } from "./InputA";

const meta: Meta<typeof InputUIA> = {
  title: "InputA",
  component: InputUIA,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InputUIA>;

export const InputPassword: Story = {
  args: {
    passwordInput: true,
    title: "Password",
    type: "password",
    placeholder: "Введите пароль",
    name: "password",
    onChange: (e: ChangeEvent<HTMLInputElement>) => console.log(e.target.value),
  },
};
