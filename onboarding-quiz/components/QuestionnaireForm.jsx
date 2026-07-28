"use client";

import { useMemo, useState } from "react";
import steps from "@/config/questions.config";
import siteConfig from "@/config/site.config";
import ProgressTrail from "@/components/ui/ProgressTrail";
import SelectableCard from "@/components/ui/SelectableCard";
import PhoneInput from "@/components/ui/PhoneInput";

const SCREEN = {
  INTRO: "intro",
  QUESTION: "question",
  SUBMITTING: "submitting",
  DONE: "done",
  FAILED: "failed",
};

export default function QuestionnaireForm({ utm }) {
  const [screen, setScreen] = useState(SCREEN.INTRO);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fieldError, setFieldError] = useState(null);
  const [direction, setDirection] = useState("forward");
  const [animKey, setAnimKey] = useState(0);
  const [submitError, setSubmitError] = useState(null);

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;

  const isStepValid = useMemo(
    () => validateStep(currentStep, answers),
    [currentStep, answers]
  );

  function updateAnswer(id, value) {
    setFieldError(null);
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function goNext() {
    if (currentStep.required && !isStepValid) {
      setFieldError(getRequiredMessage(currentStep));
      return;
    }
    setFieldError(null);
    setDirection("forward");
    setAnimKey((k) => k + 1);

    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      submitForm();
    }
  }

  function goBack() {
    setFieldError(null);
    setDirection("back");
    setAnimKey((k) => k + 1);
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      setScreen(SCREEN.INTRO);
    }
  }

  function skipStep() {
    setFieldError(null);
    setDirection("forward");
    setAnimKey((k) => k + 1);
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      submitForm();
    }
  }

  async function submitForm() {
    setScreen(SCREEN.SUBMITTING);
    setSubmitError(null);

    const payload = {
      name: answers.name,
      phone: answers.phone,
      contactMethod: answers.contactMethod || null,
      contactValue: answers.contactValue || null,
      occupation: answers.occupation,
      occupationOther: answers.occupationOther || null,
      interest: answers.interest || [],
      interestOther: answers.interestOther || null,
      experience: answers.experience,
      timeCommitment: answers.time_commitment,
      expectations: answers.expectations,
      goal: answers.goal,
      utm,
      website: "", // honeypot
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSubmitError(data.message || "Не удалось отправить анкету. Попробуйте ещё раз.");
        setScreen(SCREEN.FAILED);
        return;
      }

      setScreen(SCREEN.DONE);
    } catch (err) {
      setSubmitError("Проблема с соединением. Проверьте интернет и попробуйте снова.");
      setScreen(SCREEN.FAILED);
    }
  }

  return (
    <main className="shell">
      <div className="shell__card">
        {screen === SCREEN.INTRO && (
          <IntroScreen onStart={() => setScreen(SCREEN.QUESTION)} />
        )}

        {screen === SCREEN.QUESTION && (
          <QuestionScreen
            key={animKey}
            step={currentStep}
            stepNumber={stepIndex + 1}
            totalSteps={totalSteps}
            answers={answers}
            updateAnswer={updateAnswer}
            fieldError={fieldError}
            direction={direction}
            onNext={goNext}
            onBack={goBack}
            onSkip={!currentStep.required ? skipStep : null}
          />
        )}

        {screen === SCREEN.SUBMITTING && <SubmittingScreen />}

        {screen === SCREEN.DONE && <FinalScreen />}

        {screen === SCREEN.FAILED && (
          <FailedScreen
            message={submitError}
            onRetry={() => setScreen(SCREEN.QUESTION)}
          />
        )}
      </div>

      <style jsx>{`
        .shell {
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }
        .shell__card {
          width: 100%;
          max-width: var(--container-width);
        }
      `}</style>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

function validateStep(step, answers) {
  if (!step.required) return true;

  switch (step.type) {
    case "text":
      return Boolean(String(answers[step.id] || "").trim());
    case "phone":
      return Boolean(String(answers.phone || "").trim().length > 6);
    case "single": {
      const val = answers[step.id];
      if (!val) return false;
      if (val === "other" && step.allowOther) {
        return Boolean(String(answers[`${step.id}Other`] || "").trim());
      }
      return true;
    }
    case "multi": {
      const val = answers[step.id] || [];
      if (val.length === 0) return false;
      if (val.includes("other") && step.allowOther) {
        return Boolean(String(answers[`${step.id}Other`] || "").trim());
      }
      return true;
    }
    case "textarea":
      return Boolean(String(answers[step.id] || "").trim());
    default:
      return true;
  }
}

function getRequiredMessage(step) {
  if (step.type === "phone") return "Введите номер телефона";
  if (step.type === "single" || step.type === "multi") return "Выберите вариант ответа";
  return "Заполните это поле, чтобы продолжить";
}

/* ------------------------------------------------------------------ */
/* Intro screen                                                        */
/* ------------------------------------------------------------------ */

function IntroScreen({ onStart }) {
  const { intro } = siteConfig;
  return (
    <div className="intro fade-in">
      <div className="intro__eyebrow">{intro.eyebrow}</div>
      <h1 className="intro__heading">{intro.heading}</h1>
      <p className="intro__body">{intro.body}</p>

      <div className="intro__meta">
        <span className="intro__meta-item">⏱ {intro.durationNote}</span>
        <span className="intro__meta-item">{intro.giftNote}</span>
      </div>

      <button type="button" className="btn btn--primary btn--full" onClick={onStart}>
        {intro.ctaButton}
      </button>

      <style jsx>{`
        .intro {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 44px 36px;
        }
        .intro__eyebrow {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 18px;
        }
        .intro__heading {
          font-size: 28px;
          line-height: 1.28;
          margin-bottom: 18px;
        }
        .intro__body {
          font-size: 15.5px;
          line-height: 1.65;
          color: var(--color-text-muted);
          margin-bottom: 26px;
        }
        .intro__meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 18px;
          background: var(--color-surface-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          margin-bottom: 28px;
        }
        .intro__meta-item {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }
        @media (max-width: 480px) {
          .intro {
            padding: 32px 22px;
            border-radius: var(--radius-md);
          }
          .intro__heading {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Question screen                                                     */
/* ------------------------------------------------------------------ */

function QuestionScreen({
  step,
  stepNumber,
  totalSteps,
  answers,
  updateAnswer,
  fieldError,
  direction,
  onNext,
  onBack,
  onSkip,
}) {
  return (
    <div className={"question fade-in " + (direction === "forward" ? "slide-forward" : "slide-back")}>
      <div className="question__top">
        <button type="button" className="question__back" onClick={onBack} aria-label="Назад">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 7H17M1 7L7 1M1 7L7 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ProgressTrail current={stepNumber} total={totalSteps} />
      </div>

      <div className="question__body">
        <h2 className="question__title">{step.title}</h2>
        {step.subtitle && <p className="question__subtitle">{step.subtitle}</p>}

        <div className="question__field">
          <StepField step={step} answers={answers} updateAnswer={updateAnswer} onEnter={onNext} />
        </div>

        {fieldError && <p className="question__error">{fieldError}</p>}
      </div>

      <div className="question__actions">
        {onSkip && (
          <button type="button" className="btn btn--ghost" onClick={onSkip}>
            Пропустить
          </button>
        )}
        <button type="button" className="btn btn--primary btn--full" onClick={onNext}>
          Далее
        </button>
      </div>

      <style jsx>{`
        .question {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 32px 32px 28px;
        }
        .question__top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
        }
        .question__back {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1.5px solid var(--color-border);
          background: transparent;
          color: var(--color-text-muted);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .question__back:hover {
          background: var(--color-surface-soft);
          color: var(--color-text);
        }
        .question__title {
          font-size: 23px;
          line-height: 1.32;
          margin-bottom: 8px;
        }
        .question__subtitle {
          font-size: 14.5px;
          color: var(--color-text-muted);
          margin-bottom: 22px;
        }
        .question__field {
          margin-top: 22px;
          margin-bottom: 6px;
        }
        .question__error {
          margin-top: 12px;
          font-size: 13.5px;
          color: var(--color-error);
          font-weight: 600;
        }
        .question__actions {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 28px;
        }
        @media (max-width: 480px) {
          .question {
            padding: 24px 20px 22px;
            border-radius: var(--radius-md);
          }
          .question__title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function StepField({ step, answers, updateAnswer, onEnter }) {
  switch (step.type) {
    case "text":
      return (
        <input
          type="text"
          className="text-field"
          placeholder={step.placeholder}
          value={answers[step.id] || ""}
          onChange={(e) => updateAnswer(step.id, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
          autoFocus
          maxLength={100}
        />
      );

    case "phone":
      return (
        <PhoneInput
          value={answers.phone}
          onChange={(val) => updateAnswer("phone", val)}
        />
      );

    case "contact":
      return (
        <div className="contact-field">
          <div className="contact-field__options">
            {step.options.map((opt) => (
              <SelectableCard
                key={opt.value}
                label={opt.label}
                selected={answers.contactMethod === opt.value}
                onClick={() => updateAnswer("contactMethod", opt.value)}
              />
            ))}
          </div>
          {answers.contactMethod && (
            <input
              type="text"
              className="text-field contact-field__value"
              placeholder={
                answers.contactMethod === "telegram"
                  ? "Ваш Telegram, например @username"
                  : answers.contactMethod === "whatsapp"
                  ? "Номер WhatsApp"
                  : "Как с вами связаться"
              }
              value={answers.contactValue || ""}
              onChange={(e) => updateAnswer("contactValue", e.target.value)}
            />
          )}
          <style jsx>{`
            .contact-field__options {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .contact-field__value {
              margin-top: 14px;
            }
          `}</style>
        </div>
      );

    case "single":
      return (
        <div className="choice-field">
          <div className="choice-field__options">
            {step.options.map((opt) => (
              <SelectableCard
                key={opt.value}
                label={opt.label}
                selected={answers[step.id] === opt.value}
                onClick={() => updateAnswer(step.id, opt.value)}
              />
            ))}
            {step.allowOther && (
              <SelectableCard
                label="Другое"
                selected={answers[step.id] === "other"}
                onClick={() => updateAnswer(step.id, "other")}
              />
            )}
          </div>
          {step.allowOther && answers[step.id] === "other" && (
            <input
              type="text"
              className="text-field choice-field__other"
              placeholder={step.otherPlaceholder}
              value={answers[`${step.id}Other`] || ""}
              onChange={(e) => updateAnswer(`${step.id}Other`, e.target.value)}
              autoFocus
            />
          )}
          <style jsx>{`
            .choice-field__options {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .choice-field__other {
              margin-top: 14px;
            }
          `}</style>
        </div>
      );

    case "multi": {
      const selected = answers[step.id] || [];
      function toggle(value) {
        const next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
        updateAnswer(step.id, next);
      }
      return (
        <div className="choice-field">
          <div className="choice-field__options">
            {step.options.map((opt) => (
              <SelectableCard
                key={opt.value}
                label={opt.label}
                selected={selected.includes(opt.value)}
                onClick={() => toggle(opt.value)}
                multi
              />
            ))}
            {step.allowOther && (
              <SelectableCard
                label="Другое"
                selected={selected.includes("other")}
                onClick={() => toggle("other")}
                multi
              />
            )}
          </div>
          {step.allowOther && selected.includes("other") && (
            <input
              type="text"
              className="text-field choice-field__other"
              placeholder={step.otherPlaceholder}
              value={answers[`${step.id}Other`] || ""}
              onChange={(e) => updateAnswer(`${step.id}Other`, e.target.value)}
              autoFocus
            />
          )}
          <style jsx>{`
            .choice-field__options {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .choice-field__other {
              margin-top: 14px;
            }
          `}</style>
        </div>
      );
    }

    case "textarea":
      return (
        <div className="textarea-field">
          <textarea
            className="text-field text-field--area"
            placeholder={step.placeholder}
            value={answers[step.id] || ""}
            onChange={(e) => updateAnswer(step.id, e.target.value)}
            rows={5}
            maxLength={2000}
            autoFocus
          />
          {step.hint && <p className="textarea-field__hint">{step.hint}</p>}
          <style jsx>{`
            .textarea-field__hint {
              margin-top: 10px;
              font-size: 13px;
              color: var(--color-text-muted);
              line-height: 1.5;
            }
          `}</style>
        </div>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Submitting / Final / Failed screens                                 */
/* ------------------------------------------------------------------ */

function SubmittingScreen() {
  return (
    <div className="status-card fade-in">
      <div className="spinner" />
      <p className="status-card__text">Отправляем вашу анкету…</p>
      <style jsx>{`
        .status-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 60px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .spinner {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-accent);
          animation: spin 0.8s linear infinite;
        }
        .status-card__text {
          font-size: 14.5px;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function FinalScreen() {
  const { final, gift, telegramChannelUrl } = siteConfig;
  return (
    <div className="final fade-in">
      <div className="final__badge">✓</div>
      <h1 className="final__heading">{final.heading}</h1>
      <p className="final__subheading">{final.subheading}</p>
      <p className="final__body">{final.body}</p>

      <div className="final__gift">
        <p className="final__gift-title">{final.giftBlockTitle}</p>
        <p className="final__gift-name">{gift.title}</p>
        <a href={gift.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--full">
          {final.giftButton}
        </a>
      </div>

      <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--full">
        {final.channelButton}
      </a>

      <style jsx>{`
        .final {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 44px 36px;
          text-align: center;
        }
        .final__badge {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--color-accent-soft);
          color: var(--color-accent-strong);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          margin: 0 auto 20px;
        }
        .final__heading {
          font-size: 25px;
          margin-bottom: 8px;
        }
        .final__subheading {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .final__body {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--color-text-muted);
          margin-bottom: 28px;
        }
        .final__gift {
          background: var(--color-surface-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 22px;
          margin-bottom: 14px;
        }
        .final__gift-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .final__gift-name {
          font-size: 13.5px;
          color: var(--color-text-muted);
          margin-bottom: 16px;
          line-height: 1.4;
        }
        @media (max-width: 480px) {
          .final {
            padding: 32px 22px;
            border-radius: var(--radius-md);
          }
        }
      `}</style>
    </div>
  );
}

function FailedScreen({ message, onRetry }) {
  return (
    <div className="status-card fade-in">
      <div className="status-card__icon">!</div>
      <p className="status-card__title">Что-то пошло не так</p>
      <p className="status-card__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Попробовать снова
      </button>
      <style jsx>{`
        .status-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 48px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .status-card__icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f4ddd6;
          color: var(--color-error);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .status-card__title {
          font-weight: 700;
          font-size: 16px;
        }
        .status-card__text {
          font-size: 14px;
          color: var(--color-text-muted);
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
