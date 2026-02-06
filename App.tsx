import React, { useState, useEffect } from 'react';
import { PhaserGame } from './components/PhaserGame';
import Controls from './components/Controls';
import { SimulationParams, GameStage, DataPoint, ChapterConfig, Language } from './types';
import { calculateCompoundInterest } from './services/math';
import { TRANSLATIONS } from './constants';

// Chapter Factory to generate localized content
const getChapters = (lang: Language): ChapterConfig[] => {
  const isZh = lang === 'zh';
  return [
    {
      id: GameStage.CHAPTER_1,
      title: isZh ? "第一章：存钱罐" : "Chapter 1: The Piggy Bank",
      subtitle: isZh ? "线性增长" : "Linear Growth",
      description: isZh
        ? "想象你把钱藏在床垫下。无论过多久，你存进去多少，它就是多少。这就是线性增长。"
        : "Imagine hiding money under a mattress. No matter how much time passes, it only grows by what you add. This is linear growth.",
      defaultParams: { principal: 10000, monthlyContribution: 1000, monthlyExpenses: 3000, interestRate: 0, duration: 10, durationUnit: 'years' },
      lockedParams: ['interestRate', 'duration', 'monthlyExpenses'],
      nextCondition: (p) => p.monthlyContribution >= 2000,
      nextButtonText: isZh ? "我明白了，但这太慢了..." : "I get it, but it's too slow..."
    },
    {
      id: GameStage.CHAPTER_2,
      title: isZh ? "第二章：神奇的种子" : "Chapter 2: The Magic Seed",
      subtitle: isZh ? "复利的魔法" : "Magic of Compound Interest",
      description: isZh
        ? "现在，我们给你的钱施一点魔法（复利）。哪怕只有一点点利率，粉色的线条（收益）开始出现在绿色的线条（本金）之上。"
        : "Now let's add some magic (Compound Interest). Even with a small rate, the pink line (Interest) starts to appear above the green line (Principal).",
      defaultParams: { principal: 10000, monthlyContribution: 1000, monthlyExpenses: 3000, interestRate: 5, duration: 10, durationUnit: 'years' },
      lockedParams: ['duration', 'monthlyExpenses'],
      nextCondition: (p) => p.interestRate >= 8,
      nextButtonText: isZh ? "但这看起来还不多？" : "But it doesn't look like much?"
    },
    {
      id: GameStage.CHAPTER_3,
      title: isZh ? "第三章：时间的力量" : "Chapter 3: The Forest",
      subtitle: isZh ? "指数爆炸" : "Exponential Growth",
      description: isZh
        ? "复利需要时间的滋养。试着把时间拉长。注意看，到了后期，粉色的收益是如何超越绿色的本金的。这就是指数爆炸。"
        : "Compound interest needs time. Extend the duration. Notice how eventually, the pink interest overtakes the green principal. This is exponential explosion.",
      defaultParams: { principal: 10000, monthlyContribution: 1000, monthlyExpenses: 3000, interestRate: 8, duration: 30, durationUnit: 'years' },
      lockedParams: ['monthlyExpenses'],
      nextCondition: (p) => (p.durationUnit === 'years' && p.duration >= 40) || (p.durationUnit === 'months' && p.duration >= 480),
      nextButtonText: isZh ? "什么是被动收入？" : "What is Passive Income?"
    },
    {
      id: GameStage.CHAPTER_4,
      title: isZh ? "第四章：主动 vs 被动" : "Chapter 4: Active vs Passive",
      subtitle: isZh ? "睡后收入" : "Passive Income",
      description: isZh
        ? "你的工作是主动收入，手停口停。而利息是被动收入，睡觉时也在赚钱。试着调整参数，让你的月被动收入超过1000元。"
        : "Your job is active income. Interest is passive income—earning while you sleep. Try to adjust parameters to get over $1,000 in monthly passive income.",
      defaultParams: { principal: 10000, monthlyContribution: 1000, monthlyExpenses: 3000, interestRate: 5, duration: 20, durationUnit: 'years' },
      lockedParams: ['monthlyExpenses', 'duration'],
      // Condition: Monthly Passive Income > 1000
      nextCondition: (p, data) => {
        if (!data || data.length === 0) return false;
        const finalBalance = data[data.length - 1].balance;
        const monthlyPassive = (finalBalance * (p.interestRate / 100)) / 12;
        return monthlyPassive >= 1000;
      },
      nextButtonText: isZh ? "如果被动收入超过开销..." : "If passive income exceeds expenses..."
    },
    {
      id: GameStage.CHAPTER_5,
      title: isZh ? "第五章：FIRE (财务自由)" : "Chapter 5: FIRE",
      subtitle: isZh ? "财务独立，提前退休" : "Financial Independence, Retire Early",
      description: isZh
        ? "当被动收入 > 生活开销时，你就自由了！这就是FIRE运动的核心。黄色虚线是你的自由目标（年开销 ÷ 年利率）。试着让你的资产曲线通过它。"
        : "When Passive Income > Expenses, you are free! This is the core of FIRE. The dashed yellow line is your target. Make your asset curve cross it.",
      defaultParams: { principal: 10000, monthlyContribution: 3000, monthlyExpenses: 3000, interestRate: 5, duration: 25, durationUnit: 'years' },
      lockedParams: [], // Unlock Expenses
      // Condition: Final Balance >= Annual Expenses / Rate
      nextCondition: (p, data) => {
        if (!data || data.length === 0 || p.interestRate === 0) return false;
        const finalBalance = data[data.length - 1].balance;
        const annualExpenses = p.monthlyExpenses * 12;
        const fireNumber = annualExpenses / (p.interestRate / 100);
        return finalBalance >= fireNumber;
      },
      nextButtonText: isZh ? "进入自由花园" : "Enter Your Garden"
    },
    {
      id: GameStage.SANDBOX,
      title: isZh ? "终章：你的花园" : "Final Chapter: Your Garden",
      subtitle: isZh ? "自由探索" : "Sandbox Mode",
      description: isZh
        ? "你已经掌握了复利和FIRE的秘密：增加本金、提高利率、延长时间、控制开销。现在，规划你自己的财富花园吧。"
        : "You have mastered the secrets of Compound Interest and FIRE: Increase Principal, Higher Rate, More Time, Lower Expenses. Now, plan your own wealth garden.",
      defaultParams: { principal: 10000, monthlyContribution: 2000, monthlyExpenses: 4000, interestRate: 10, duration: 20, durationUnit: 'years' },
      lockedParams: [],
      nextCondition: () => false,
      nextButtonText: ""
    }
  ];
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [stage, setStage] = useState<number>(0);

  // We need to keep params state, but when stage changes, we might want to reset default params
  // However, `getChapters` is now a function.
  const chapters = getChapters(lang);
  const currentChapter = chapters[stage];

  const [params, setParams] = useState<SimulationParams>(chapters[0].defaultParams);
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);

  const t = TRANSLATIONS[lang];

  // Recalculate data whenever params change
  useEffect(() => {
    const newData = calculateCompoundInterest(params, lang);
    setData(newData);

    // Logic to keep scrubbing consistent or meaningful
    if (currentYearIndex >= newData.length) {
      setCurrentYearIndex(newData.length - 1);
    } else {
      // If we switch units, we usually want to jump to end to see result
      // But if just scrubbing, we might want to stay. 
      // For simplicity in this demo, jump to end on major data change to show growth
      setCurrentYearIndex(newData.length - 1);
    }
  }, [params, lang]);

  // When stage changes, load default params
  useEffect(() => {
    if (stage < chapters.length) {
      setParams(chapters[stage].defaultParams);
    }
  }, [stage]);

  const handleNextStage = () => {
    if (stage < chapters.length - 1) {
      setStage(stage + 1);
    }
  };

  const handlePrevStage = () => {
    if (stage > 0) {
      setStage(stage - 1);
    }
  };

  const currentData = data[currentYearIndex] || { timeIndex: 0, label: 'Start', balance: 0, totalPrincipal: 0, totalInterest: 0 };
  const canProceed = currentChapter.nextCondition(params, data);

  // Calculate stats for display
  const monthlyPassiveIncome = (currentData.balance * (params.interestRate / 100)) / 12;

  // Calculate FIRE Number if in FIRE chapter or Sandbox
  let fireTarget: number | null = null;
  if ((stage === GameStage.CHAPTER_5 || stage === GameStage.SANDBOX) && params.interestRate > 0) {
    fireTarget = (params.monthlyExpenses * 12) / (params.interestRate / 100);
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] text-[#586E75] font-sans selection:bg-[#D33682] selection:text-white pb-12">

      {/* Top Bar */}
      <nav className="p-4 md:p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#586E75] flex items-center justify-center font-serif font-bold">
            {stage + 1}
          </div>
          <h1 className="text-xl font-serif font-bold tracking-wide text-[#073642]">
            {t.appTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="font-bold text-sm bg-[#EEE8D5] px-3 py-1 rounded hover:bg-[#93A1A1] hover:text-white transition-colors"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <div className="text-sm font-bold tracking-widest uppercase opacity-50 hidden sm:block">
            {currentChapter.subtitle}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

        {/* Left Column: Narrative & Controls */}
        <div className="md:col-span-5 flex flex-col gap-8">

          {/* Narrative Card */}
          <div className="bg-[#EEE8D5] p-6 md:p-8 rounded-tr-[30px] rounded-bl-[30px] shadow-[4px_4px_0px_rgba(88,110,117,0.1)] relative">
            <h2 className="text-2xl font-serif font-bold text-[#D33682] mb-2">
              {currentChapter.title}
            </h2>
            <p className="text-lg leading-relaxed font-serif text-[#657B83]">
              {currentChapter.description}
            </p>

            {/* Guide/Hint */}
            {!canProceed && stage !== GameStage.SANDBOX && (
              <div className="mt-4 text-sm font-bold text-[#2AA198] flex items-center gap-2">
                <span>{t.nav.hint}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="relative z-10">
            <Controls
              params={params}
              setParams={setParams}
              lockedParams={currentChapter.lockedParams}
              lang={lang}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {stage > 0 && (
              <button
                onClick={handlePrevStage}
                className="flex-1 py-4 rounded-xl font-bold text-lg font-serif border-2 border-[#586E75] text-[#586E75] hover:bg-[#EEE8D5] transition-all"
              >
                &larr; {t.nav.prev}
              </button>
            )}

            {stage !== GameStage.SANDBOX && (
              <button
                onClick={handleNextStage}
                disabled={!canProceed}
                className={`
                    flex-[2] py-4 rounded-xl font-bold text-lg transition-all duration-300 font-serif
                    border-2 border-[#586E75] shadow-[4px_4px_0px_#586E75]
                    ${canProceed
                    ? 'bg-[#2AA198] text-white hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#586E75]'
                    : 'bg-[#E0E0E0] text-[#A0A0A0] cursor-not-allowed opacity-50'}
                `}
              >
                {currentChapter.nextButtonText} &rarr;
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Visualization */}
        <div className="md:col-span-7 space-y-6 order-first md:order-none">

          {/* Stats Display */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Balance */}
            <div className="p-4 border-2 border-[#586E75] rounded-xl bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#D33682]"></div>
              <div className="text-xs uppercase tracking-widest mb-1 opacity-60">{t.balance}</div>
              <div className="text-2xl md:text-3xl font-bold text-[#073642]">
                ${currentData.balance.toLocaleString()}
              </div>
            </div>

            {/* Dynamic Stat: Principal OR Passive Income */}
            {stage >= GameStage.CHAPTER_4 ? (
              <div className="p-4 border-2 border-[#586E75] rounded-xl bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.05)] text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#B58900]"></div>
                <div className="text-xs uppercase tracking-widest mb-1 opacity-60">{t.passiveIncome}</div>
                <div className="text-2xl md:text-3xl font-bold text-[#B58900]">
                  ${Math.floor(monthlyPassiveIncome).toLocaleString()}
                </div>
                {stage === GameStage.CHAPTER_5 || stage === GameStage.SANDBOX ? (
                  <div className="text-xs text-[#93A1A1] mt-1">{t.goal}: ${params.monthlyExpenses.toLocaleString()}</div>
                ) : null}
              </div>
            ) : (
              <div className="p-4 border-2 border-[#586E75] rounded-xl bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#2AA198]"></div>
                <div className="text-xs uppercase tracking-widest mb-1 opacity-60">{t.principal}</div>
                <div className="text-2xl md:text-3xl font-bold text-[#586E75]">
                  ${currentData.totalPrincipal.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Phaser Canvas Container */}
          <div className="aspect-[4/3] w-full border-4 border-[#586E75] bg-[#FDF6E3] rounded-2xl relative shadow-[8px_8px_0px_rgba(88,110,117,0.2)] overflow-hidden">

            {/* Timeline Scrubber */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-4">
              <span className="font-bold font-mono text-xs w-20 text-right">
                {currentData.label}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, data.length - 1)}
                value={currentYearIndex}
                onChange={(e) => setCurrentYearIndex(Number(e.target.value))}
                className="flex-1 h-2 bg-[#93A1A1] rounded-lg appearance-none cursor-pointer accent-[#2AA198]"
              />
              <span className="font-bold font-mono text-xs text-[#93A1A1] w-20">
                {params.duration} {params.durationUnit === 'years' ? t.nav.year : t.nav.month}
              </span>
            </div>

            <PhaserGame
              data={data}
              currentYearIndex={currentYearIndex}
              targetValue={fireTarget}
              targetLabel={t.goal}
            />

            {/* Legend */}
            <div className="absolute bottom-2 right-4 flex gap-4 text-xs font-bold pointer-events-none">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#D33682] rounded-full"></div>
                <span>{t.interest}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#2AA198] rounded-full"></div>
                <span>{t.principal}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Footer */}
      <footer className="mt-12 text-center opacity-40 font-serif text-sm">
        <p>{t.footer}</p>
        <p className="mt-2">
          <a
            href="https://github.com/ZoraMing/Compound-Garden"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}