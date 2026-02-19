import styles from "./PersonalCabinet.module.css";
import { type FC, useState, type ChangeEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../services/hooks";
import { selectUser } from "../../services/selectors/user-selectors/user-selectors";
import { FormUserInformationStepTwo } from "../registration/step2/step2/FormUserInformationStepTwo";
import { AvatarEditAccount } from "../../ui/imageUploader/avatarEditAccount";
import { type RegistrationData } from "../../types";
import { ButtonUI } from "../../ui/button";
import { PasswordInputUI } from "../../ui/password";
import { changeDataInPersonalCabinet } from "../../services/thunks/user";
import { useNavigate } from "react-router-dom";

const PersonalCabinet: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const localStorageUser = localStorage.getItem("regData");

  const parsedLocalStorageUser: RegistrationData | undefined = localStorageUser
    ? JSON.parse(localStorageUser)
    : undefined;

  const [personalCabinetData, setPersonalCabinetData] =
    useState<RegistrationData>({
      email: user?.email ?? "",
      password: user?.password || parsedLocalStorageUser?.password || "",
      name: user?.name || parsedLocalStorageUser?.name || "",
      surname: user?.surname || parsedLocalStorageUser?.surname || "",
      avatar: user?.avatar || parsedLocalStorageUser?.avatar || "",
      gender: user?.gender || parsedLocalStorageUser?.gender || "",
      location: user?.location || parsedLocalStorageUser?.location || "",
      birthdayDate:
        user?.birthdayDate || parsedLocalStorageUser?.birthdayDate || "",
    });

  const handleChangeName = (val: string) => {
    setPersonalCabinetData((prev) => ({ ...prev, name: val }));
  };

  const handleSurnameChange = (val: string) => {
    setPersonalCabinetData((prev) => ({ ...prev, surname: val }));
  };

  const handleChangeAvatar = (val: File) => {
    setPersonalCabinetData((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(val),
    }));
  };

  const handleGenderChange = (val: string) => {
    setPersonalCabinetData((prev) => ({ ...prev, gender: val }));
  };

  const handleLocationChange = (val: string) => {
    setPersonalCabinetData((prev) => ({ ...prev, location: val }));
  };

  const handleBirthdayDateChange = (val: string) => {
    setPersonalCabinetData((prev) => ({ ...prev, birthdayDate: val }));
  };

  const handleAvatar = (newImage: File) => {
    setPersonalCabinetData((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(newImage),
    }));
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPersonalCabinetData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleUpdatePersonalInformation = () => {
    localStorage.setItem("regData", JSON.stringify(personalCabinetData));
    dispatch(changeDataInPersonalCabinet(personalCabinetData));
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <AvatarEditAccount
        onImageChange={handleAvatar}
        initialAvatarUrl={user?.avatar}
      />
      <FormUserInformationStepTwo
        hiddenAvatarInput
        genderOptions={[
          { value: "man", label: "Мужской" },
          { value: "woman", label: "Женский" },
        ]}
        nameValue={personalCabinetData.name}
        nameChange={handleChangeName}
        surnameValue={personalCabinetData.surname}
        surnameChange={handleSurnameChange}
        changeAvatarUrl={handleChangeAvatar}
        genderValue={personalCabinetData.gender}
        genderChange={handleGenderChange}
        locatonValue={personalCabinetData.location}
        locationChange={handleLocationChange}
        birthdayDateChange={handleBirthdayDateChange}
        birthdayDateValue={new Date(personalCabinetData.birthdayDate)}
      />
      <PasswordInputUI
        page="register"
        value={personalCabinetData.password}
        onChange={handleChangePassword}
      />
      <ButtonUI
        label="Изменить данные"
        className={styles.changeData}
        onClick={handleUpdatePersonalInformation}
      />
    </div>
  );
};

export default PersonalCabinet;
