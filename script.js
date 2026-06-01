const STORAGE_KEY = "online-play-money-bank-state";
const STORAGE_VERSION = 2;
const DEFAULT_AMOUNT = 1000000;
const MAX_AMOUNT = 1000000000000000;

const currencies = {
  USD: {
    symbol: "$",
    name: "USD",
    locale: "en-US",
    usdRate: 1,
    unit: "pretend dollars",
    country: "the United States",
    examples: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.4 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 20 }
    ]
  },
  EUR: {
    symbol: "€",
    name: "EUR",
    locale: "fr-FR",
    usdRate: 1.08,
    unit: "pretend euros",
    country: "France",
    examples: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.43 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 12 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 15 }
    ]
  },
  GBP: {
    symbol: "£",
    name: "GBP",
    locale: "en-GB",
    usdRate: 1.27,
    unit: "pretend pounds",
    country: "the United Kingdom",
    examples: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.56 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 10 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 16 }
    ]
  },
  JPY: {
    symbol: "¥",
    name: "JPY",
    locale: "ja-JP",
    usdRate: 0.0064,
    unit: "pretend yen",
    country: "Japan",
    examples: [
      { singular: "100-yen shop treasure", plural: "100-yen shop treasures", price: 100 },
      { singular: "konbini ready-to-eat meal", plural: "konbini ready-to-eat meals", price: 500 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 1454 }
    ]
  },
  CAD: {
    symbol: "C$",
    name: "CAD",
    locale: "en-CA",
    usdRate: 0.73,
    unit: "pretend Canadian dollars",
    country: "Canada",
    examples: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.31 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15.79 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 25 }
    ]
  },
  AUD: {
    symbol: "A$",
    name: "AUD",
    locale: "en-AU",
    usdRate: 0.66,
    unit: "pretend Australian dollars",
    country: "Australia",
    examples: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.58 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 21 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 25 }
    ]
  }
};

