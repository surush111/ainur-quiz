import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { validateSubmission } from "@/lib/validation";
import { insertSubmission, countRecentSubmissionsByIp } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export const runtime = "nodejs";

const MAX_SUBMISSIONS_PER_WINDOW = 3;
const WINDOW_MINUTES = 10;

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip) {
  const salt = process.env.APP_SECRET || "fallback-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный формат запроса" },
      { status: 400 }
    );
  }

  // Honeypot-поле: если оно заполнено — это скорее всего бот.
  if (payload.website) {
    return NextResponse.json({ ok: true }); // тихо "успешно" отвечаем боту
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  // --- простая защита от спама ---
  try {
    const recentCount = await countRecentSubmissionsByIp(ipHash, WINDOW_MINUTES);
    if (recentCount >= MAX_SUBMISSIONS_PER_WINDOW) {
      return NextResponse.json(
        {
          ok: false,
          message: "Слишком много попыток. Попробуйте позже.",
        },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("[submit] rate-limit check failed:", err);
    // не блокируем пользователя из-за проблем с БД на этом этапе
  }

  // --- серверная валидация (никогда не доверяем данным с клиента) ---
  const { isValid, errors, data } = validateSubmission(payload);
  if (!isValid) {
    return NextResponse.json(
      { ok: false, message: "Проверьте правильность заполнения формы", errors },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await insertSubmission({
      id,
      created_at: createdAt,
      name: data.name,
      phone: data.phone,
      contact_method: data.contactMethod,
      contact_value: data.contactValue,
      occupation: data.occupation,
      occupation_other: data.occupationOther,
      interest: data.interest.join(","),
      interest_other: data.interestOther,
      experience: data.experience,
      time_commitment: data.timeCommitment,
      expectations: data.expectations,
      goal: data.goal,
      utm_source: data.utm.utm_source,
      utm_medium: data.utm.utm_medium,
      utm_campaign: data.utm.utm_campaign,
      utm_content: data.utm.utm_content,
      utm_term: data.utm.utm_term,
      ip_hash: ipHash,
    });
  } catch (err) {
    console.error("[submit] DB insert failed:", err);
    return NextResponse.json(
      { ok: false, message: "Не удалось сохранить анкету. Попробуйте ещё раз." },
      { status: 500 }
    );
  }

  // Уведомление в Telegram — не должно "ронять" ответ пользователю,
  // если Telegram недоступен, анкета всё равно уже сохранена.
  try {
    await sendTelegramNotification({
      name: data.name,
      phone: data.phone,
      contactMethod: data.contactMethod,
      contactValue: data.contactValue,
      occupation: data.occupation,
      occupationOther: data.occupationOther,
      interest: data.interest,
      interestOther: data.interestOther,
      experience: data.experience,
      timeCommitment: data.timeCommitment,
      expectations: data.expectations,
      goal: data.goal,
      utm: data.utm,
    });
  } catch (err) {
    console.error("[submit] Telegram notification failed:", err);
  }

  return NextResponse.json({ ok: true, id });
}
