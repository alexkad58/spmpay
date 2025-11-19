import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { SPWorlds } from "spworlds";
import { sendMessage, log } from "./tg.js";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";

dotenv.config();

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const api = new SPWorlds({ id: process.env.ID, token: process.env.TOKEN });
const pong = await api.ping();
console.log("SPWorlds API:", pong);

app.get("/", (req, res) => {
  if (!req.cookies.userId) {
    const id = uuid();
    
    res.cookie("userId", id, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      httpOnly: true
    });

    log(`🆕 Новый пользователь: ${id}`);
  } else {
    log(`🔁 Вернувшийся пользователь: ${req.cookies.userId}`);
  }

  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/pay", async (req, res) => {
  const { name, price } = req.body;

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  // const successUrl = `${baseUrl}/success`;
  const successUrl = `https://sp-pay.ru/success`

  try {
    const paymentUrl = await api.initPayment({
      items: [
        {
          name,
          count: 1,
          price,
          comment: "Оплата через SP Pay",
        },
      ],
      redirectUrl: successUrl,
      // webhookUrl: `${baseUrl}/webhook`,
      webhookUrl: 'https://sp-pay.ru/webhook',
      data: name,
    });

    res.redirect(paymentUrl.url);
  } catch (err) {
    console.error("Ошибка при создании платежа:", err);
    log(`Ошибка при создании платежа: ${err}`)
    res.status(500).send("Ошибка при создании платежа");
  }
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

app.post('/webhook', (req, res) => {
  const webhookData = req.body;
  if (!req.headers['X-Body-Hash']) return log(`Не валидный вебхук: ${JSON.stringify(webhookData)}`)
  isValid = api.validateHash(webhookData, req.headers['X-Body-Hash'])
  if (!isValid) return log(`Не валидный вебхук: ${JSON.stringify(webhookData)}`)

  const message = `*Оплата через SP Pay*\n\nплательщик - *${webhookData.payer}*\nтовар - *${webhookData.data}*\nсумма - *${webhookData.amount} АР*`
  sendMessage(message)

  res.status(200).send('Webhook received and processed successfully');
});

app.listen(PORT, () => console.log(`✅ Сервер запущен`));