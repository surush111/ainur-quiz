"use client";

import { useEffect, useRef, useState } from "react";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import { allCountries, priorityCountries, otherCountries } from "@/lib/countries";

export default function PhoneInput({ value, onChange, error }) {
  const [countryIso, setCountryIso] = useState("RU");
  const [nationalInput, setNationalInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const country = allCountries.find((c) => c.iso === countryIso) || priorityCountries[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function emitChange(nextNational, nextIso) {
    const c = allCountries.find((x) => x.iso === nextIso);
    const formatter = new AsYouType(nextIso);
    const formatted = formatter.input(nextNational);
    setNationalInput(formatted);

    const full = `+${c.dial}${nextNational.replace(/\D/g, "")}`;
    onChange(full);
  }

  function handleNationalChange(e) {
    const raw = e.target.value;
    emitChange(raw, countryIso);
  }

  function handleCountrySelect(iso) {
    setCountryIso(iso);
    setIsOpen(false);
    setSearch("");
    emitChange(nationalInput, iso);
  }

  const filteredOther = otherCountries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPriority = priorityCountries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const isValidNumber = value ? parsePhoneNumberFromString(value)?.isValid() : null;

  return (
    <div className="phone-input" ref={wrapperRef}>
      <div className={"phone-input__row" + (error ? " phone-input__row--error" : "")}>
        <button
          type="button"
          className="phone-input__country-btn"
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="phone-input__flag">{country.flag}</span>
          <span className="phone-input__dial">+{country.dial}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2 }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <input
          type="tel"
          inputMode="tel"
          className="phone-input__field"
          placeholder="Номер телефона"
          value={nationalInput}
          onChange={handleNationalChange}
          autoComplete="tel"
        />

        {value && isValidNumber && (
          <span className="phone-input__check" aria-hidden="true">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M1 5.5L5 9.5L13 1.5" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {isOpen && (
        <div className="phone-input__dropdown" role="listbox">
          <input
            type="text"
            className="phone-input__search"
            placeholder="Поиск страны…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="phone-input__list">
            {filteredPriority.length > 0 && (
              <>
                {filteredPriority.map((c) => (
                  <CountryRow key={c.iso} country={c} onSelect={handleCountrySelect} />
                ))}
                <div className="phone-input__divider" />
              </>
            )}
            {filteredOther.map((c) => (
              <CountryRow key={c.iso} country={c} onSelect={handleCountrySelect} />
            ))}
            {filteredPriority.length === 0 && filteredOther.length === 0 && (
              <div className="phone-input__empty">Страна не найдена</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .phone-input {
          position: relative;
        }
        .phone-input__row {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 4px 4px 4px 6px;
          transition: border-color 0.18s ease;
        }
        .phone-input__row:focus-within {
          border-color: var(--color-accent);
        }
        .phone-input__row--error {
          border-color: var(--color-error);
        }
        .phone-input__country-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 10px 8px;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
        }
        .phone-input__country-btn:hover {
          background: var(--color-surface-soft);
        }
        .phone-input__flag {
          font-size: 18px;
          line-height: 1;
        }
        .phone-input__field {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 16px;
          padding: 10px 8px;
          min-width: 0;
          color: var(--color-text);
        }
        .phone-input__field::placeholder {
          color: var(--color-text-muted);
        }
        .phone-input__check {
          padding-right: 12px;
          display: flex;
        }
        .phone-input__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card-hover);
          z-index: 20;
          overflow: hidden;
        }
        .phone-input__search {
          width: 100%;
          border: none;
          border-bottom: 1px solid var(--color-border);
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          background: var(--color-surface-soft);
        }
        .phone-input__list {
          max-height: 240px;
          overflow-y: auto;
          padding: 6px;
        }
        .phone-input__divider {
          height: 1px;
          background: var(--color-border);
          margin: 6px 4px;
        }
        .phone-input__empty {
          padding: 16px;
          font-size: 14px;
          color: var(--color-text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}

function CountryRow({ country, onSelect }) {
  return (
    <button
      type="button"
      className="country-row"
      onClick={() => onSelect(country.iso)}
      role="option"
    >
      <span className="country-row__flag">{country.flag}</span>
      <span className="country-row__name">{country.name}</span>
      <span className="country-row__dial">+{country.dial}</span>
      <style jsx>{`
        .country-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 10px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          text-align: left;
          font-size: 14.5px;
          color: var(--color-text);
        }
        .country-row:hover {
          background: var(--color-surface-soft);
        }
        .country-row__flag {
          font-size: 17px;
        }
        .country-row__name {
          flex: 1;
        }
        .country-row__dial {
          color: var(--color-text-muted);
          font-weight: 500;
        }
      `}</style>
    </button>
  );
}