const exampleSetsByCurrency = {
  USD: {
    tiny: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.4 },
      { singular: "local transit ride", plural: "local transit rides", price: 2.5 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15 }
    ],
    hundred: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.4 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 20 }
    ],
    thousand: [
      { singular: "pair of mid-range running shoes", plural: "pairs of mid-range running shoes", price: 92.12 },
      { singular: "monthly phone plan", plural: "monthly phone plans", price: 61.3 },
      { singular: "monthly fitness membership", plural: "monthly fitness memberships", price: 45.35 }
    ],
    tenThousand: [
      { singular: "month of city-center rent", plural: "months of city-center rent", price: 1653.12 },
      { singular: "basic-utilities month", plural: "basic-utilities months", price: 214.01 },
      { singular: "new leather business shoe pair", plural: "new leather business shoe pairs", price: 115.5 }
    ],
    hundredThousand: [
      { singular: "new compact car", plural: "new compact cars", price: 30000 },
      { singular: "year of international primary school", plural: "years of international primary school", price: 25305.93 },
      { singular: "preschool month", plural: "preschool months", price: 1452.83 }
    ],
    million: [
      { singular: "city-center apartment month", plural: "city-center apartment months", price: 1653.12 },
      { singular: "new compact car", plural: "new compact cars", price: 30000 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15 }
    ],
    billion: [
      { singular: "year of preschool", plural: "years of preschool", price: 17433.96 },
      { singular: "new compact car", plural: "new compact cars", price: 30000 },
      { singular: "city-center apartment year", plural: "city-center apartment years", price: 19837.44 }
    ],
    trillion: [
      { singular: "city-center apartment century", plural: "city-center apartment centuries", price: 1983744 },
      { singular: "new compact-car fleet of 1,000", plural: "new compact-car fleets of 1,000", price: 30000000 },
      { singular: "cinema ticket for every seat in a 200-seat theater", plural: "cinema tickets for every seat in a 200-seat theater", price: 3000 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 15 },
      { singular: "new compact car", plural: "new compact cars", price: 30000 },
      { singular: "century of city-center rent for 1,000 apartments", plural: "centuries of city-center rent for 1,000 apartments", price: 1983744000 }
    ]
  },
  EUR: {
    tiny: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.43 },
      { singular: "metro-style local ticket", plural: "metro-style local tickets", price: 1.9 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 12 }
    ],
    hundred: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.43 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 12 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 15 }
    ],
    thousand: [
      { singular: "monthly phone plan", plural: "monthly phone plans", price: 19.26 },
      { singular: "fitness-club month", plural: "fitness-club months", price: 32.55 },
      { singular: "pair of mid-range running shoes", plural: "pairs of mid-range running shoes", price: 92.85 }
    ],
    tenThousand: [
      { singular: "month of city-center rent", plural: "months of city-center rent", price: 769.41 },
      { singular: "basic-utilities month", plural: "basic-utilities months", price: 191.15 },
      { singular: "monthly public transport pass", plural: "monthly public transport passes", price: 58 }
    ],
    hundredThousand: [
      { singular: "new compact car", plural: "new compact cars", price: 30900 },
      { singular: "year of international primary school", plural: "years of international primary school", price: 10797.58 },
      { singular: "preschool month", plural: "preschool months", price: 748.29 }
    ],
    million: [
      { singular: "city-center apartment month", plural: "city-center apartment months", price: 769.41 },
      { singular: "new compact car", plural: "new compact cars", price: 30900 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 12 }
    ],
    billion: [
      { singular: "year of preschool", plural: "years of preschool", price: 8979.48 },
      { singular: "new compact car", plural: "new compact cars", price: 30900 },
      { singular: "city-center apartment year", plural: "city-center apartment years", price: 9232.92 }
    ],
    trillion: [
      { singular: "city-center apartment century", plural: "city-center apartment centuries", price: 923292 },
      { singular: "new compact-car fleet of 1,000", plural: "new compact-car fleets of 1,000", price: 30900000 },
      { singular: "cinema ticket for every seat in a 200-seat theater", plural: "cinema tickets for every seat in a 200-seat theater", price: 2400 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 12 },
      { singular: "new compact car", plural: "new compact cars", price: 30900 },
      { singular: "century of city-center rent for 1,000 apartments", plural: "centuries of city-center rent for 1,000 apartments", price: 923292000 }
    ]
  },
  GBP: {
    tiny: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.56 },
      { singular: "local transport ride", plural: "local transport rides", price: 2.5 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 10 }
    ],
    hundred: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 3.56 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 10 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 16 }
    ],
    thousand: [
      { singular: "monthly phone plan", plural: "monthly phone plans", price: 13.4 },
      { singular: "fitness-club month", plural: "fitness-club months", price: 34.82 },
      { singular: "pair of mid-range running shoes", plural: "pairs of mid-range running shoes", price: 76.24 }
    ],
    tenThousand: [
      { singular: "month of city-center rent", plural: "months of city-center rent", price: 1014.59 },
      { singular: "basic-utilities month", plural: "basic-utilities months", price: 241.55 },
      { singular: "monthly public transport pass", plural: "monthly public transport passes", price: 75 }
    ],
    hundredThousand: [
      { singular: "new compact car", plural: "new compact cars", price: 28895 },
      { singular: "year of international primary school", plural: "years of international primary school", price: 16806.23 },
      { singular: "preschool month", plural: "preschool months", price: 1280.34 }
    ],
    million: [
      { singular: "city-center apartment month", plural: "city-center apartment months", price: 1014.59 },
      { singular: "new compact car", plural: "new compact cars", price: 28895 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 10 }
    ],
    billion: [
      { singular: "year of preschool", plural: "years of preschool", price: 15364.08 },
      { singular: "new compact car", plural: "new compact cars", price: 28895 },
      { singular: "city-center apartment year", plural: "city-center apartment years", price: 12175.08 }
    ],
    trillion: [
      { singular: "city-center apartment century", plural: "city-center apartment centuries", price: 1217508 },
      { singular: "new compact-car fleet of 1,000", plural: "new compact-car fleets of 1,000", price: 28895000 },
      { singular: "cinema ticket for every seat in a 200-seat theater", plural: "cinema tickets for every seat in a 200-seat theater", price: 2000 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 10 },
      { singular: "new compact car", plural: "new compact cars", price: 28895 },
      { singular: "century of city-center rent for 1,000 flats", plural: "centuries of city-center rent for 1,000 flats", price: 1217508000 }
    ]
  },
  JPY: {
    tiny: [
      { singular: "100-yen shop treasure", plural: "100-yen shop treasures", price: 100 },
      { singular: "cafe coffee", plural: "cafe coffees", price: 506 },
      { singular: "ramen bowl", plural: "ramen bowls", price: 733 }
    ],
    hundred: [
      { singular: "100-yen shop treasure", plural: "100-yen shop treasures", price: 100 },
      { singular: "loaf of white bread", plural: "loaves of white bread", price: 262 },
      { singular: "milk carton", plural: "milk cartons", price: 280 }
    ],
    thousand: [
      { singular: "ramen bowl", plural: "ramen bowls", price: 733 },
      { singular: "konbini ready-to-eat meal", plural: "konbini ready-to-eat meals", price: 500 },
      { singular: "cafe coffee", plural: "cafe coffees", price: 506 }
    ],
    tenThousand: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 1454 },
      { singular: "taxi ride of about 4 km", plural: "taxi rides of about 4 km", price: 1752 },
      { singular: "5 kg bag of rice", plural: "5 kg bags of rice", price: 4973 }
    ],
    hundredThousand: [
      { singular: "monthly transportation budget", plural: "monthly transportation budgets", price: 10000 },
      { singular: "single-person monthly food budget", plural: "single-person monthly food budgets", price: 45000 },
      { singular: "monthly fitness-gym membership", plural: "monthly fitness-gym memberships", price: 11031 }
    ],
    million: [
      { singular: "Tokyo rent month", plural: "Tokyo rent months", price: 140000 },
      { singular: "single-person monthly food budget", plural: "single-person monthly food budgets", price: 45000 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 1454 }
    ],
    billion: [
      { singular: "Tokyo rent year", plural: "Tokyo rent years", price: 1680000 },
      { singular: "5 kg bag of rice", plural: "5 kg bags of rice", price: 4973 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 1454 }
    ],
    trillion: [
      { singular: "Tokyo rent century", plural: "Tokyo rent centuries", price: 168000000 },
      { singular: "million-ramen festival", plural: "million-ramen festivals", price: 733000000 },
      { singular: "cinema sellout for 200 seats", plural: "cinema sellouts for 200 seats", price: 290800 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 1454 },
      { singular: "Tokyo rent year", plural: "Tokyo rent years", price: 1680000 },
      { singular: "ramen bowl", plural: "ramen bowls", price: 733 }
    ]
  },
  CAD: {
    tiny: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.31 },
      { singular: "local transit ride", plural: "local transit rides", price: 3.5 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15.79 }
    ],
    hundred: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.31 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15.79 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 25 }
    ],
    thousand: [
      { singular: "monthly phone plan", plural: "monthly phone plans", price: 59.65 },
      { singular: "fitness-club month", plural: "fitness-club months", price: 58.26 },
      { singular: "pair of mid-range running shoes", plural: "pairs of mid-range running shoes", price: 122.29 }
    ],
    tenThousand: [
      { singular: "month of city-center rent", plural: "months of city-center rent", price: 1820.9 },
      { singular: "basic-utilities month", plural: "basic-utilities months", price: 210.64 },
      { singular: "monthly public transport pass", plural: "monthly public transport passes", price: 102 }
    ],
    hundredThousand: [
      { singular: "new mid-size car", plural: "new mid-size cars", price: 27329.34 },
      { singular: "year of international primary school", plural: "years of international primary school", price: 20354.42 },
      { singular: "preschool month", plural: "preschool months", price: 1066.46 }
    ],
    million: [
      { singular: "city-center apartment month", plural: "city-center apartment months", price: 1820.9 },
      { singular: "new mid-size car", plural: "new mid-size cars", price: 27329.34 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 15.79 }
    ],
    billion: [
      { singular: "year of preschool", plural: "years of preschool", price: 12797.52 },
      { singular: "new mid-size car", plural: "new mid-size cars", price: 27329.34 },
      { singular: "city-center apartment year", plural: "city-center apartment years", price: 21850.8 }
    ],
    trillion: [
      { singular: "city-center apartment century", plural: "city-center apartment centuries", price: 2185080 },
      { singular: "new mid-size-car fleet of 1,000", plural: "new mid-size-car fleets of 1,000", price: 27329340 },
      { singular: "cinema ticket for every seat in a 200-seat theater", plural: "cinema tickets for every seat in a 200-seat theater", price: 3158 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 15.79 },
      { singular: "new mid-size car", plural: "new mid-size cars", price: 27329.34 },
      { singular: "century of city-center rent for 1,000 apartments", plural: "centuries of city-center rent for 1,000 apartments", price: 2185080000 }
    ]
  },
  AUD: {
    tiny: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.58 },
      { singular: "local transport ride", plural: "local transport rides", price: 4.5 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 21 }
    ],
    hundred: [
      { singular: "regular cappuccino", plural: "regular cappuccinos", price: 5.58 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 21 },
      { singular: "inexpensive restaurant meal", plural: "inexpensive restaurant meals", price: 25 }
    ],
    thousand: [
      { singular: "monthly phone plan", plural: "monthly phone plans", price: 41.16 },
      { singular: "fitness-club month", plural: "fitness-club months", price: 77.53 },
      { singular: "pair of mid-range running shoes", plural: "pairs of mid-range running shoes", price: 160.42 }
    ],
    tenThousand: [
      { singular: "month of city-center rent", plural: "months of city-center rent", price: 2175.62 },
      { singular: "basic-utilities month", plural: "basic-utilities months", price: 276.04 },
      { singular: "monthly public transport pass", plural: "monthly public transport passes", price: 130.22 }
    ],
    hundredThousand: [
      { singular: "new compact car", plural: "new compact cars", price: 40000 },
      { singular: "year of international primary school", plural: "years of international primary school", price: 24701 },
      { singular: "preschool month", plural: "preschool months", price: 3014.28 }
    ],
    million: [
      { singular: "city-center apartment month", plural: "city-center apartment months", price: 2175.62 },
      { singular: "new compact car", plural: "new compact cars", price: 40000 },
      { singular: "cinema ticket", plural: "cinema tickets", price: 21 }
    ],
    billion: [
      { singular: "year of preschool", plural: "years of preschool", price: 36171.36 },
      { singular: "new compact car", plural: "new compact cars", price: 40000 },
      { singular: "city-center apartment year", plural: "city-center apartment years", price: 26107.44 }
    ],
    trillion: [
      { singular: "city-center apartment century", plural: "city-center apartment centuries", price: 2610744 },
      { singular: "new compact-car fleet of 1,000", plural: "new compact-car fleets of 1,000", price: 40000000 },
      { singular: "cinema ticket for every seat in a 200-seat theater", plural: "cinema tickets for every seat in a 200-seat theater", price: 4200 }
    ],
    quadrillion: [
      { singular: "cinema ticket", plural: "cinema tickets", price: 21 },
      { singular: "new compact car", plural: "new compact cars", price: 40000 },
      { singular: "century of city-center rent for 1,000 apartments", plural: "centuries of city-center rent for 1,000 apartments", price: 2610744000 }
    ]
  }
};

