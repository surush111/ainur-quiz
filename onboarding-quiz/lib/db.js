import { createClient } from "@libsql/client";

// Ленивая инициализация клиента, чтобы не падать при сборке,
// если переменные окружения ещё не заданы (например, во время `next build`
// на этапе статического анализа).
let client;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL не задан. Заполните .env по инструкции из README.md"
      );
    }

    client = createClient({ url, authToken });
  }
  return client;
}

// Создаёт таблицу анкет, если её ещё нет.
// Вызывается автоматически при первой записи, а также может быть
// запущена вручную через `npm run db:init`.
export async function ensureSchema() {
  const db = getClient();
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
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_submissions_ip_hash ON submissions(ip_hash);
  `);
}

export async function insertSubmission(row) {
  const db = getClient();
  await ensureSchema();

  await db.execute({
    sql: `
      INSERT INTO submissions (
        id, created_at, name, phone, contact_method, contact_value,
        occupation, occupation_other, interest, interest_other,
        experience, time_commitment, expectations, goal,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, ip_hash
      ) VALUES (
        :id, :created_at, :name, :phone, :contact_method, :contact_value,
        :occupation, :occupation_other, :interest, :interest_other,
        :experience, :time_commitment, :expectations, :goal,
        :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :ip_hash
      );
    `,
    args: row,
  });
}

// Простая защита от спама: сколько анкет с этого IP пришло за последние N минут.
export async function countRecentSubmissionsByIp(ipHash, minutes = 10) {
  const db = getClient();
  await ensureSchema();

  const sinceIso = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const result = await db.execute({
    sql: `SELECT COUNT(*) as cnt FROM submissions WHERE ip_hash = :ip_hash AND created_at > :since;`,
    args: { ip_hash: ipHash, since: sinceIso },
  });

  return Number(result.rows[0]?.cnt ?? 0);
}

export async function listSubmissions({ limit = 50, offset = 0 } = {}) {
  const db = getClient();
  await ensureSchema();

  const result = await db.execute({
    sql: `SELECT * FROM submissions ORDER BY created_at DESC LIMIT :limit OFFSET :offset;`,
    args: { limit, offset },
  });

  return result.rows;
}
