import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
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
      <Form.Label htmlFor="power_max" bsPrefix="catalog-filter-label">
        Мощность до: <output id="power_val">{currentValue.toFixed(1)}</output> Вт
      </Form.Label>
      <Form onSubmit={handleSubmit} className="catalog-filter-row">
        <div className="catalog-filter-range-wrap">
          <Form.Control
            type="range"
            bsPrefix="catalog-range-slider"
            id="power_max"
            name="power_max"
            min={0}
            max={maxPower}
            step={0.1}
            value={currentValue}
            style={{ '--progress': `${progressPct}%` } as React.CSSProperties}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
        <Button type="submit" bsPrefix="catalog-search-button">
          Найти
        </Button>
      </Form>
    </div>
  );
};