Object.entries(exampleSetsByCurrency).forEach(([code, exampleSets]) => {
  currencies[code].exampleSets = exampleSets;
});

const billColors = [
  ["#baff82", "#58d56f"],
  ["#ffd6f0", "#ff8ed2"],
  ["#a6f4ff", "#55c9ed"],
  ["#fff280", "#ffbd42"],
  ["#d5c4ff", "#9276ff"],
  ["#ffb798", "#ff765f"]
];

const amountInput = document.querySelector("#amount");
const currencySelect = document.querySelector("#currency");
const display = document.querySelector("#balance-display");
const amountSymbol = document.querySelector("#amount-symbol");
const wealthFlavor = document.querySelector("#wealth-flavor");
const buyExamples = document.querySelector("#buy-examples");
const wealthCount = document.querySelector("#wealth-count");
const moneyScene = document.querySelector("#money-scene");
const stuffedBillScene = document.querySelector("#stuffed-bill-scene");
const wealthEffects = document.querySelector("#wealth-effects");
const receiptTape = document.querySelector("#receipt-tape");
const register = document.querySelector("#register");
const clearButton = document.querySelector("#clear-register");
const presetButtons = document.querySelectorAll("[data-amount]");
const calcKeys = document.querySelectorAll("[data-calc]");
const wealthCaption = document.querySelector("#wealth-caption");
const settingsButton = document.querySelector("#settings-button");
const settingsDialog = document.querySelector("#settings-dialog");
const reduceMotionToggle = document.querySelector("#reduce-motion");
const resetSavedStateButton = document.querySelector("#reset-saved-state");

let state = loadState();
let previousAmount = state.amount;
let lastDirection = "in";
let calcInput = formatCalculatorInput(state.amount);
let calcStoredValue = null;
let calcOperator = null;
let calcShouldResetInput = true;
let receiptLines = [];
let setReceiptTimer = 0;
let lastSetReceiptAmount = null;

initialize();

function initialize() {
  applyMotionPreference();
  amountInput.value = formatInputAmount(state.amount);
  currencySelect.value = state.currency;
  reduceMotionToggle.checked = Boolean(state.reducedMotion);
  render("in");
  addReceiptLine(`BAL ${formatLedgerAmount(state.amount)}`);

  amountInput.addEventListener("input", () => {
    setAmount(parseAmountInput(amountInput.value), false);
    queueSetReceiptLine();
  });

  amountInput.addEventListener("blur", () => {
    amountInput.value = formatInputAmount(state.amount);
    commitSetReceiptLine();
  });

  amountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      amountInput.blur();
    }
  });

  currencySelect.addEventListener("change", () => {
    const previousCurrency = state.currency;
    state.currency = currencySelect.value;
    saveState();
    render("currency");
    amountInput.value = formatInputAmount(state.amount);
    addReceiptLine(`CUR ${previousCurrency}->${state.currency} ${formatLedgerAmount(state.amount)}`);
    playCurrencySwap(previousCurrency, state.currency);
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAmount(button.dataset.amount);
      addReceiptLine(`SET ${formatLedgerAmount(state.amount)}`);
      calcInput = formatCalculatorInput(state.amount);
      calcStoredValue = null;
      calcOperator = null;
      calcShouldResetInput = true;
      amountInput.focus();
    });
  });

  clearButton.addEventListener("click", () => {
    setAmount(0);
    addReceiptLine("CLEAR 0.00");
    calcInput = "0";
    calcStoredValue = null;
    calcOperator = null;
    calcShouldResetInput = true;
    amountInput.focus();
  });

  calcKeys.forEach((button) => {
    button.addEventListener("click", () => handleCalculatorPress(button.dataset.calc));
  });

  settingsButton.addEventListener("click", () => {
    if (typeof settingsDialog.showModal === "function") {
      settingsDialog.showModal();
    } else {
      settingsDialog.setAttribute("open", "");
    }
  });

  reduceMotionToggle.addEventListener("change", () => {
    state.reducedMotion = reduceMotionToggle.checked;
    saveState();
    applyMotionPreference();
    render("settings");
    addReceiptLine(`MOTION ${state.reducedMotion ? "LOW" : "FULL"}`);
  });

  resetSavedStateButton.addEventListener("click", () => {
    const reducedMotion = state.reducedMotion;
    state = {
      amount: DEFAULT_AMOUNT,
      currency: "USD",
      reducedMotion,
      version: STORAGE_VERSION
    };
    previousAmount = state.amount;
    calcInput = formatCalculatorInput(state.amount);
    calcStoredValue = null;
    calcOperator = null;
    calcShouldResetInput = true;
    lastSetReceiptAmount = null;
    saveState();
    currencySelect.value = state.currency;
    amountInput.value = formatInputAmount(state.amount);
    receiptLines = [];
    render("settings");
    addReceiptLine(`RESET ${formatLedgerAmount(state.amount)}`);
  });
}

function setAmount(rawValue, syncInput = true) {
  const numeric = typeof rawValue === "number" ? rawValue : parseAmountInput(rawValue);
  const amount = clamp(Number.isFinite(numeric) ? roundMoney(numeric) : 0, 0, MAX_AMOUNT);
  lastDirection = amount >= state.amount ? "in" : "out";
  previousAmount = state.amount;
  state.amount = amount;
  if (syncInput) {
    amountInput.value = formatInputAmount(amount);
  }
  saveState();
  render(lastDirection);
}

function queueSetReceiptLine() {
  window.clearTimeout(setReceiptTimer);
  setReceiptTimer = window.setTimeout(commitSetReceiptLine, 700);
}

function commitSetReceiptLine() {
  window.clearTimeout(setReceiptTimer);
  if (lastSetReceiptAmount === state.amount) {
    return;
  }
  lastSetReceiptAmount = state.amount;
  addReceiptLine(`SET ${formatLedgerAmount(state.amount)}`);
}

