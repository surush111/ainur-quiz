/**
 * СТРУКТУРА АНКЕТЫ
 * ------------------------------------------------------------
 * Каждый объект в массиве steps — это один шаг анкеты.
 * Чтобы добавить/убрать/изменить вопрос — редактируйте этот файл,
 * логика формы (app/components/QuestionnaireForm.jsx) не привязана
 * к конкретным вопросам.
 *
 * type:
 *  - "text"       — короткий текстовый инпут
 *  - "phone"      — телефонный инпут с выбором страны
 *  - "contact"    — способ связи (telegram/whatsapp/другое) + необязательное поле
 *  - "single"     — выбор одного варианта из карточек (+ "другое" опционально)
 *  - "multi"      — выбор нескольких вариантов из карточек (+ "другое" опционально)
 *  - "textarea"   — большое текстовое поле
 */

export const steps = [
  {
    id: "name",
    type: "text",
    title: "Как вас зовут?",
    subtitle: "Будем знакомы 👋",
    placeholder: "Ваше имя",
    required: true,
  },
  {
    id: "phone",
    type: "phone",
    title: "Оставьте номер телефона",
    subtitle: "Он нужен, чтобы мы могли связаться с вами после заполнения анкеты.",
    required: true,
  },
  {
    id: "contact",
    type: "contact",
    title: "Как с вами удобнее связаться?",
    subtitle: "Этот шаг можно пропустить",
    required: false,
    options: [
      { value: "telegram", label: "Telegram" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "other", label: "Другой способ" },
    ],
  },
  {
    id: "occupation",
    type: "single",
    title: "Чем вы сейчас занимаетесь?",
    required: true,
    allowOther: true,
    otherPlaceholder: "Расскажите немного подробнее",
    options: [
      { value: "employed", label: "Работаю в найме" },
      { value: "business", label: "Веду свой бизнес" },
      { value: "blog", label: "Развиваю свой блог" },
      { value: "freelance", label: "Фриланс" },
      { value: "study", label: "Учусь" },
      { value: "none", label: "Сейчас не работаю" },
    ],
  },
  {
    id: "interest",
    type: "multi",
    title: "Какой вид онлайн-заработка вас интересует?",
    subtitle: "Можно выбрать несколько вариантов",
    required: true,
    allowOther: true,
    otherPlaceholder: "Напишите свой вариант",
    options: [
      { value: "avito", label: "Авито" },
      { value: "tg_ads", label: "Telegram ADS" },
      { value: "editing", label: "Монтаж" },
      { value: "design", label: "Дизайн" },
      { value: "p2p", label: "P2P" },
      { value: "ai", label: "ИИ" },
      { value: "vibe_coding", label: "Vibe coding" },
    ],
  },
  {
    id: "experience",
    type: "single",
    title: "Был ли у вас опыт заработка онлайн?",
    required: true,
    allowOther: false,
    options: [
      { value: "none", label: "Нет, только начинаю" },
      { value: "some", label: "Было немного опыта" },
      { value: "stable", label: "Да, есть стабильный доход" },
    ],
  },
  {
    id: "time_commitment",
    type: "single",
    title: "Сколько времени готовы уделять обучению?",
    subtitle: "Это поможет предложить подходящий формат",
    required: true,
    allowOther: false,
    options: [
      { value: "lt1h", label: "До 1 часа в день" },
      { value: "1to3h", label: "1–3 часа в день" },
      { value: "gt3h", label: "Более 3 часов в день" },
      { value: "flexible", label: "По-разному, но готов гибко" },
    ],
  },
  {
    id: "expectations",
    type: "textarea",
    title: "Чего вы ждёте от курса?",
    placeholder: "Расскажите, что именно вы хотите получить от обучения…",
    hint:
      "Например: хочу освоить новое направление, найти дополнительный источник дохода, выйти на первые деньги онлайн, сменить работу и т.д.",
    required: true,
  },
  {
    id: "goal",
    type: "textarea",
    title: "Какого результата вы хотите достичь?",
    subtitle: "Представьте, что обучение уже прошло успешно. Что изменилось в вашей жизни?",
    placeholder: "Напишите, к какому результату вы хотите прийти…",
    required: true,
  },
];

export default steps;
