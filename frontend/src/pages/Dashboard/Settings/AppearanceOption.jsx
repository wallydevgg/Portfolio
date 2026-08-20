import { Check } from "lucide-react";

/**
 * Una opción excluyente de las pantallas de Tema e Idioma.
 *
 * El radio nativo va dentro del <label> y solo se oculta visualmente: así el
 * grupo sigue siendo navegable con flechas, anunciable por un lector de
 * pantalla y agrupable por `name`, sin tener que reimplementar nada de eso.
 */
export default function AppearanceOption({
  name,
  value,
  checked,
  onChange,
  icon: Icon,
  label,
  hint,
}) {
  return (
    <label
      className={`appearance-option${checked ? " appearance-option--active" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="appearance-option__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="appearance-option__body">
        <span className="appearance-option__label">{label}</span>
        {hint && <span className="appearance-option__hint">{hint}</span>}
      </span>
      {checked && (
        <Check className="appearance-option__check" size={18} aria-hidden="true" />
      )}
    </label>
  );
}
