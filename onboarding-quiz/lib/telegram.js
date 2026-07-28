const OCCUPATION_LABELS = {
  employed: "Работаю в найме",
  business: "Веду свой бизнес",
  blog: "Развиваю свой блог",
  freelance: "Фриланс",
  study: "Учусь",
  none: "Сейчас не работаю",
};

const INTEREST_LABELS = {
  avito: "Авито",
  tg_ads: "Telegram ADS",
  editing: "Монтаж",
  design: "Дизайн",
  p2p: "P2P",
  ai: "ИИ",
  vibe_coding: "Vibe coding",
};

const EXPERIENCE_LABELS = {
  none: "Нет, только начинает",
  some: "Было немного опыта",
  stable: "Есть стабильный доход",
};

const TIME_LABELS = {
  lt1h: "До 1 часа в день",
  "1to3h": "1–3 часа в день",
  gt3h: "Более 3 часов в день",
  flexible: "По-разному, но готов гибко",
};

const NOT_SPECIFIED = "Не указано";

function fmt(value, dict) {
  if (!value) return NOT_SPECIFIED;
  if (dict) return dict[value] || value;
  return value;
}

function formatContact(data) {
  if (!data.contactMethod) return "Пропущено";
  const label =
    data.contactMethod === "telegram"
      ? "Telegram"
      : data.contactMethod === "whatsapp"
      ? "WhatsApp"
      : "Другое";
  const value = data.contactValue ? `: ${data.contactValue}` : "";
  return `${label}${value}`;
}

function formatOccupation(data) {
  const base = fmt(data.occupation, OCCUPATION_LABELS);
  if (data.occupation === "other" && data.occupationOther) {
    return `Другое — ${data.occupationOther}`;
  }
  return base;
}

function formatInterest(data) {
  const values = Array.isArray(data.interest) ? data.interest : [];
  const labels = values.map((v) => INTEREST_LABELS[v] || v);
  if (data.interestOther) labels.push(`Другое — ${data.interestOther}`);
  return labels.length ? labels.join(", ") : NOT_SPECIFIED;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildNotificationMessage(data) {
  const dateStr = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines = [
    "🆕 <b>НОВАЯ АНКЕТА</b>",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(data.name || NOT_SPECIFIED)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(data.phone || NOT_SPECIFIED)}`,
    `💬 <b>Связь:</b> ${escapeHtml(formatContact(data))}`,
    `💼 <b>Занятость:</b> ${escapeHtml(formatOccupation(data))}`,
    "",
    `💰 <b>Интересует:</b>`,
    escapeHtml(formatInterest(data)),
    "",
    `📈 <b>Опыт заработка:</b> ${escapeHtml(fmt(data.experience, EXPERIENCE_LABELS))}`,
    `⏱ <b>Время на обучение:</b> ${escapeHtml(fmt(data.timeCommitment, TIME_LABELS))}`,
    "",
    `📚 <b>Что ждёт от курса:</b>`,
    escapeHtml(data.expectations || NOT_SPECIFIED),
    "",
    `🎯 <b>Цель:</b>`,
    escapeHtml(data.goal || NOT_SPECIFIED),
  ];

  if (data.utm && Object.values(data.utm).some(Boolean)) {
    lines.push("", "🔗 <b>UTM-метки:</b>");
    for (const [key, value] of Object.entries(data.utm)) {
      if (value) lines.push(`  ${key}: ${escapeHtml(value)}`);
    }
  }

  lines.push("", `🕐 <b>Дата заполнения:</b> ${dateStr}`);

  return lines.join("\n");
}

export async function sendTelegramNotification(data) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — уведомление не отправлено."
    );
    return { skipped: true };
  }

  const text = buildNotificationMessage(data);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${errText}`);
  }

  return res.json();
}