function handleCalculatorPress(key) {
  if (key === "clear") {
    calcInput = "0";
    calcStoredValue = null;
    calcOperator = null;
    calcShouldResetInput = true;
    setAmount(0);
    addReceiptLine("ON/C 0.00");
    return;
  }

  if (key === "open") {
    register.classList.add("jiggle");
    renderFlyingGhosts(currencies[state.currency]);
    addReceiptLine("OPEN DRAWER");
    window.setTimeout(() => register.classList.remove("jiggle"), 480);
    return;
  }

  if (key === "=") {
    runPendingCalculation();
    calcOperator = null;
    calcStoredValue = null;
    calcShouldResetInput = true;
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    runPendingCalculation(false);
    calcStoredValue = state.amount;
    calcOperator = key;
    calcShouldResetInput = true;
    return;
  }

  if (key === ".") {
    if (calcShouldResetInput) {
      calcInput = "0.";
      calcShouldResetInput = false;
    } else if (!calcInput.includes(".")) {
      calcInput += ".";
    }
    setAmount(calcInput);
    return;
  }

  if (/^\d$/.test(key)) {
    if (calcShouldResetInput || calcInput === "0") {
      calcInput = key;
      calcShouldResetInput = false;
    } else {
      calcInput += key;
    }

    if (calcInput.replace(".", "").length > 16) {
      calcInput = calcInput.slice(0, -1);
      return;
    }

    setAmount(calcInput);
  }
}

function runPendingCalculation(logTotal = true) {
  const currentValue = clamp(roundMoney(Number(calcInput) || 0), 0, MAX_AMOUNT);

  if (calcOperator && calcStoredValue !== null) {
    const left = calcStoredValue;
    const operator = calcOperator;
    const result = calculate(calcStoredValue, currentValue, calcOperator);
    setAmount(result);
    addReceiptLine(`${formatLedgerAmount(left)} ${formatOperator(operator)} ${formatLedgerAmount(currentValue)} = ${formatLedgerAmount(state.amount)}`);
    calcInput = formatCalculatorInput(state.amount);
    return;
  }

  setAmount(currentValue);
  if (logTotal) {
    addReceiptLine(`TOTAL ${formatLedgerAmount(state.amount)}`);
  }
  calcInput = formatCalculatorInput(state.amount);
}

function calculate(left, right, operator) {
  if (operator === "+") return clamp(left + right, 0, MAX_AMOUNT);
  if (operator === "-") return clamp(left - right, 0, MAX_AMOUNT);
  if (operator === "*") return clamp(left * right, 0, MAX_AMOUNT);
  if (operator === "/") return right === 0 ? left : clamp(left / right, 0, MAX_AMOUNT);
  return right;
}

function render(direction) {
  const currency = currencies[state.currency];
  display.textContent = formatMoney(state.amount, currency);
  display.style.fontSize = getDisplaySize(state.amount);
  amountSymbol.textContent = currency.symbol;
  updateAmountInputSize();
  wealthFlavor.textContent = getFlavorText(state.amount, currency.unit);
  buyExamples.textContent = getBuyExamples(state.amount, currency);
  wealthCount.textContent = getWealthCountLine(state.amount, currency);

  const wealthState = getWealthState(state.amount);
  register.classList.remove(
    "state-empty",
    "state-small",
    "state-medium",
    "state-large",
    "state-huge",
    "state-ridiculous",
    "jiggle",
    "huge",
    "strain-million",
    "strain-billion",
    "strain-trillion",
    "strain-quadrillion"
  );
  register.classList.add(`state-${wealthState}`);
  if (state.amount >= 1000000) {
    register.classList.add("huge");
  }
  const strainClass = getStrainClass(state.amount);
  if (strainClass) {
    register.classList.add(strainClass);
  }

  renderMoney(state.amount, currency, direction);
  renderWealthEffects(state.amount, currency);

  if (direction !== "currency" && state.amount !== previousAmount) {
    register.classList.add("jiggle");
    window.setTimeout(() => register.classList.remove("jiggle"), 480);
  }
}

function renderMoney(amount, currency, direction) {
  moneyScene.replaceChildren();
  stuffedBillScene.replaceChildren();

  if (amount <= 0) {
    if (direction === "out") {
      renderFlyingGhosts(currency);
    }
    return;
  }

  const pieces = createPieces(amount, currency);
  pieces.forEach((piece, index) => {
    const element = document.createElement("span");
    element.className = piece.className || piece.type;
    if (direction === "in" && !state.reducedMotion) {
      element.classList.add("fly-in");
    }
    element.style.left = `${piece.x}%`;
    element.style.bottom = `${piece.y}px`;
    element.style.zIndex = String(piece.z);
    element.style.setProperty("--rot", `${piece.rot}deg`);
    element.style.setProperty("--from-rot", `${piece.rot + (index % 2 ? 38 : -38)}deg`);
    element.style.setProperty("--from-x", `${piece.fromX ?? (index % 2 ? 180 : -180)}px`);
    element.style.animationDelay = `${Math.min(index * 24, 260)}ms`;

    if (piece.overflow) {
      element.classList.add("overflow-top");
    }

    if (piece.type === "bill") {
      const colorPair = piece.colorPair || billColors[index % billColors.length];
      element.style.setProperty("--bill-a", colorPair[0]);
      element.style.setProperty("--bill-b", colorPair[1]);
      element.textContent = currency.symbol;
      element.setAttribute("aria-hidden", "true");
    }

    if (piece.type === "brick") {
      element.dataset.symbol = currency.symbol;
    }

    if (piece.type === "coin") {
      element.textContent = piece.label || currency.symbol;
    }

    moneyScene.append(element);
  });

  if (direction === "out" && !state.reducedMotion) {
    renderFlyingGhosts(currency, previousAmount - amount);
  }

  renderStuffedBills(amount, currency, direction);
}

function renderStuffedBills(amount, currency, direction) {
  const count = amount >= 1000000000000000 ? 28 : amount >= 1000000000000 ? 18 : 0;
  if (!count) {
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const bill = document.createElement("span");
    bill.className = "bill stuffed-bill";
    if (direction === "in" && !state.reducedMotion) {
      bill.classList.add("stuff-in");
    }
    const colorPair = billColors[i % billColors.length];
    const cluster = i % 5;
    const layer = Math.floor(i / 5);
    bill.style.setProperty("--bill-a", colorPair[0]);
    bill.style.setProperty("--bill-b", colorPair[1]);
    bill.style.setProperty("--rot", `${[-64, -38, -16, 26, 52][cluster] + (layer % 2 ? 7 : -4)}deg`);
    bill.style.setProperty("--bend", `${cluster % 2 ? -14 : 14}deg`);
    bill.style.setProperty("--stuff-x", `${cluster === 0 ? -18 : cluster === 4 ? 18 : 0}px`);
    bill.style.setProperty("--stuff-y", `${10 + (cluster % 3) * 4}px`);
    bill.style.left = `${18 + cluster * 15.5 + (layer % 2) * 2}%`;
    bill.style.bottom = `${10 + layer * 4 + (cluster % 2) * 2}px`;
    bill.style.zIndex = String(92 + layer);
    bill.style.animationDelay = `${Math.min(i * 28, 420)}ms`;
    bill.textContent = currency.symbol;
    stuffedBillScene.append(bill);
  }
}

