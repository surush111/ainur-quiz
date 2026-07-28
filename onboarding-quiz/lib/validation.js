import { parsePhoneNumberFromString } from "libphonenumber-js";

const MAX_LENGTHS = {
  name: 100,
  contactValue: 100,
  occupationOther: 300,
  interestOther: 300,
  expectations: 2000,
  goal: 2000,
};

export function validateSubmission(payload) {
  const errors = {};
  const clean = {};

  // --- name ---
  const name = String(payload.name || "").trim();
  if (!name) errors.name = "Укажите имя";
  else if (name.length > MAX_LENGTHS.name) errors.name = "Слишком длинное имя";
  clean.name = name.slice(0, MAX_LENGTHS.name);

  // --- phone ---
  const rawPhone = String(payload.phone || "").trim();
  const phoneNumber = parsePhoneNumberFromString(rawPhone);
  if (!rawPhone || !phoneNumber || !phoneNumber.isValid()) {
    errors.phone = "Введите корректный номер телефона";
    clean.phone = rawPhone;
  } else {
    clean.phone = phoneNumber.number; // международный формат E.164
  }

  // --- contact (optional) ---
  const contactMethod = payload.contactMethod
    ? String(payload.contactMethod).trim()
    : null;
  if (contactMethod && !["telegram", "whatsapp", "other"].includes(contactMethod)) {
    errors.contactMethod = "Некорректный способ связи";
  }
  clean.contactMethod = contactMethod;
  clean.contactValue = payload.contactValue
    ? String(payload.contactValue).trim().slice(0, MAX_LENGTHS.contactValue)
    : null;

  // --- occupation ---
  const validOccupations = [
    "employed",
    "business",
    "blog",
    "freelance",
    "study",
    "none",
    "other",
  ];
  const occupation = String(payload.occupation || "").trim();
  if (!occupation || !validOccupations.includes(occupation)) {
    errors.occupation = "Выберите один из вариантов";
  }
  clean.occupation = occupation;
  clean.occupationOther = payload.occupationOther
    ? String(payload.occupationOther).trim().slice(0, MAX_LENGTHS.occupationOther)
    : null;
  if (occupation === "other" && !clean.occupationOther) {
    errors.occupationOther = "Расскажите немного подробнее";
  }

  // --- interest (multi) ---
  const validInterests = [
    "avito",
    "tg_ads",
    "editing",
    "design",
    "p2p",
    "ai",
    "vibe_coding",
    "other",
  ];
  const interest = Array.isArray(payload.interest) ? payload.interest : [];
  const filteredInterest = interest.filter((v) => validInterests.includes(v));
  if (filteredInterest.length === 0) {
    errors.interest = "Выберите хотя бы один вариант";
  }
  clean.interest = filteredInterest;
  clean.interestOther = payload.interestOther
    ? String(payload.interestOther).trim().slice(0, MAX_LENGTHS.interestOther)
    : null;
  if (filteredInterest.includes("other") && !clean.interestOther) {
    errors.interestOther = "Напишите свой вариант";
  }

  // --- experience ---
  const validExperience = ["none", "some", "stable"];
  clean.experience = String(payload.experience || "").trim();
  if (!validExperience.includes(clean.experience)) {
    errors.experience = "Выберите один из вариантов";
  }

  // --- time commitment ---
  const validTime = ["lt1h", "1to3h", "gt3h", "flexible"];
  clean.timeCommitment = String(payload.timeCommitment || "").trim();
  if (!validTime.includes(clean.timeCommitment)) {
    errors.timeCommitment = "Выберите один из вариантов";
  }

  // --- expectations / goal ---
  const expectations = String(payload.expectations || "").trim();
  if (!expectations) errors.expectations = "Пожалуйста, заполните это поле";
  clean.expectations = expectations.slice(0, MAX_LENGTHS.expectations);

  const goal = String(payload.goal || "").trim();
  if (!goal) errors.goal = "Пожалуйста, заполните это поле";
  clean.goal = goal.slice(0, MAX_LENGTHS.goal);

  // --- utm (optional, all strings) ---
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  clean.utm = {};
  for (const key of utmKeys) {
    clean.utm[key] = payload.utm?.[key]
      ? String(payload.utm[key]).trim().slice(0, 200)
      : null;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: clean,
  };
}
