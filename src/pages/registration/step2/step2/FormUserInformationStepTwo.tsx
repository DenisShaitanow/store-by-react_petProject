import type { FC } from "react";
import styles from "./FormUserInformationStepTwo.module.css";
import type { FormUserInformationStepTwoProps } from "./type";

import { AvatarRegistration } from "../../../../ui/imageUploader/avatarRegistration";
import { InputUI } from "../../../../ui/input";
import { InputDropDown } from "../../../../ui/inputDropDown/imputDropDownSimple";
import { InputDropDownCalendar } from "../../../../ui/inputDropDown/inputDropDownCalendar";

export const FormUserInformationStepTwo: FC<
  FormUserInformationStepTwoProps
> = ({
  hiddenAvatarInput,
  changeAvatarUrl,
  nameValue,
  nameChange,
  surnameValue,
  surnameChange,
  birthdayDateChange,
  birthdayDateValue,
  genderOptions,
  genderValue,
  genderChange,
  locatonValue,
  locationChange,
}) => {
  // для имени
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    
      nameChange(e.target.value as string);
    
  };

  const handleChangeSurname = (e: React.ChangeEvent<HTMLInputElement>) => {
    
      surnameChange(e.target.value as string);
    
  };

  // Специализированный обработчик для файлов для Аватарки
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0]; // Берём первый файл
      changeAvatarUrl(selectedFile);
      console.log(URL.createObjectURL(selectedFile));
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      genderChange(e.target.value as string);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
      locationChange(e.target.value as string);
    
  };

  const handleChangeDate = (val: Date | null) => {
    const dateString = val ? val.toISOString().slice(0, 10) : "";
    birthdayDateChange(dateString);
  };

  return (
    <form className={styles.container} data-cy={"containerFormStep2"}>
      {!hiddenAvatarInput && (
        <AvatarRegistration onImageChange={handleFileChange} />
      )}
      <InputUI
        title="Имя"
        type="text"
        placeholder="Введите ваше имя"
        name="name"
        onChange={handleChangeName}
        value={nameValue}
        dataCy={"registrationInputName"}
      />
      <InputUI
        title="Фамилия"
        type="text"
        placeholder="Введите вашу фамилию"
        name="surname"
        onChange={handleChangeSurname}
        value={surnameValue}
        dataCy={"registrationInputSurname"}
      />
      <div className={styles.twoShortInputs}>
        <InputDropDownCalendar
          onChangeDate={handleChangeDate}
          title="Дата рождения"
          id="dateBirthday"
          placeholder="дд.мм.гггг"
          className={styles.calendar}
          value={birthdayDateValue}
        />
        <InputDropDown
          options={genderOptions}
          withInput={false}
          id="gender"
          placeholder="Не указан"
          title="Пол"
          value={genderValue}
          onChangeOption={handleGenderChange}
          classNameImageOpen={styles.aroundImage}
          dataCy={"registrationInputGender"}
        />
      </div>
      <InputUI
        title="Город"
        type="text"
        placeholder="Введите названия вашего города"
        name="location"
        onChange={handleLocationChange}
        value={locatonValue}
        dataCy={"registrationInputCity"}
      />
    </form>
  );
};