function renderFlyingGhosts(currency, delta = previousAmount) {
  const denominations = getDenominations(currency.name);
  const magnitude = Math.log10(Math.max(Math.abs(delta), 1));
  const billCount = Math.min(22, 6 + Math.floor(magnitude * 2.2));
  const brickCount = Math.max(0, Math.min(8, Math.floor((magnitude - 5) * 1.4)));
  const coinCount = delta < 10 ? 4 : 0;

  for (let i = 0; i < coinCount; i += 1) {
    const coin = document.createElement("span");
    coin.className = "coin drawer-coin fly-out";
    coin.style.setProperty("--rot", `${-24 + i * 13}deg`);
    coin.style.setProperty("--from-rot", `${80 + i * 22}deg`);
    coin.style.setProperty("--from-x", `${i % 2 ? 160 : -160}px`);
    coin.style.left = `${8 + i * 6}%`;
    coin.style.bottom = `${14 + i * 10}px`;
    coin.style.zIndex = String(150 + i);
    coin.style.animationDelay = `${i * 28}ms`;
    coin.textContent = currency.symbol;
    moneyScene.append(coin);
    window.setTimeout(() => coin.remove(), 980);
  }

  for (let i = 0; i < billCount; i += 1) {
    const ghost = document.createElement("span");
    ghost.className = `bill fly-out ${i % 3 === 0 ? "bill-stack stack-thick" : ""}`;
    const denomination = denominations[i % Math.min(denominations.length, 4)];
    const colorPair = getBillColorPair(currency.name, denomination) || billColors[i % billColors.length];
    ghost.style.setProperty("--bill-a", colorPair[0]);
    ghost.style.setProperty("--bill-b", colorPair[1]);
    ghost.style.setProperty("--rot", `${-30 + (i * 11) % 64}deg`);
    ghost.style.setProperty("--from-rot", `${28 + i * 12}deg`);
    ghost.style.setProperty("--from-x", `${i % 2 ? 240 : -240}px`);
    ghost.style.left = `${8 + (i * 9) % 78}%`;
    ghost.style.bottom = `${22 + (i % 4) * 24}px`;
    ghost.style.zIndex = String(160 + i);
    ghost.style.animationDelay = `${i * 30}ms`;
    ghost.textContent = currency.symbol;
    moneyScene.append(ghost);
    window.setTimeout(() => ghost.remove(), 980);
  }

  for (let i = 0; i < brickCount; i += 1) {
    const brick = document.createElement("span");
    brick.className = "brick cash-brick fly-out";
    brick.dataset.symbol = currency.symbol;
    brick.style.setProperty("--rot", `${-10 + i * 5}deg`);
    brick.style.setProperty("--from-rot", `${38 + i * 17}deg`);
    brick.style.setProperty("--from-x", `${i % 2 ? 260 : -260}px`);
    brick.style.left = `${24 + (i * 11) % 50}%`;
    brick.style.bottom = `${30 + (i % 3) * 28}px`;
    brick.style.zIndex = String(190 + i);
    brick.style.animationDelay = `${120 + i * 44}ms`;
    moneyScene.append(brick);
    window.setTimeout(() => brick.remove(), 1080);
  }
}

function createPieces(amount, currency) {
  const wealthState = getWealthState(amount);
  const pieces = [];
  const denominations = getDenominations(currency.name);
  const visibleTarget = {
    small: 8,
    medium: 14,
    large: 22,
    huge: 34,
    ridiculous: 52
  }[wealthState] || 0;

  let remaining = Math.floor(amount);
  let index = 0;
  let lane = 0;

  denominations.forEach((denomination) => {
    if (remaining <= 0 || index >= visibleTarget) return;
    const count = Math.floor(remaining / denomination);
    if (count <= 0) return;

    const stacks = Math.min(count, Math.max(1, Math.ceil(count / getBundleSize(count))));
    const displayStacks = Math.min(stacks, visibleTarget - index);
    const bundleSize = Math.max(1, Math.ceil(count / displayStacks));

    for (let i = 0; i < displayStacks; i += 1) {
      pieces.push(createCashPiece(index, lane, i, displayStacks, denomination, bundleSize, currency, amount >= 1000000));
      index += 1;
    }

    remaining -= count * denomination;
    lane += 1;
  });

  if (amount > 0 && amount < 1) {
    const cents = Math.max(1, Math.round(amount * 100));
    pieces.push({
      type: "coin",
      className: "coin drawer-coin denom-coin-small",
      label: currency.symbol,
      x: 3,
      y: 12,
      rot: 0,
      z: 90
    });
  }

  if (pieces.length === 0 && amount >= 1) {
    pieces.push({
      type: "bill",
      className: "bill drawer-bill",
      label: currency.symbol,
      x: 20,
      y: 18,
      rot: -4,
      z: 70
    });
  }

  if (remaining > 0 || amount >= 1000000) {
    const megaStacks = Math.min(18, Math.max(2, Math.floor(Math.log10(Math.max(amount, 10)))));
    for (let i = 0; i < megaStacks && pieces.length < visibleTarget + 18; i += 1) {
      const value = amount / megaStacks;
      pieces.push(createCashBrick(pieces.length, value, currency, wealthState));
    }
  }

  const cents = Math.round((amount - Math.floor(amount)) * 100);
  for (let i = 0; i < Math.min(5, cents); i += 1) {
    pieces.push({
      type: "coin",
      className: "coin drawer-coin denom-coin-small",
      label: currency.symbol,
      x: 3 + (i % 2) * 4,
      y: 10 + Math.floor(i / 2) * 24,
      rot: -6 + i * 4,
      z: 120 + i
    });
  }

  return pieces;
}

function createCashPiece(index, lane, laneIndex, laneCount, denomination, bundleSize, currency, spreadAcrossCompartments = false) {
  const compartment = spreadAcrossCompartments ? laneIndex % 4 : lane % 4;
  const row = spreadAcrossCompartments ? Math.floor(laneIndex / 4) : Math.floor(laneIndex / 2);
  const pairOffset = spreadAcrossCompartments ? row % 2 : laneIndex % 2;
  const isStack = bundleSize > 1;
  const denominationStyle = getDenominationStyle(currency.name, denomination);

  if (isCoinDenomination(currency.name, denomination)) {
    return {
      type: "coin",
      className: `coin drawer-coin ${isStack ? "coin-stack" : ""} ${denominationStyle}`,
      label: currency.symbol,
      x: 5 + compartment * 3 + pairOffset * 3,
      y: 10 + row * 18 + Math.min(laneCount, 5) * 0.4,
      rot: -8 + pairOffset * 8,
      z: 70 + index,
      overflow: false
    };
  }

  return {
    type: "bill",
    className: `bill drawer-bill ${isStack ? `bill-stack ${getBundleClass(bundleSize)}` : ""} ${denominationStyle}`,
    label: currency.symbol,
    colorPair: getBillColorPair(currency.name, denomination),
    x: 27 + compartment * 18 + pairOffset * 3,
    y: 8 + row * (spreadAcrossCompartments ? 7 : 10) + Math.min(laneCount, 6) * 0.4,
    rot: -2 + pairOffset * 4,
    z: 60 + index,
    overflow: false
  };
}

