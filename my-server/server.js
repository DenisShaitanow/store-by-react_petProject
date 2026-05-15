const cors = require('cors');
const cookieParser = require('cookie-parser');
const { products } = require('./constants.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/*
 * 
 * 
 * 
 * 
import 'dotenv/config';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { products } from './constants.js';
import { PrismaClient } from '@prisma/client';
 */ 

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`\n🔵 ${req.method} ${req.url}`);
  console.log('📦 Headers:', req.headers['content-type']);
  console.log('📦 Body:', req.body);
  next();
});

// ========== АВТОЗАПОЛНЕНИЕ ТОВАРОВ ПРИ ЗАПУСКЕ ==========
async function seedProducts() {
    try {
      // Проверяем, есть ли хоть один товар в БД
      const count = await prisma.product.count();
      
      if (count === 0) {
        console.log('📦 База товаров пуста. Наполняем...');
        
        // Убираем isLiked у всех товаров (он не нужен в БД)
        const productsToInsert = products.map(({ isLiked, ...product }) => product);
        
        await prisma.product.createMany({
          data: productsToInsert,
          skipDuplicates: true
        });
        
        console.log(`✅ Добавлено ${productsToInsert.length} товаров в базу данных`);
      } else {
        console.log(`✅ Товары уже есть в БД (${count} шт.)`);
      }
    } catch (error) {
      console.error('❌ Ошибка при наполнении БД товарами:', error.message);
    }
  }
  
  // Запускаем наполнение перед стартом сервера
  seedProducts();




