import React from 'react';
import { SimulationParams, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ControlsProps {
  params: SimulationParams;
  setParams: (p: SimulationParams) => void;
  lockedParams: (keyof SimulationParams)[];
  lang: Language;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  colorClass: string;
  headerAction?: React.ReactNode;
}> = ({ label, value, suffix = '', min, max, step = 1, onChange, colorClass, headerAction }) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-end mb-2">
      <div className="flex items-center gap-2">
        <label className="font-serif font-bold text-lg text-[#586E75]">{label}</label>
        {headerAction}
      </div>
      <span className="font-mono text-xl font-bold text-[#073642]">
        {value.toLocaleString()}{suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`
        w-full h-3 bg-[#E0E0E0] rounded-full appearance-none cursor-pointer 
        focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#586E75]
        slider-thumb-${colorClass}
      `}
      style={{
        backgroundImage: `linear-gradient(to right, currentColor 0%, currentColor ${(value - min)/(max - min)*100}%, #E0E0E0 ${(value - min)/(max - min)*100}%, #E0E0E0 100%)`
      }}
    />
  </div>
);

const Controls: React.FC<ControlsProps> = ({ params, setParams, lockedParams, lang }) => {
  
  const isVisible = (key: keyof SimulationParams) => !lockedParams.includes(key);
  const t = TRANSLATIONS[lang].controls;

  const toggleDurationUnit = () => {
    if (params.durationUnit === 'years') {
      setParams({ ...params, durationUnit: 'months', duration: params.duration * 12 });
    } else {
       // Convert months back to years roughly for UX, or just reset to reasonable default
       setParams({ ...params, durationUnit: 'years', duration: Math.ceil(params.duration / 12) });
    }
  };

  return (
    <div className="w-full">
      {isVisible('principal') && (
        <SliderControl
          label={t.principal}
          value={params.principal}
          suffix=""
          min={0}
          max={50000}
          step={1000}
          onChange={(v) => setParams({ ...params, principal: v })}
          colorClass="cyan"
        />
      )}

      {isVisible('monthlyContribution') && (
        <SliderControl
          label={t.monthlyContribution}
          value={params.monthlyContribution}
          suffix=""
          min={0}
          max={5000}
          step={100}
          onChange={(v) => setParams({ ...params, monthlyContribution: v })}
          colorClass="cyan"
        />
      )}
      
      {isVisible('monthlyExpenses') && (
        <SliderControl
          label={t.monthlyExpenses}
          value={params.monthlyExpenses}
          suffix=""
          min={1000}
          max={10000}
          step={100}
          onChange={(v) => setParams({ ...params, monthlyExpenses: v })}
          colorClass="gold"
        />
      )}

      {isVisible('interestRate') && (
        <SliderControl
          label={t.interestRate}
          value={params.interestRate}
          suffix="%"
          min={0}
          max={15}
          step={0.1}
          onChange={(v) => setParams({ ...params, interestRate: v })}
          colorClass="magenta"
        />
      )}

      {isVisible('duration') && (
        <SliderControl
          label={t.duration}
          value={params.duration}
          suffix={params.durationUnit === 'years' ? t.yearsSuffix : t.monthsSuffix}
          min={1}
          max={params.durationUnit === 'years' ? 50 : 600}
          step={1}
          onChange={(v) => setParams({ ...params, duration: v })}
          colorClass="magenta"
          headerAction={
            <button 
              onClick={toggleDurationUnit}
              className="px-2 py-0.5 text-xs bg-[#EEE8D5] text-[#586E75] rounded hover:bg-[#93A1A1] hover:text-white transition-colors uppercase font-bold tracking-wider"
            >
              {params.durationUnit === 'years' ? t.switchToMonths : t.switchToYears}
            </button>
          }
        />
      )}
      
      {/* Custom Styles for Slider Thumbs to match game colors */}
      <style>{`
        input[type=range] {
          color: #93A1A1; /* Track filled color fallback */
        }
        input[type=range].slider-thumb-cyan::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #2AA198;
          border: 3px solid #FDF6E3;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
        }
        input[type=range].slider-thumb-magenta { color: #D33682; }
        input[type=range].slider-thumb-magenta::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #D33682;
          border: 3px solid #FDF6E3;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          margin-top: -6px;
        }
        input[type=range].slider-thumb-gold { color: #B58900; }
        input[type=range].slider-thumb-gold::-webkit-slider-thumb {
           -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #B58900;
          border: 3px solid #FDF6E3;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          margin-top: -6px;
        }
      `}</style>
    </div>
  );
};

export default Controls;