function getBundleClass(bundleSize) {
  if (bundleSize >= 100000) return "stack-vault";
  if (bundleSize >= 1000) return "stack-fat";
  if (bundleSize >= 100) return "stack-thick";
  if (bundleSize >= 10) return "stack-medium";
  return "stack-thin";
}

function createCashBrick(index, value, currency) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  return {
    type: "brick",
    className: "brick cash-brick",
    label: currency.symbol,
    x: 27 + col * 18,
    y: 24 + row * 15,
    rot: -2 + (col % 2) * 4,
    z: 34 + index,
    overflow: false
  };
}

function getWealthState(amount) {
  if (amount <= 0) return "empty";
  if (amount <= 100) return "small";
  if (amount <= 10000) return "medium";
  if (amount <= 1000000) return "large";
  if (amount < 1000000000) return "huge";
  return "ridiculous";
}

function getStrainClass(amount) {
  if (amount >= 1000000000000000) return "strain-quadrillion";
  if (amount >= 1000000000000) return "strain-trillion";
  if (amount >= 1000000000) return "strain-billion";
  if (amount >= 1000000) return "strain-million";
  return "";
}

function renderWealthEffects(amount, currency) {
  wealthEffects.replaceChildren();

  if (state.reducedMotion || amount < 1000000000) {
    return;
  }

  const intensity = amount >= 1000000000000000 ? "quadrillion" : amount >= 1000000000000 ? "trillion" : "billion";
  const counts = {
    billion: { confetti: 12, champagne: 0, bottles: 0, fallingYachts: 0, pilingYachts: 0, looseBills: 0 },
    trillion: { confetti: 24, champagne: 0, bottles: 3, fallingYachts: 0, pilingYachts: 28 },
    quadrillion: { confetti: 58, champagne: 0, bottles: 7, fallingYachts: 0, pilingYachts: 120 }
  }[intensity];

  for (let i = 0; i < counts.confetti; i += 1) {
    const bit = document.createElement("span");
    bit.className = "confetti-bit";
    bit.style.left = `${2 + Math.random() * 96}%`;
    bit.style.setProperty("--fall-delay", `${Math.random() * -3.5}s`);
    bit.style.setProperty("--fall-speed", `${2.4 + Math.random() * 3.6}s`);
    bit.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    bit.style.setProperty("--spin", `${180 + Math.random() * 720}deg`);
    bit.style.background = ["#fff280", "#72e4ff", "#ff8ed2", "#9bff80", "#ffffff"][i % 5];
    wealthEffects.append(bit);
  }

  for (let i = 0; i < counts.champagne; i += 1) {
    const spray = document.createElement("span");
    spray.className = "champagne-spray";
    spray.style.left = `${8 + Math.random() * 84}%`;
    spray.style.bottom = `${42 + Math.random() * 118}px`;
    spray.style.setProperty("--spray-delay", `${Math.random() * -1.8}s`);
    wealthEffects.append(spray);
  }

  for (let i = 0; i < counts.bottles; i += 1) {
    const bottle = document.createElement("span");
    bottle.className = "champagne-bottle";
    bottle.style.left = `${10 + Math.random() * 80}%`;
    bottle.style.bottom = `${16 + Math.random() * 130}px`;
    bottle.style.setProperty("--bottle-delay", `${Math.random() * -2.2}s`);
    bottle.style.setProperty("--bottle-rot", `${i % 2 ? 28 : -28}deg`);
    wealthEffects.append(bottle);
  }

  for (let i = 0; i < counts.fallingYachts; i += 1) {
    const yacht = createYacht("falling-yacht");
    yacht.style.left = `${4 + Math.random() * 88}%`;
    yacht.style.setProperty("--yacht-delay", `${Math.random() * -7}s`);
    yacht.style.setProperty("--yacht-speed", `${5 + Math.random() * 5}s`);
    yacht.style.setProperty("--yacht-drift", `${-110 + Math.random() * 220}px`);
    yacht.style.setProperty("--yacht-rot", `${-28 + Math.random() * 56}deg`);
    wealthEffects.append(yacht);
  }

  for (let i = 0; i < counts.pilingYachts; i += 1) {
    const yacht = createYacht("piling-yacht");
    const row = Math.floor(i / 5);
    yacht.style.left = `${-34 + Math.random() * 134}%`;
    yacht.style.bottom = `${-20 + row * 112 + Math.random() * 52}px`;
    yacht.style.zIndex = String(30 + row);
    yacht.style.setProperty("--pile-rot", `${-18 + Math.random() * 36}deg`);
    yacht.style.setProperty("--pile-flip", i % 2 ? -1 : 1);
    yacht.style.setProperty("--pile-delay", `${i * 0.18 + Math.random() * 0.66}s`);
    yacht.style.setProperty("--pile-start-x", `${-140 + Math.random() * 280}px`);
    yacht.style.setProperty("--pile-start-y", `${-980 - Math.random() * 620}px`);
    yacht.style.setProperty("--pile-spin", `${-80 + Math.random() * 160}deg`);
    wealthEffects.append(yacht);
  }
}

function createYacht(className) {
  const yacht = document.createElement("span");
  yacht.className = className;
  return yacht;
}

function getDisplaySize(amount) {
  const characters = formatMoney(amount, currencies[state.currency]).length;
  if (characters > 21) return "20px";
  if (characters > 18) return "23px";
  if (characters > 16) return "28px";
  if (characters > 13) return "34px";
  return "";
}

function updateAmountInputSize() {
  const length = amountInput.value.length;
  amountInput.classList.toggle("digits-long", length > 15 && length <= 20);
  amountInput.classList.toggle("digits-huge", length > 20);
}

function formatMoney(amount, currency) {
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.name,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.formatToParts(amount).map((part) => {
    if (part.type === "currency") {
      return currency.symbol;
    }

    return part.value;
  }).join("");
}

function formatDenomination(amount, currency) {
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.name,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.formatToParts(amount).map((part) => {
    if (part.type === "currency") {
      return currency.symbol;
    }

    return part.value;
  }).join("");
}

function formatCompactMoney(amount, currency) {
  const abs = Math.abs(amount);
  const suffixes = [
    { value: 1000000000000000, label: "Q" },
    { value: 1000000000000, label: "T" },
    { value: 1000000000, label: "B" },
    { value: 1000000, label: "M" },
    { value: 1000, label: "K" }
  ];
  const suffix = suffixes.find((item) => abs >= item.value);

  if (!suffix) {
    return formatDenomination(Math.max(1, Math.round(amount)), currency);
  }

  const compact = amount / suffix.value;
  const value = compact >= 100 ? compact.toFixed(0) : compact >= 10 ? compact.toFixed(1) : compact.toFixed(2);
  return `${currency.symbol}${value.replace(/\.0+$/, "")}${suffix.label}`;
}

