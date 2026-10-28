import React from 'react';
import './PowerFilter.css';

interface PowerFilterProps {
  maxPower: number;
  currentValue: number;
  onChange: (val: number) => void;
  onSearch: () => void;
}

export const PowerFilter: React.FC<PowerFilterProps> = ({
  maxPower,
  currentValue,
  onChange,
  onSearch,
}) => {
  const progressPct = maxPower > 0 ? (currentValue / maxPower) * 100 : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="catalog-filter-controls">
      <label htmlFor="power_max" className="catalog-filter-label">
        Мощность до: <output id="power_val">{currentValue.toFixed(1)}</output> Вт
      </label>
      <form onSubmit={handleSubmit} className="catalog-filter-row">
        <div className="catalog-filter-range-wrap">
          <input
            type="range"
            id="power_max"
            name="power_max"
            min={0}
            max={maxPower}
            step={0.1}
            value={currentValue}
            style={{ '--progress': `${progressPct}%` } as React.CSSProperties}
            className="catalog-range-slider"
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
        <button type="submit" className="catalog-search-button">
          Найти
        </button>
      </form>
    </div>
  );
};
