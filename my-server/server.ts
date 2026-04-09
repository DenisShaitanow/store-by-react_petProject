
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import cors from 'cors';
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

app.use((req, res, next) => {
  console.log(`\n🔵 ${req.method} ${req.url}`);
  console.log('📦 Headers:', req.headers['content-type']);
  console.log('📦 Body:', req.body);
  next();
});

app.post('/api/products', (req: Request<{}, {}, {userId: string}>, res) => {

    const userId = req.body.userId;
    
    if (userId) {
      console.log(BASE)
            const userFavoriteProducts = BASE.find(item => item.id === userId)?.favoriteItems || [];
            const userProducts = products.map(product => ({
            ...product,
            isLiked: userFavoriteProducts.includes(product.id) // true если id продукта есть в избранном
          }))
          console.log(userProducts[0])
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
  
  const fakeAccessToken = "fake_access_token";
  const fakeRefreshToken = "fake_refresh_token";

  const userId = uuidv4();

 

  if (req.body) {
    const newUser: IServerUser = {
      id: userId,
      profile: req.body,
      basket: [],
      favoriteItems: [],
      orders: [],
      notifications: []
    };

      BASE = [...BASE, newUser]

    res.status(200).json({
      success: true,
      refreshToken: fakeRefreshToken,
      accessToken: `Bearer ${fakeAccessToken}`,
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

  const fakeAccessToken = "fake_access_token";
  const fakeRefreshToken = "fake_refresh_token";

    const user = BASE.find(item => item.profile.email === req.body.email && item.profile.password === req.body.password)

  if (user) {
    res.status(200).json({
      success: true,
      refreshToken: fakeRefreshToken,
      accessToken: `Bearer ${fakeAccessToken}`,
      user: user.profile,
      id: user.id
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

app.post('/api/toogleLikeCard', (req: Request<{}, {}, { userId: string, id: string }>, res: Response<{success: boolean}>) => {

  console.log(BASE)
  const { userId, id: productId } = req.body;
  
  
  const user = BASE.find(item => item.id === userId);
  
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

app.listen(3000);  // ← Порт сервера
