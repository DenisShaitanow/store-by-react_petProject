
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
import { error } from 'console';

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
  orders: {order: string, formData: {}}[];
  notifications: { id: string; text: string }[];

}



let BASE: IServerUser[] = [];



const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // РАЗРЕШАЕМ cookie
}));
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
      error: 'Refresh token expired' 
    });
  }
  
  // 6. Всё хорошо - кладем пользователя в req для следующих обработчиков
  req.user = user;
  req.userId = user.id;
  
  // 7. Передаем управление дальше
  next();
};

app.get('/api/auth/me', (req, res: Response<{auth: boolean, user: IServerUser}>) => {
  const successToken = req.cookies.successToken;
  
  if (!successToken) {
    return res.status(401).json({ 
      isAuthenticated: false, 
      user: null 
    });
  }
  
  const user = BASE.find(u => u.successToken === successToken);
  
  if (user) {
    res.status(200).json({
      isAuthenticated: true,
      user: user, 
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,
      user: null
    });
  }
});




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


app.post('/api/registerUser', (req: Request<{}, {}, RegistrationData>, res) => {
  
  const fakeSuccessToken = uuidv4();
  const fakeRefreshToken = uuidv4();
  const dateCreateRefreshToken = Date.now();
  const userId = uuidv4();

  res.cookie('successToken', fakeSuccessToken, {
    maxAge: 18000000, 
    httpOnly: true
  });

  if (req.body) {
    const user = BASE.find(item => item.profile.email === req.body.email)
    if (user) {
      res.status(200).json({
        success: false,
        refreshToken: '',
        accessToken: '',
        user: {},
        id: '',
        userAlreadyReg: true
      })
    }
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
      id: newUser.id,
      userAlreadyReg: false
    })
  } else {
    res.status(200).json({
      success: false,
      refreshToken: '',
      accessToken: '',
      user: {},
      id: '',
      userAlreadyReg: false
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
    user.dateCreateRefreshToken = dateCreateRefreshToken;

    res.cookie('successToken', fakeSuccessToken, {
      maxAge: /*18000000*/60000, 
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

app.get('/api/LogoutUser', (req, res) => {
  const successToken = req.cookies.successToken;
  
  const user = BASE.find(u => u.successToken === successToken);
  
  if (user) {
   
    user.successToken = '';
    user.refreshToken = '';
    user.dateCreateRefreshToken = 0;
    
  }
  
  
  res.clearCookie('successToken', {
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
  });
});

app.post('/api/toogleLikeCard', authMiddleware, ( req: Request<{}, {}, {productId: string}>, res: Response<{success: boolean}>) => {

  
  const productId = req.body.productId;
  const successToken = req.cookies.successToken;
  
  const user = BASE.find(u => u.successToken === successToken);
  
  
  if (!user) {
    return res.status(200).json({ success: false, error: "User not found" });
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


// Проверка валидности refreshToken (10 дней = 864,000,000 миллисекунд)
const isRefreshTokenValid = (user: IServerUser): boolean => {
  if (!user.refreshToken || !user.dateCreateRefreshToken) return false;
  
  const TOKEN_LIFETIME = 10 * 24 * 60 * 60 * 1000; // 10 дней в миллисекундах
  const isExpired = Date.now() - user.dateCreateRefreshToken > TOKEN_LIFETIME;
  
  return !isExpired;
};

// При запросе на обновление токена
app.post('/api/refresh-token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  // Находим пользователя по refreshToken
  const user = BASE.find(u => u.refreshToken === refreshToken);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  
  // Проверяем, не истек ли refreshToken
  if (!isRefreshTokenValid(user)) {
    
    return res.status(401).json({ message: 'Refresh token expired, please login again' });
  }
  
  // Создаем новый accessToken
  const newAccessToken = uuidv4();
  user.successToken = newAccessToken;

  res.cookie('successToken', newAccessToken, {
    maxAge: 18000000, 
    httpOnly: true
  });
  
  
  res.status(200).json({ success: true });
});


app.post('/api/DoOrder', (req, res) => {

  const successToken = req.cookies.successToken;
  
  const user = BASE.find(u => u.successToken === successToken);

  if (!user) {
    res.status(401).json({message: 'Пользователь не найден'})
  }
  

  const formData = req.body.formData;
  const random = Math.random()
  const orderNumber = Math.floor((random*10000000)).toString();

  user?.orders.push({order: orderNumber, formData: formData})

  res.status(200).json({message: orderNumber})




})

app.post('/api/updateUser', (req, res) => {
  const successToken = req.cookies.successToken;
  
  const user = BASE.find(u => u.successToken === successToken);

  if (!user) {
    res.status(401).json({message: 'Пользователь не найден'})
  }
  
  const newInfo = req.body as RegistrationData;

  user!.profile = newInfo;

  res.status(200).json(user?.profile)
})





app.listen(3000);  // ← Порт сервера
