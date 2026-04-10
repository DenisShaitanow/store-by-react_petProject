
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { products } from '../src/constants/constants.js';
import { Request, Response } from 'express';

import {
  type IFormOrderData,
  type IProduct,
  type RegistrationData,
} from "../src/types";

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



let BASE: IServerUser[] = [];



const app = express();

app.use(cors()); // Разрешаем запросы с любых доменов
app.use(express.json()); // Для обработки JSON-запросов
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`\n🔵 ${req.method} ${req.url}`);
  console.log('📦 Headers:', req.headers['content-type']);
  console.log('📦 Body:', req.body);
  next();
});


const authMiddleware = (req, res, next) => {
  // 1. Берем accessToken из cookie
  const successToken = req.cookies.successToken;
  
  // 2. Проверяем, есть ли токен
  if (!successToken) {
    return res.status(401).json({ 
      success: false, 
      error: 'No access token provided. Please login.' 
    });
  }
  
  // 3. Ищем пользователя с таким токеном
  const user = BASE.find(u => u.successToken === successToken);
  
  // 4. Проверяем, существует ли пользователь
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired access token' 
    });
  }
  
  // 5. Проверяем, не истек ли токен по времени 
  if (user.dateCreateRefreshToken && user.dateCreateRefreshToken*30 * 24 * 60 * 60 * 1000 < Date.now()) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token expired' 
    });
  }
  
  // 6. Всё хорошо - кладем пользователя в req для следующих обработчиков
  req.user = user;
  req.userId = user.id;
  
  // 7. Передаем управление дальше
  next();
};




app.get('/api/products', (req, res) => {

  const successToken = req.cookies.successToken;
  
  
  
  
  const user = BASE.find(u => u.successToken === successToken);
  const userAccessTokenBase = user?.successToken;
    
    if (user && successToken === userAccessTokenBase) {
      
            const userFavoriteProducts = user.favoriteItems || [];
            const userProducts = products.map(product => ({
            ...product,
            isLiked: userFavoriteProducts.includes(product.id) // true если id продукта есть в избранном
          }))
          res.status(200).json({
            count: userProducts.length,
            data: userProducts
          });
    } else {
      console.log('userNo')
      res.status(200).json({
        count: products.length,
        data: products
      });
    }
  
   
});


app.post('/api/registerUser', (req, res) => {
  
  const fakeSuccessToken = uuidv4();
  const fakeRefreshToken = uuidv4();
  const dateCreateRefreshToken = Date.now();
  const userId = uuidv4();

  res.cookie('successToken', fakeSuccessToken, {
    maxAge: 900000, // живет 15 минут
    httpOnly: true
  });

  if (req.body) {
    const newUser: IServerUser = {
      id: userId,
      profile: req.body,
      refreshToken: fakeRefreshToken,
      dateCreateRefreshToken: dateCreateRefreshToken,
      successToken: fakeSuccessToken,
      basket: [],
      favoriteItems: [],
      orders: [],
      notifications: []
    };

      BASE = [...BASE, newUser]

    res.status(200).json({
      success: true,
      refreshToken: fakeRefreshToken,
      accessToken: `Bearer ${fakeSuccessToken}`,
      user: newUser.profile,
      id: newUser.id
    })
  } else {
    res.status(200).json({
      success: false,
      refreshToken: '',
      accessToken: '',
      user: {},
      id: ''
    })
  }

  

   
})

app.post('/api/LoginUser', (req, res  ) => {

  const fakeSuccessToken = uuidv4();
  const fakeRefreshToken = uuidv4();
  const dateCreateRefreshToken = Date.now();
  

  

    const user = BASE.find(item => item.profile.email === req.body.email && item.profile.password === req.body.password)


  if (user) {
    user.successToken = fakeSuccessToken;
    user.refreshToken = fakeRefreshToken;

    res.cookie('accessToken', fakeSuccessToken, {
      maxAge: 900000, // живет 15 минут
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      refreshToken: fakeRefreshToken,
      user: user.profile,
      id: user.id
    })
  } else {
    res.status(200).json({
      success: false,
      refreshToken: '',
      user: {},
      id: ''
    })
  }
})

app.post('/api/toogleLikeCard', authMiddleware, ( req: Request<{}, {}, {productId: string}>, res: Response<{success: boolean}>) => {

  
  const productId = req.body.productId;
  
  console.log(productId)
  const user = req.user;
  
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  
  
  const isLiked = user.favoriteItems.includes(productId);
  
  if (isLiked) {
    // Удаляем
    user.favoriteItems = user.favoriteItems.filter(id => id !== productId);
  } else {
    // Добавляем
    user.favoriteItems.push(productId);
  }
  
 
  
  res.status(200).json({ success: true });
  

 }
)


/*
// При создании/обновлении refreshToken
const createRefreshToken = (user: IServerUser) => {
  user.refreshToken = uuidv4();
  user.refreshTokenCreatedAt = Date.now(); // Запоминаем время создания
};

// Проверка валидности refreshToken (10 дней = 864,000,000 миллисекунд)
const isRefreshTokenValid = (user: IServerUser): boolean => {
  if (!user.refreshToken || !user.refreshTokenCreatedAt) return false;
  
  const TOKEN_LIFETIME = 10 * 24 * 60 * 60 * 1000; // 10 дней в миллисекундах
  const isExpired = Date.now() - user.refreshTokenCreatedAt > TOKEN_LIFETIME;
  
  return !isExpired;
};

// При запросе на обновление токена
app.post('/api/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  // Находим пользователя по refreshToken
  const user = BASE.find(u => u.refreshToken === refreshToken);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  // Проверяем, не истек ли refreshToken
  if (!isRefreshTokenValid(user)) {
    // Очищаем истекший токен
    user.refreshToken = '';
    user.refreshTokenCreatedAt = 0;
    return res.status(401).json({ error: 'Refresh token expired, please login again' });
  }
  
  // Создаем новый accessToken
  const newAccessToken = uuidv4();
  user.accessToken = newAccessToken;
  
  // Опционально: обновляем refreshToken (rolling refresh)
  user.refreshToken = uuidv4();
  user.refreshTokenCreatedAt = Date.now();
  
  res.json({ success: true, accessToken: `Bearer ${newAccessToken}` });
});

*/



app.listen(3000);  // ← Порт сервера
