import { setCookie, getCookie } from "./cookie";

import {
  type IFormOrderData,
  type IProduct,
  type RegistrationData,
} from "../types";


const API_URL = import.meta.env.VITE_API_URL;


export const mockedGetProductsApi = async (): Promise<IProduct[]> => {
  const response = await fetch(`${API_URL}/products`,
    {
      credentials: 'include' 
    }
  )

  if (!response.ok) {
    const resFail = await response.json();
    const message = resFail.message;
    if (message === 'Invalid or expired access token') {
      throw new Error('Invalid or expired access token');
    }
    
  }
  
  const products = (await response.json()).data;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return products;
}





const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

type TServerResponse<T> = {
  success: boolean;
} & T;



export const refreshToken =  (): Promise<{success: boolean}> =>
  {
    const refreshToken = localStorage.getItem("refreshToken");
    return fetch(`${API_URL}/refresh-token`, {
      method: "POST",
      credentials: 'include' ,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({refreshToken}),
      })
    
      .then((res) => {if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.message);
        });
      }
      return res.json();})
      .then((refreshData) => {
        if (!refreshData.success) {
          throw new Error('Need autentification')
        }
        

        return {success: true}
      
  });
}



// Фиктивные токены
const fakeAccessToken = "fake_access_token";
const fakeRefreshToken = "fake_refresh_token";


// ServerFunction
export function mockedRegisterUserApi(data: RegistrationData): Promise<{
  success: boolean;
  refreshToken: string;
  user: RegistrationData;
  id: string;
  userAlreadyReg: boolean
  
}> {
  
  return fetch(`${API_URL}/registerUser`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка регистрации');
      }
      return response.json();
    })
    .then((data) => {
      return {
        success: data.success,
        refreshToken: data.refreshToken,
        user: data.user,
        id: data.id,
        userAlreadyReg: data.userAlreadyReg
    }});
    
  
}

interface IServerUser {
 
  id: string;
  // Профиль
  profile: RegistrationData;
  refreshToken: string;
  dateCreateRefreshToken: number;
  successToken: string;
  // Пользовательские данные (аналог клиентского IUserState)
  basket: Array<{ item: IProduct; count: number }>;
  favoriteItems: string[]; // массив id продуктов
  orders: string[];
  notifications: { id: string; text: string }[];

}

// Server function
export async function mockedGetUserApi(): Promise<{
  isAuthenticated: boolean;
  user: IServerUser
}> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })

  if (!response.ok) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Ошибка сверки аксесс-токена')
  }

  const data = response.json()
  await new Promise(resolve => setTimeout(resolve, 1000));
  return data;
}

export function changeDataInPersonalCabinetApi(
  data: RegistrationData,
): Promise<{
  success: boolean;
  refreshToken: string;
  accessToken: string;
  user: RegistrationData;
}> {
  const fakeRegistrationData = {
    email: data.email,
    password: data.password,
    name: data.name,
    surname: data.surname,
    avatar: data.avatar,
    gender: data.gender,
    location: data.location,
    birthdayDate: data.birthdayDate,
  };
  // Ответ регистрации
  const mockSuccessResponse = {
    success: true,
    refreshToken: fakeRefreshToken,
    accessToken: `Bearer ${fakeAccessToken}`,
    user: fakeRegistrationData,
  };

  return new Promise((resolve) => {
    // Здесь можем добавить проверку данных или любые условия
    resolve(mockSuccessResponse); // Возвращаем заготовленную структуру
  });
}

type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: RegistrationData;
}>;




//Server function
export function mockedLogoutApi(): Promise<{ success: boolean }> {
  return fetch(`${API_URL}/LogoutUser`, {
    credentials: 'include',
  }).then(
    (res) => {
      if (res.ok) {
        return res.json()
      } else {
        throw new Error('Проблемa с лог аутом')
      }
    }
  ).then(
    (data) => {
      return {success: data.success}
    }
  )
}

// Server function
export const mockedLoginUserApi = async (data: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  refreshToken: string;
  user: RegistrationData;
  id: string;
  
}> => {


  return fetch(`${API_URL}/LoginUser`, {
    method: 'POST',
    credentials: 'include',
    headers:  {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }
    return response.json();
  })
  .then((data) => ({
    success: data.success,
    refreshToken: data.refreshToken,
    user: data.user,
    id: data.id
  }));



}


export const mockedDoOrder = async (
  formData: IFormOrderData,
): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/DoOrder`, {
      method: 'POST',
      credentials: 'include',  
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации like');
    }

    const data = await response.json();
    console.log(data)
    return data.order;
    
  } catch (error) {
    
    throw error;
  }

};




export const toggleLikeApi = async (id: Record<'productId', string>): Promise<{success: boolean}> => {
  try {
    const response = await fetch(`${API_URL}/toogleLikeCard`, {
      method: 'POST',
      credentials: 'include',  
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(id),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации like');
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    
    throw error;
  }

}

export const updateUserData = async (data: RegistrationData) :Promise<RegistrationData> => {

  try {
  const response = await fetch(`${API_URL}/updateUser`, {
      method: 'POST',
      credentials: 'include',  
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message)
    }

    const dat = await response.json() as RegistrationData;
    return dat;
  } catch(err) {
    
    throw err;
    
  }

}