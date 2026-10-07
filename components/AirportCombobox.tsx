"use client";

import { useId, useMemo, useState } from "react";
import {
  findAirport,
  flagEmoji,
  IATA_CODE,
  searchAirports,
  type Airport,
} from "@/lib/flights/airports";
import { cn } from "@/lib/utils";

interface Props {
  /** Name of the hidden input that carries the IATA code. */
  name: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  invalid?: boolean;
}

function describe(code: string): string {
  const airport = findAirport(code);
  return airport ? `${airport.city} (${airport.code})` : code;
}

/** Accessible combobox (WAI-ARIA 1.2 pattern) over the bundled airport list. */
const AirportCombobox = ({
  name,
  label,
  icon,
  value,
  onChange,
  placeholder,
  invalid,
}: Props) => {
  const id = useId();
  const listId = `${id}-listbox`;
  const [text, setText] = useState(() => (value ? describe(value) : ""));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Follow external changes such as the swap button.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value ? describe(value) : "");
  }

  const options = useMemo<Airport[]>(() => {
    const matches = searchAirports(text);
    const typed = text.trim().toUpperCase();
    // Any valid IATA code is accepted, even if it isn't in the bundled list.
    if (matches.length === 0 && IATA_CODE.test(typed)) {
      return [{ code: typed, city: typed, name: "Airport code", country: "", countryCode: "" }];
    }
    return matches;
  }, [text]);

  const expanded = open && options.length > 0;

  const select = (airport: Airport) => {
    onChange(airport.code);
    setSyncedValue(airport.code);
    setText(describe(airport.code));
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActive((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        if (expanded && options[active]) {
          event.preventDefault();
          select(options[active]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  // Leaving the field with unconfirmed text picks the best match, so the
  // visible text and the submitted code never disagree.
  const onBlur = () => {
    setOpen(false);
    if (!text.trim()) {
      onChange("");
      return;
    }
    if (value && text === describe(value)) return;
    if (options[0]) select(options[0]);
    else onChange("");
  };

  return (
    <div className="field combobox">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className={cn("field-control", invalid && "field-invalid")}>
        {icon}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
            setActive(0);
            // Editing invalidates the previous pick until a new one is made.
            if (value) {
              setSyncedValue("");
              onChange("");
            }
          }}
          onFocus={(event) => event.target.select()}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      </div>
      <input type="hidden" name={name} value={value} />

      {expanded && (
        <ul id={listId} role="listbox" aria-label={label} className="combobox-list">
          {options.map((airport, index) => (
            <li
              key={airport.code}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              className="combobox-option"
              // Keep focus in the input so blur doesn't fire before the click.
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => select(airport)}
            >
              <span aria-hidden className="text-lg">
                {flagEmoji(airport.countryCode) || "✈️"}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{airport.city}</span>
                <span className="truncate text-xs text-light-200">
                  {airport.name}
                  {airport.country && `, ${airport.country}`}
                </span>
              </span>
              <span className="combobox-code">{airport.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportCombobox;
