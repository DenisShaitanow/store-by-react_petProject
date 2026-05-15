// robot-server.js
import express from 'express';
import { products } from './src/constants/constants.js';

const app = express();
const PORT = 3001;

// Главная страница для роботов
app.get('/', (req, res) => {
    let linksHtml = '';
    for (const product of products) {
        linksHtml += `<a href="/card/id=${product.id}">${product.title}</a><br/>\n`;
    }
    
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Все товары | Магазин</title>
    <meta name="description" content="Каталог всех товаров интернет-магазина">
</head>
<body>
    <h1>Все товары</h1>
    ${linksHtml}
</body>
</html>
    `;
    res.send(html);
});

// Карточка товара для роботов
app.get('/card/id=:id', (req, res) => {
    const productId = req.params.id;
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        res.status(404).send(`
<!DOCTYPE html>
<html>
<head><title>404 Товар не найден</title></head>
<body><h1>404 Товар не найден</h1><a href="/">Вернуться на главную</a></body>
</html>
        `);
        return;
    }
    
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>${product.title} | Магазин</title>
    <meta name="description" content="${product.description || product.title}">
    <meta property="og:title" content="${product.title}">
    <meta property="og:description" content="${product.description || product.title}">
    <meta property="og:price" content="${product.price}">
</head>
<body>
    <h1>${product.title}</h1>
    <p>Цена: ${product.price}₽</p>
    <p>${product.description || ''}</p>
    <img src="${product.image || ''}" alt="${product.title}">
    
    <!-- Ссылки для навигации робота -->
    <a href="/">На главную</a>
    <a href="/card/id=${getNextProductId(product.id)}">Следующий товар</a>
    <a href="/card/id=${getPrevProductId(product.id)}">Предыдущий товар</a>
</body>
</html>
    `;
    res.send(html);
});

// О странице
app.get('/about', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head><title>О компании | Магазин</title>
<meta name="description" content="Информация о нашей компании"></head>
<body>
    <h1>О компании</h1>
    <p>Мы продаём технику с 2020 года...</p>
    <a href="/">На главную</a>
</body>
</html>
    `);
});

// Вспомогательные функции
function getNextProductId(currentId) {
    const currentIndex = products.findIndex(p => p.id === currentId);
    if (currentIndex < products.length - 1) {
        return products[currentIndex + 1].id;
    }
    return products[0].id;
}

function getPrevProductId(currentId) {
    const currentIndex = products.findIndex(p => p.id === currentId);
    if (currentIndex > 0) {
        return products[currentIndex - 1].id;
    }
    return products[products.length - 1].id;
}

app.listen(PORT, () => {
    console.log(`🤖 Robot server running on port ${PORT}`);
    console.log(`   Total products: ${products.length}`);
});