function formatCompactCount(count) {
  if (count >= 1000000000000) return `${Math.floor(count / 1000000000000)}T`;
  if (count >= 1000000000) return `${Math.floor(count / 1000000000)}B`;
  if (count >= 1000000) return `${Math.floor(count / 1000000)}M`;
  if (count >= 1000) return `${Math.floor(count / 1000)}K`;
  return String(count);
}

function formatLedgerAmount(amount) {
  const currency = currencies[state.currency];
  return formatMoney(amount, currency).replace(currency.symbol, "").trim();
}

function formatOperator(operator) {
  return { "+": "+", "-": "-", "*": "x", "/": "/" }[operator] || operator;
}

function getDenominations(code) {
  if (code === "JPY") return [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];
  if (code === "GBP") return [50, 20, 10, 5, 2, 1];
  if (code === "EUR") return [500, 200, 100, 50, 20, 10, 5, 2, 1];
  return [100, 50, 20, 10, 5, 1];
}

function isCoinDenomination(code, denomination) {
  if (code === "JPY") return denomination < 1000;
  if (["EUR", "GBP", "CAD", "AUD"].includes(code)) return denomination <= 2;
  return false;
}

function getDenominationStyle(code, denomination) {
  if (code === "JPY") {
    if (denomination >= 10000) return "denom-note-top";
    if (denomination >= 5000) return "denom-note-high";
    if (denomination >= 1000) return "denom-note-base";
    if (denomination >= 500) return "denom-coin-large";
    if (denomination >= 100) return "denom-coin-medium";
    return "denom-coin-small";
  }

  if (isCoinDenomination(code, denomination)) {
    if (denomination >= 2) return "denom-coin-large";
    if (denomination >= 1) return "denom-coin-medium";
    return "denom-coin-small";
  }

  if (denomination >= 100) return "denom-note-top";
  if (denomination >= 50) return "denom-note-high";
  return "denom-note-base";
}

function getBillColorPair(code, denomination) {
  if (code === "JPY") {
    if (denomination >= 10000) return ["#fff0a8", "#f0b83f"];
    if (denomination >= 5000) return ["#d7c9ff", "#8d78df"];
    if (denomination >= 1000) return ["#b8f1ff", "#54bfdc"];
  }

  if (code === "EUR") {
    if (denomination >= 500) return ["#d7c9ff", "#9276ff"];
    if (denomination >= 200) return ["#fff0a8", "#f0b83f"];
    if (denomination >= 100) return ["#baff82", "#58d56f"];
    if (denomination >= 50) return ["#ffb798", "#ff765f"];
    return ["#a6f4ff", "#55c9ed"];
  }

  if (code === "GBP") {
    if (denomination >= 50) return ["#ffd6f0", "#d267c4"];
    if (denomination >= 20) return ["#d5c4ff", "#9276ff"];
    if (denomination >= 10) return ["#ffb798", "#ff765f"];
    return ["#a6f4ff", "#55c9ed"];
  }

  if (code === "CAD") {
    if (denomination >= 100) return ["#d5c4ff", "#9276ff"];
    if (denomination >= 50) return ["#ffb798", "#ff765f"];
    if (denomination >= 20) return ["#baff82", "#58d56f"];
    if (denomination >= 10) return ["#d7c9ff", "#9276ff"];
    return ["#a6f4ff", "#55c9ed"];
  }

  if (code === "AUD") {
    if (denomination >= 100) return ["#baff82", "#58d56f"];
    if (denomination >= 50) return ["#fff280", "#ffbd42"];
    if (denomination >= 20) return ["#ffb798", "#ff765f"];
    if (denomination >= 10) return ["#a6f4ff", "#55c9ed"];
    return ["#ffd6f0", "#ff8ed2"];
  }

  if (code === "USD") {
    if (denomination >= 100) return ["#baff82", "#58d56f"];
    if (denomination >= 50) return ["#d5c4ff", "#9276ff"];
    if (denomination >= 20) return ["#ffd6f0", "#ff8ed2"];
    return ["#a6f4ff", "#55c9ed"];
  }

  return null;
}

function getBundleSize(count) {
  if (count >= 1000000000) return 100000000;
  if (count >= 1000000) return 100000;
  if (count >= 100000) return 10000;
  if (count >= 10000) return 1000;
  if (count >= 1000) return 100;
  if (count >= 100) return 10;
  return 1;
}

function addReceiptLine(text) {
  if (!receiptTape) return;
  receiptLines = [`${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}  ${text}`, ...receiptLines].slice(0, 9);
  receiptTape.replaceChildren();
  receiptLines.slice().reverse().forEach((line) => {
    const item = document.createElement("span");
    item.textContent = line;
    receiptTape.append(item);
  });
}

function formatPlainAmount(amount) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function getFlavorText(amount, unit) {
  const exactMessages = {
    0: `Register cleared. Zero ${unit}; maximum tiny echo.`,
    100: `One hundred ${unit}. Snack-bar tycoon territory.`,
    1000: `One thousand ${unit}. The register has begun taking itself seriously.`,
    10000: `Ten thousand ${unit}. Several toy accountants just sharpened crayons.`,
    100000: `One hundred thousand ${unit}. The drawer is developing confidence.`,
    1000000: `One million ${unit}. Perfect default wealth: absurd, cheerful, and drawer-safe.`,
    1000000000: `One billion ${unit}. The register has started breathing through it.`,
    1000000000000: `One trillion ${unit}. This is no longer a register; it is a plastic treasury incident.`,
    1000000000000000: `One quadrillion ${unit}. The pretend economy has left the playroom.`
  };

  if (exactMessages[amount]) {
    return exactMessages[amount];
  }

  if (amount > 0 && amount % 1000000000000000 === 0) {
    return `A clean quadrillion multiple of ${unit}. The cash drawer has achieved myth status.`;
  }

  if (amount > 0 && amount % 1000000000000 === 0) {
    return `A round trillion moment in ${unit}. The register is pretending this is normal.`;
  }

  if (amount > 0 && amount % 1000000000 === 0) {
    return `A round billion ${unit}. Somewhere, a toy board game is filing paperwork.`;
  }

  if (amount > 0 && amount % 1000000 === 0) {
    return `A neat stack of millions of ${unit}. Very tidy. Deeply fake.`;
  }

  if (amount >= 1000000000000000) {
    return `Quadrillion-class ${unit}. The display is doing its little best.`;
  }

  if (amount >= 1000000000000) {
    return `Trillion territory in ${unit}. The money pile has become a civic landmark.`;
  }

  if (amount >= 1000000000) {
    return `Billionaire mode, denominated in ${unit}. The drawer is smiling, but with effort.`;
  }

  if (amount >= 1000000) {
    return `Millionaire mode in ${unit}. The register looks extremely pleased with itself.`;
  }

  if (amount > 0 && amount < 1) {
    return `A microscopic puff of ${unit}. The register is trying very hard to respect the penny.`;
  }

  if (amount > 0) {
    return `A respectable pile of ${unit}. Small bills, big feelings.`;
  }

  return exactMessages[0];
}

