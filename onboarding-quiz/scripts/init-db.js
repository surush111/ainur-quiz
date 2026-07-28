/* eslint-disable */
// Запуск: npm run db:init
// Создаёт таблицу submissions в вашей Turso-базе, если она ещё не создана.
// Обычно делать это вручную не обязательно — таблица создаётся автоматически
// при первой отправке анкеты, но скрипт полезен, чтобы проверить подключение.

require("dotenv").config();
const { createClient } = require("@libsql/client");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Ошибка: TURSO_DATABASE_URL не задан в .env");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      contact_method TEXT,
      contact_value TEXT,
      occupation TEXT,
      occupation_other TEXT,
      interest TEXT,
      interest_other TEXT,
      experience TEXT,
      time_commitment TEXT,
      expectations TEXT,
      goal TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      ip_hash TEXT
    );
  `);

  console.log("✅ Таблица submissions готова.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Ошибка инициализации базы данных:", err);
  process.exit(1);
});
