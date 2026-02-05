import { SimulationParams, DataPoint, Language } from '../types';

export const calculateCompoundInterest = (params: SimulationParams, lang: Language = 'zh'): DataPoint[] => {
  const { principal, monthlyContribution, interestRate, duration, durationUnit } = params;
  const data: DataPoint[] = [];
  
  let currentBalance = principal;
  let totalPrincipal = principal;
  let totalInterest = 0;

  // Helpers for labels
  const startLabel = lang === 'zh' ? '开始' : 'Start';
  const yearPrefix = lang === 'zh' ? '第 ' : 'Year ';
  const yearSuffix = lang === 'zh' ? ' 年' : '';
  const monthPrefix = lang === 'zh' ? '第 ' : 'Month ';
  const monthSuffix = lang === 'zh' ? ' 月' : '';

  // Initial Point (Time 0)
  data.push({
    timeIndex: 0,
    label: durationUnit === 'years' ? startLabel : 'M0',
    totalPrincipal,
    totalInterest,
    balance: currentBalance
  });

  if (durationUnit === 'years') {
    // Calculate yearly data points
    for (let y = 1; y <= duration; y++) {
      // Simulate 12 months for this year
      for (let m = 0; m < 12; m++) {
        currentBalance += monthlyContribution;
        totalPrincipal += monthlyContribution;
        const monthlyInterest = currentBalance * (interestRate / 100 / 12);
        currentBalance += monthlyInterest;
        totalInterest += monthlyInterest;
      }

      data.push({
        timeIndex: y,
        label: `${yearPrefix}${y}${yearSuffix}`,
        totalPrincipal: Math.round(totalPrincipal),
        totalInterest: Math.round(totalInterest),
        balance: Math.round(currentBalance)
      });
    }
  } else {
    // Calculate monthly data points
    for (let m = 1; m <= duration; m++) {
      currentBalance += monthlyContribution;
      totalPrincipal += monthlyContribution;
      const monthlyInterest = currentBalance * (interestRate / 100 / 12);
      currentBalance += monthlyInterest;
      totalInterest += monthlyInterest;

      data.push({
        timeIndex: m,
        label: `${monthPrefix}${m}${monthSuffix}`,
        totalPrincipal: Math.round(totalPrincipal),
        totalInterest: Math.round(totalInterest),
        balance: Math.round(currentBalance)
      });
    }
  }

  return data;
};