function getBuyExamples(amount, currency) {
  if (amount <= 0) {
    return `With that much money, you can buy zero cappuccinos, zero cinema tickets, or one very serious pause in ${currency.country}.`;
  }

  const examples = getExampleSet(amount, currency).map((example) => formatPurchasableExample(amount, example));
  const hasTinyFraction = examples.some((example) => example.startsWith("less than"));

  if (hasTinyFraction) {
    return `With that much money, you can cover ${formatExampleList(examples)} in ${currency.country}.`;
  }

  return `With that much money, you can buy about ${formatExampleList(examples)} in ${currency.country}.`;
}

function getWealthCountLine(amount, currency) {
  const amountText = formatMoney(amount, currency);
  const year = new Date().getFullYear();
  const count = getEstimatedWealthCount(amount * currency.usdRate);

  if (count === 0) {
    return `Worldwide estimate: 0 people have roughly ${amountText} or more in net wealth in ${year}.`;
  }

  return `Worldwide estimate: about ${formatCount(count)} people have roughly ${amountText} or more in net wealth in ${year}.`;
}

function getEstimatedWealthCount(usdAmount) {
  if (usdAmount >= 1000000000000) return 0;
  if (usdAmount >= 1000000000) return 3428;
  if (usdAmount >= 30000000) return interpolateWealthCount(usdAmount, 30000000, 713626, 1000000000, 3428);
  if (usdAmount >= 1000000) return interpolateWealthCount(usdAmount, 1000000, 60000000, 30000000, 713626);
  if (usdAmount >= 100000) return interpolateWealthCount(usdAmount, 100000, 688000000, 1000000, 60000000);
  if (usdAmount >= 10000) return interpolateWealthCount(usdAmount, 10000, 2250000000, 100000, 688000000);
  if (usdAmount > 0) return interpolateWealthCount(Math.max(usdAmount, 1), 1, 3800000000, 10000, 2250000000);
  return 0;
}

function interpolateWealthCount(amount, lowAmount, lowCount, highAmount, highCount) {
  const ratio = (Math.log10(amount) - Math.log10(lowAmount)) / (Math.log10(highAmount) - Math.log10(lowAmount));
  return Math.max(0, Math.round(lowCount + (highCount - lowCount) * clamp(ratio, 0, 1)));
}

function getExampleSet(amount, currency) {
  const setName = getExampleSetName(amount);
  return currency.exampleSets[setName] || currency.examples;
}

function getExampleSetName(amount) {
  if (amount < 1) return "tiny";
  if (amount < 1000) return "hundred";
  if (amount < 10000) return "thousand";
  if (amount < 100000) return "tenThousand";
  if (amount < 1000000) return "hundredThousand";
  if (amount < 1000000000) return "million";
  if (amount < 1000000000000) return "billion";
  if (amount < 1000000000000000) return "trillion";
  return "quadrillion";
}

function formatPurchasableExample(amount, example) {
  const count = Math.floor(amount / example.price);

  if (count < 1) {
    const percent = Math.floor((amount / example.price) * 100);
    return `${percent < 1 ? "less than 1" : percent}% of one ${example.singular}`;
  }

  const noun = count === 1 ? example.singular : example.plural;
  return `${formatCount(count)} ${noun}`;
}

function formatCount(count) {
  if (count >= 1000000000000) {
    return count.toLocaleString("en-US");
  }

  return count.toLocaleString("en-US");
}

function formatExampleList(examples) {
  if (examples.length <= 1) {
    return examples[0] || "nothing";
  }

  if (examples.length === 2) {
    return `${examples[0]} or ${examples[1]}`;
  }

  return `${examples.slice(0, -1).join(", ")}, or ${examples[examples.length - 1]}`;
}

function sparkle() {
  if (state.reducedMotion) {
    return;
  }

  for (let i = 0; i < 14; i += 1) {
    const sparkleEl = document.createElement("span");
    sparkleEl.className = "sparkle";
    sparkleEl.style.left = `${8 + Math.random() * 84}%`;
    sparkleEl.style.bottom = `${40 + Math.random() * 180}px`;
    sparkleEl.style.animationDelay = `${i * 32}ms`;
    moneyScene.append(sparkleEl);
    window.setTimeout(() => sparkleEl.remove(), 900);
  }
}

function playCurrencySwap(previousCurrencyCode, nextCurrencyCode) {
  if (state.reducedMotion) {
    return;
  }

  const previousCurrency = currencies[previousCurrencyCode];
  const nextCurrency = currencies[nextCurrencyCode];
  register.classList.remove("currency-swap");
  void register.offsetWidth;
  register.classList.add("currency-swap");
  sparkle();
  renderCurrencyTokens(previousCurrency, nextCurrency);
  window.setTimeout(() => register.classList.remove("currency-swap"), 920);
}

function renderCurrencyTokens(previousCurrency, nextCurrency) {
  const symbols = [
    previousCurrency?.symbol || "",
    nextCurrency.symbol,
    nextCurrency.symbol,
    nextCurrency.symbol,
    previousCurrency?.symbol || "",
    nextCurrency.symbol,
    nextCurrency.symbol,
    nextCurrency.symbol
  ].filter(Boolean);

  symbols.forEach((symbol, index) => {
    const token = document.createElement("span");
    token.className = "currency-token";
    token.textContent = symbol;
    token.style.left = `${16 + (index * 11) % 68}%`;
    token.style.bottom = `${70 + (index % 4) * 42}px`;
    token.style.setProperty("--token-x", `${index % 2 ? 120 : -120}px`);
    token.style.setProperty("--token-rot", `${-36 + index * 13}deg`);
    token.style.animationDelay = `${index * 42}ms`;
    wealthEffects.append(token);
    window.setTimeout(() => token.remove(), 1100);
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.version !== STORAGE_VERSION) {
      return {
        amount: DEFAULT_AMOUNT,
        currency: currencies[saved.currency] ? saved.currency : "USD",
        reducedMotion: Boolean(saved.reducedMotion),
        version: STORAGE_VERSION
      };
    }

    const savedAmount = Number(saved.amount);
    return {
      amount: clamp(Number.isFinite(savedAmount) ? savedAmount : DEFAULT_AMOUNT, 0, MAX_AMOUNT),
      currency: currencies[saved.currency] ? saved.currency : "USD",
      reducedMotion: Boolean(saved.reducedMotion),
      version: STORAGE_VERSION
    };
  } catch {
    return { amount: DEFAULT_AMOUNT, currency: "USD", reducedMotion: false, version: STORAGE_VERSION };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
}

function applyMotionPreference() {
  document.body.classList.toggle("reduced-motion", Boolean(state.reducedMotion));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatInputAmount(amount) {
  return amount.toLocaleString(currencies[state.currency].locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatCalculatorInput(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

function parseAmountInput(value) {
  if (typeof value === "number") {
    return value;
  }

  const currency = currencies[state.currency];
  let normalized = String(value)
    .replace(currency.symbol, "")
    .replace(/[^\d.,\-]/g, "");

  const decimalSeparator = getDecimalSeparator(currency.locale);
  if (decimalSeparator === ",") {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }

  return Number(normalized);
}

function getDecimalSeparator(locale) {
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).formatToParts(1.1);

  return parts.find((part) => part.type === "decimal")?.value || ".";
}
