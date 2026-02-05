export const COLORS = {
  bg: 0xFDF6E3,       // Solarized Base3 (Cream/Paper)
  principal: 0x2AA198, // Cyan (Hand-drawn ink look)
  interest: 0xD33682,  // Magenta (Florence highlight)
  text: 0x657B83,      // Base00
  grid: 0x93A1A1,      // Base1
  highlight: 0xB58900, // Yellow/Orange
};

export const GAME_CONFIG = {
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

export const TRANSLATIONS = {
  zh: {
    appTitle: "复利花园",
    footer: "“种一棵树最好的时间是十年前，其次是现在。”",
    balance: "总金额",
    principal: "本金",
    interest: "收益",
    passiveIncome: "月被动收入",
    goal: "目标",
    controls: {
      principal: "初始资金",
      monthlyContribution: "每月定投",
      monthlyExpenses: "每月开销",
      interestRate: "年化收益率",
      duration: "持有时间",
      switchToMonths: "切换为月",
      switchToYears: "切换为年",
      yearsSuffix: "年",
      monthsSuffix: "个月",
    },
    nav: {
      prev: "上一章",
      hint: "💡 试着调整滑块...",
      year: "年",
      month: "月"
    }
  },
  en: {
    appTitle: "Compound Garden",
    footer: "“The best time to plant a tree was 20 years ago. The second best time is now.”",
    balance: "Balance",
    principal: "Principal",
    interest: "Interest",
    passiveIncome: "Passive / Mo",
    goal: "Goal",
    controls: {
      principal: "Principal",
      monthlyContribution: "Monthly Savings",
      monthlyExpenses: "Monthly Expenses",
      interestRate: "Interest Rate",
      duration: "Duration",
      switchToMonths: "Switch to Months",
      switchToYears: "Switch to Years",
      yearsSuffix: " Yrs",
      monthsSuffix: " Mos",
    },
    nav: {
      prev: "Previous",
      hint: "💡 Try moving the sliders...",
      year: "YR",
      month: "MO"
    }
  }
};