const authMiddleware = async (req, res, next) => {
    const successToken = req.cookies.successToken;
  
    if (!successToken) {
      return res.status(401).json({
        success: false,
        error: 'No access token provided. Please login.'
      });
    }
  
    try {
      const user = await prisma.user.findFirst({
        where: { successToken: successToken }
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired access token'
        });
      }
  
      const TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000;
      if (user.dateCreateRefreshToken &&
          user.dateCreateRefreshToken + TOKEN_LIFETIME < Date.now()) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired'
        });
      }
  
      req.user = user;
      req.userId = user.id;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  app.get('/api/auth/me', async (req, res) => {
    const successToken = req.cookies.successToken;
    
    if (!successToken) {
      return res.status(401).json({ 
        isAuthenticated: false, 
        user: null 
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { successToken: successToken }
    });
    
   
    
    if (existingUser && successToken === existingUser.successToken) {
      res.status(200).json({
        isAuthenticated: true,
        user: {
          email: existingUser.email,
          password: existingUser.password, 
          name: existingUser.name,
          surname: existingUser.surname,
          avatar: existingUser.avatar,
          gender: existingUser.gender,
          location: existingUser.location,
          birthdayDate: existingUser.birthdayDate
      }
    });
    } else {
      res.status(401).json({
        isAuthenticated: false,
        user: null
      });
    }
  });

  app.post('/api/registerUser', async (req, res) => {
    const fakeSuccessToken = uuidv4();
    const fakeRefreshToken = uuidv4();
    const dateCreateRefreshToken = Date.now();
    const userId = uuidv4();
  
  
    if (!req.body) {
      return res.status(200).json({
        success: false,
        refreshToken: '',
        accessToken: '',
        user: {},
        id: '',
        userAlreadyReg: false
      });
    }
  
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email }
      });
  
      if (existingUser) {
        return res.status(200).json({
          success: false,
          refreshToken: '',
          accessToken: '',
          user: {},
          id: '',
          userAlreadyReg: true
        });
      }
  
      // Создаём нового пользователя
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: req.body.email,
          password: req.body.password, 
          name: req.body.name,
          surname: req.body.surname,
          avatar: req.body.avatar,
          gender: req.body.gender,
          location: req.body.location,
          birthdayDate: req.body.birthdayDate,
          refreshToken: fakeRefreshToken,
          dateCreateRefreshToken: dateCreateRefreshToken,
          successToken: fakeSuccessToken,
          // favoriteItems, orders, notifications создадутся пустыми автоматически
        }
      });
  
      res.cookie('successToken', fakeSuccessToken, {
        maxAge: 18000000,
        httpOnly: true
      });
  
      res.status(200).json({
        success: true,
        refreshToken: fakeRefreshToken,
        accessToken: `Bearer ${fakeSuccessToken}`,
        user: {
          email: newUser.email,
          password: newUser.password, 
          name: newUser.name,
          surname: newUser.surname,
          avatar: newUser.avatar,
          gender: newUser.gender,
          location: newUser.location,
          birthdayDate: newUser.birthdayDate,
        },
        id: newUser.id,
        userAlreadyReg: false
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.post('/api/LoginUser', async (req, res) => {
    const fakeSuccessToken = uuidv4();
    const fakeRefreshToken = uuidv4();
    const dateCreateRefreshToken = Date.now();
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: req.body.email,
          password: req.body.password 
        }
      });
  
      if (user) {
        // Обновляем токены
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            successToken: fakeSuccessToken,
            refreshToken: fakeRefreshToken,
            dateCreateRefreshToken: dateCreateRefreshToken
          }
        });
  
        res.cookie('successToken', fakeSuccessToken, {
          maxAge: 60000,
          httpOnly: true
        });
  
        res.status(200).json({
          success: true,
          refreshToken: fakeRefreshToken,
          user: {
            email: updatedUser.email,
            password: updatedUser.password, 
            name: updatedUser.name,
            surname: updatedUser.surname,
            avatar: updatedUser.avatar,
            gender: updatedUser.gender,
            location: updatedUser.location,
            birthdayDate: updatedUser.birthdayDate,
          },
          id: updatedUser.id
        });
      } else {
        res.status(200).json({
          success: false,
          refreshToken: '',
          user: {},
          id: ''
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.get('/api/LogoutUser', async (req, res) => {
    const successToken = req.cookies.successToken;
  
    if (successToken) {
      try {
        // Находим пользователя по токену и очищаем его
        const user = await prisma.user.findFirst({
          where: { successToken: successToken }
        });
  
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              successToken: '',
              refreshToken: '',
              dateCreateRefreshToken: 0
            }
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  
    res.clearCookie('successToken', { httpOnly: true });
    res.status(200).json({ success: true });
  });

  app.post('/api/toogleLikeCard', authMiddleware, async (req, res) => {
    const productId = req.body.productId;
    const userId = req.userId;
  
    try {
      // Проверяем, есть ли товар в избранном
      const existingFavorite = await prisma.favoriteItem.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        }
      });
  
      if (existingFavorite) {
        // Удаляем из избранного
        await prisma.favoriteItem.delete({
          where: {
            userId_productId: {
              userId: userId,
              productId: productId
            }
          }
        });
      } else {
        // Добавляем в избранное
        await prisma.favoriteItem.create({
          data: {
            userId: userId,
            productId: productId
          }
        });
      }
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.get('/api/products', async (req, res) => {
    const successToken = req.cookies.successToken;
  
    try {
      // Получаем все товары из БД
      const allProducts = await prisma.product.findMany();
      /*console.log(allProducts[0])*/
  
      // Если пользователь авторизован, ищем его избранное
      if (successToken) {
        const user = await prisma.user.findFirst({
          where: { successToken: successToken },
          include: {
            favoriteItems: true
          }
        });
  
        if (user) {
          const userFavoriteIds = user.favoriteItems.map(f => f.productId);
          const productsWithLiked = allProducts.map(product => ({
            ...product,
            isLiked: userFavoriteIds.includes(product.id)
          }));
  
          return res.status(200).json({
            count: productsWithLiked.length,
            data: productsWithLiked
          });
        }
      }
  
      // Если пользователь не авторизован
      const productsWithoutLiked = allProducts.map(product => ({
        ...product,
        isLiked: false
      }));
  
      res.status(200).json({
        count: productsWithoutLiked.length,
        data: productsWithoutLiked
      });
    } catch (error) {
      console.error('Products error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/DoOrder', async (req, res) => {
    const successToken = req.cookies.successToken;
  
    try {
      const user = await prisma.user.findFirst({
        where: { successToken: successToken }
      });
  
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }
  
      const formData = {
        selectСourier: req.body.selectСourier,
        adress: req.body.adress,
        adressPoint: req.body.adressPoint,
        formPaySelf: req.body.formPaySelf,
        numberCard: req.body.numberCard,
        PersonCard: req.body.PersonCard,
        CVV: string
      }

      /*const random = Math.random();
      const orderNumber = Math.floor((random * 10000000)).toString();*/
      let orderNumber;
      const allOrders = await prisma.order.findMany();

      if (allOrders.length === 0 ) { orderNumber = 1 } else {
        const orders = allOrders.map(item => parseInt(item.id))
        const hightOrder = Math.max(orders);
        orderNumber = (hightOrder + 1).toString();
        
      }

      
  
      // Создаём заказ
      await prisma.order.create({
        data: {
          id: orderNumber,
          userId: user.id,
          formData: formData,
          status: 'pending',
          createdAt: Date.now(),
          items: req.body.productList || []
        }
      });
  
      
  
      res.status(200).json({ message: orderNumber });
    } catch (error) {
      console.error('Order error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


  app.post('/api/updateUser', async (req, res) => {
    const successToken = req.cookies.successToken;
    const newInfo = req.body;
  
    try {
      const user = await prisma.user.findFirst({
        where: { successToken: successToken }
      });
  
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: newInfo.name,
          surname: newInfo.surname,
          email: newInfo.email,
          password: newInfo.password,
          avatar: newInfo.avatar,
          gender: newInfo.gender,
          location: newInfo.location,
          birthdayDate: newInfo.birthdayDate



          
        }
      });
  
      res.status(200).json({
        name: newInfo.name,
          surname: newInfo.surname,
          email: newInfo.email,
          password: newInfo.password,
          avatar: newInfo.avatar,
          gender: newInfo.gender,
          location: newInfo.location,
          birthdayDate: newInfo.birthdayDate
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.listen(3000); 


/*

const authMiddleware = (req, res, next) => {
    const successToken = req.cookies.successToken;
    
    if (!successToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'No access token provided. Please login.' 
      });
    }
    
    const user = BASE.find(u => u.successToken === successToken);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired access token' 
      });
    }
    
    if (user.dateCreateRefreshToken && user.dateCreateRefreshToken * 30 * 24 * 60 * 60 * 1000 < Date.now()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Refresh token expired' 
      });
    }
    
    req.user = user;
    req.userId = user.id;
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
        isLiked: userFavoriteProducts.includes(product.id)
      }));
      res.status(200).json({
        count: userProducts.length,
        data: userProducts
      });
    } else {
      console.log('userNo');
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
  
    if (req.body) {
      const user = BASE.find(item => item.profile.email === req.body.email);
      
      if (user) {
        return res.status(200).json({
          success: false,
          refreshToken: '',
          accessToken: '',
          user: {},
          id: '',
          userAlreadyReg: true
        });
      }
      
      const newUser = {
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
  
      BASE = [...BASE, newUser];

      res.status(200).json({
        success: true,
        refreshToken: fakeRefreshToken,
        accessToken: `Bearer ${fakeSuccessToken}`,
        user: newUser.profile,
        id: newUser.id,
        userAlreadyReg: false
      });
    } else {
      res.status(200).json({
        success: false,
        refreshToken: '',
        accessToken: '',
        user: {},
        id: '',
        userAlreadyReg: false
      });
    }
    
    res.cookie('successToken', fakeSuccessToken, {
      maxAge: 18000000, 
      httpOnly: true
    });
  });

  
  app.post('/api/LoginUser', (req, res) => {
    const fakeSuccessToken = uuidv4();
    const fakeRefreshToken = uuidv4();
    const dateCreateRefreshToken = Date.now();
  
    const user = BASE.find(item => 
      item.profile.email === req.body.email && 
      item.profile.password === req.body.password
    );
  
    if (user) {
      user.successToken = fakeSuccessToken;
      user.refreshToken = fakeRefreshToken;
      user.dateCreateRefreshToken = dateCreateRefreshToken;
  
      res.cookie('successToken', fakeSuccessToken, {
        maxAge: 60000, 
        httpOnly: true
      });
  
      res.status(200).json({
        success: true,
        refreshToken: fakeRefreshToken,
        user: user.profile,
        id: user.id
      });
    } else {
      res.status(200).json({
        success: false,
        refreshToken: '',
        user: {},
        id: ''
      });
    }
  });


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
      success: true
    });
  });
  
  app.post('/api/toogleLikeCard', authMiddleware, (req, res) => {
    const productId = req.body.productId;
    const successToken = req.cookies.successToken;
    const user = BASE.find(u => u.successToken === successToken);
    
    if (!user) {
      return res.status(200).json({ success: false, error: "User not found" });
    }
    
    const isLiked = user.favoriteItems.includes(productId);
    
    if (isLiked) {
      user.favoriteItems = user.favoriteItems.filter(id => id !== productId);
    } else {
      user.favoriteItems.push(productId);
    }
    
    res.status(200).json({ success: true });
  });
  
  const isRefreshTokenValid = (user) => {
    if (!user.refreshToken || !user.dateCreateRefreshToken) return false;
    const TOKEN_LIFETIME = 10 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - user.dateCreateRefreshToken > TOKEN_LIFETIME;
    return !isExpired;
  };
  
  app.post('/api/refresh-token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    const user = BASE.find(u => u.refreshToken === refreshToken);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    if (!isRefreshTokenValid(user)) {
      return res.status(401).json({ message: 'Refresh token expired, please login again' });
    }
    
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
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
  
    const formData = req.body.formData;
    const random = Math.random();
    const orderNumber = Math.floor((random * 10000000)).toString();
  
    user.orders.push({ order: orderNumber, formData: formData });
  
    res.status(200).json({ message: orderNumber });
  });
  
  app.post('/api/updateUser', (req, res) => {
    const successToken = req.cookies.successToken;
    const user = BASE.find(u => u.successToken === successToken);
  
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    const newInfo = req.body;
    user.profile = newInfo;
  
    res.status(200).json(user.profile);
  });
  
  
  
  app.listen(3000); 