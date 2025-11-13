import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { SPWorlds } from "spworlds";

dotenv.config();

const app = express();
const PORT = 3000;

// Чтобы работали относительные пути
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // папка для CSS/JS/картинок

// Инициализация API
const api = new SPWorlds({ id: process.env.ID, token: process.env.TOKEN });
const pong = await api.ping();
console.log("SPWorlds API:", pong);

// Главная страница — форма оплаты
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Обработка оплаты
app.post("/pay", async (req, res) => {
  const { name, count, price } = req.body;

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const successUrl = `${baseUrl}/success`;

  try {
    const paymentUrl = await api.initPayment({
      items: [
        {
          name,
          count,
          price,
          comment: "Оплата через SPPay",
        },
      ],
      redirectUrl: successUrl,
      webhookUrl: `${baseUrl}/webhook`, // можешь потом добавить обработку
      data: "SomeString",
    });

    res.redirect(paymentUrl.url);
  } catch (err) {
    console.error("Ошибка при создании платежа:", err);
    res.status(500).send("Ошибка при создании платежа");
  }
});

// Страница успеха
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

// Запуск сервера
app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));