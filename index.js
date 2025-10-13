import express from "express";
const app = express();
const PORT = 3000;

import dotenv from "dotenv";
dotenv.config()

import { SPWorlds } from 'spworlds';
const api = new SPWorlds({ id: process.env.ID, token: process.env.TOKEN });

const pong = await api.ping();
console.log(pong);

// Главная страница — генерирует ссылку оплаты и редиректит
app.get("/", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const successUrl = `${baseUrl}/success`;
    
    // Здесь ты обращаешься к стороннему API оплаты
    const paymentUrl = await api.initPayment({
        items: [
            {
                name: 'SomeName',
                count: '1',
                price: '1',
                comment: 'SomeComment'
            }
        ],
        redirectUrl: successUrl,
        webhookUrl: 'https://api.example.com/webhook',
        data: 'SomeString'
    });
    console.log(paymentUrl);
    // Перенаправляем пользователя на оплату
    res.redirect(paymentUrl.url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка при создании платежа");
  }
});

// Страница успеха
app.get("/success", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1>✅ Оплата прошла успешно!</h1>
        <p>Спасибо за покупку.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));