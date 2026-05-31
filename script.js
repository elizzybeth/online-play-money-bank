const STORAGE_KEY = "online-play-money-bank-state";
const STORAGE_VERSION = 2;
const DEFAULT_AMOUNT = 1000000;
const MAX_AMOUNT = 1000000000000000;

const currencies = {
  USD: {
    symbol: "$",
    name: "USD",
    locale: "en-US",
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
const moneyScene = document.querySelector("#money-scene");
const wealthEffects = document.querySelector("#wealth-effects");
const register = document.querySelector("#register");
const clearButton = document.querySelector("#clear-register");
const presetButtons = document.querySelectorAll("[data-amount]");
const wealthCaption = document.querySelector("#wealth-caption");

let state = loadState();
let previousAmount = state.amount;
let lastDirection = "in";

initialize();

function initialize() {
  amountInput.value = formatInputAmount(state.amount);
  currencySelect.value = state.currency;
  render("in");

  amountInput.addEventListener("input", () => {
    setAmount(amountInput.value, false);
  });

  amountInput.addEventListener("blur", () => {
    amountInput.value = formatInputAmount(state.amount);
  });

  currencySelect.addEventListener("change", () => {
    state.currency = currencySelect.value;
    saveState();
    render("currency");
    sparkle();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAmount(button.dataset.amount);
      amountInput.focus();
    });
  });

  clearButton.addEventListener("click", () => {
    setAmount(0);
    amountInput.focus();
  });
}

function setAmount(rawValue, syncInput = true) {
  const numeric = Number(rawValue);
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

function render(direction) {
  const currency = currencies[state.currency];
  display.textContent = formatMoney(state.amount, currency);
  display.style.fontSize = getDisplaySize(state.amount);
  amountSymbol.textContent = currency.symbol;
  wealthFlavor.textContent = getFlavorText(state.amount, currency.unit);
  buyExamples.textContent = getBuyExamples(state.amount, currency);

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

  renderMoney(state.amount, currency.symbol, direction);
  renderWealthEffects(state.amount);

  if (direction !== "currency" && state.amount !== previousAmount) {
    register.classList.add("jiggle");
    window.setTimeout(() => register.classList.remove("jiggle"), 480);
  }
}

function renderMoney(amount, symbol, direction) {
  moneyScene.replaceChildren();

  if (amount <= 0) {
    if (direction === "out") {
      renderFlyingGhosts(symbol);
    }
    return;
  }

  const pieces = createPieces(amount);
  pieces.forEach((piece, index) => {
    const element = document.createElement("span");
    element.className = piece.type;
    if (direction === "in") {
      element.classList.add("fly-in");
    }
    element.style.left = `${piece.x}%`;
    element.style.bottom = `${piece.y}px`;
    element.style.zIndex = String(piece.z);
    element.style.setProperty("--rot", `${piece.rot}deg`);
    element.style.setProperty("--from-rot", `${piece.rot + (index % 2 ? 38 : -38)}deg`);
    element.style.setProperty("--from-x", `${index % 2 ? 180 : -180}px`);
    element.style.animationDelay = `${Math.min(index * 24, 260)}ms`;

    if (piece.overflow) {
      element.classList.add("overflow-top");
    }

    if (piece.type === "bill") {
      const colorPair = billColors[index % billColors.length];
      element.style.setProperty("--bill-a", colorPair[0]);
      element.style.setProperty("--bill-b", colorPair[1]);
      element.textContent = symbol;
      element.setAttribute("aria-hidden", "true");
    }

    if (piece.type === "brick") {
      element.dataset.symbol = symbol;
    }

    if (piece.type === "coin") {
      element.textContent = symbol;
    }

    moneyScene.append(element);
  });

  if (direction === "out") {
    renderFlyingGhosts(symbol);
  }
}

function renderFlyingGhosts(symbol) {
  for (let i = 0; i < 8; i += 1) {
    const ghost = document.createElement("span");
    ghost.className = "bill fly-out";
    const colorPair = billColors[i % billColors.length];
    ghost.style.setProperty("--bill-a", colorPair[0]);
    ghost.style.setProperty("--bill-b", colorPair[1]);
    ghost.style.setProperty("--rot", `${-20 + i * 6}deg`);
    ghost.style.setProperty("--from-rot", `${20 + i * 9}deg`);
    ghost.style.setProperty("--from-x", `${i % 2 ? 210 : -210}px`);
    ghost.style.left = `${10 + i * 10}%`;
    ghost.style.bottom = `${24 + (i % 3) * 24}px`;
    ghost.style.zIndex = String(140 + i);
    ghost.style.animationDelay = `${i * 35}ms`;
    ghost.textContent = symbol;
    moneyScene.append(ghost);
    window.setTimeout(() => ghost.remove(), 780);
  }
}

function createPieces(amount) {
  const wealthState = getWealthState(amount);
  const counts = {
    small: {
      bills: amount < 1 ? 0 : Math.max(1, Math.min(9, Math.ceil(amount / 14))),
      coins: amount < 1 ? 1 : amount < 50 ? 4 : 1,
      bricks: 0
    },
    medium: { bills: 16, coins: 0, bricks: 0 },
    large: { bills: 26, coins: 0, bricks: 3 },
    huge: { bills: 30, coins: 0, bricks: 10 },
    ridiculous: { bills: 36, coins: 0, bricks: 18 }
  }[wealthState] || { bills: 0, coins: 0, bricks: 0 };

  const pieces = [];

  for (let i = 0; i < counts.bricks; i += 1) {
    pieces.push({
      type: "brick",
      x: 2 + ((i * 16) % 74),
      y: 4 + Math.floor(i / 5) * 10 + (i % 2) * 4,
      rot: -8 + (i % 5) * 4,
      z: i + 20,
      overflow: wealthState === "ridiculous" && i > 15
    });
  }

  for (let i = 0; i < counts.bills; i += 1) {
    const row = Math.floor(i / 8);
    pieces.push({
      type: "bill",
      x: 2 + ((i * 11) % 76),
      y: 3 + row * 6 + ((i % 3) * 3),
      rot: -24 + ((i * 11) % 48),
      z: i + 60,
      overflow: wealthState === "huge" && i > 27 || wealthState === "ridiculous" && i > 31
    });
  }

  for (let i = 0; i < counts.coins; i += 1) {
    pieces.push({
      type: "coin",
      x: 18 + i * 14,
      y: 10 + (i % 2) * 18,
      rot: 0,
      z: i + 80,
      overflow: false
    });
  }

  return pieces;
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

function renderWealthEffects(amount) {
  wealthEffects.replaceChildren();

  if (amount < 1000000000) {
    return;
  }

  const intensity = amount >= 1000000000000000 ? "quadrillion" : amount >= 1000000000000 ? "trillion" : "billion";
  const counts = {
    billion: { confetti: 12, champagne: 0, bottles: 0, fallingYachts: 0, pilingYachts: 0 },
    trillion: { confetti: 24, champagne: 4, bottles: 2, fallingYachts: 0, pilingYachts: 45 },
    quadrillion: { confetti: 58, champagne: 10, bottles: 6, fallingYachts: 0, pilingYachts: 168 }
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
    const row = Math.floor(i / 14);
    yacht.style.left = `${-7 + Math.random() * 112}%`;
    yacht.style.bottom = `${6 + row * 29 + Math.random() * 18}px`;
    yacht.style.zIndex = String(30 + row);
    yacht.style.setProperty("--pile-rot", `${-26 + Math.random() * 52}deg`);
    yacht.style.setProperty("--pile-flip", i % 2 ? -1 : 1);
    yacht.style.setProperty("--pile-delay", `${i * 0.12 + Math.random() * 0.32}s`);
    yacht.style.setProperty("--pile-start-x", `${-36 + Math.random() * 72}px`);
    yacht.style.setProperty("--pile-start-y", `${-760 - Math.random() * 420}px`);
    yacht.style.setProperty("--pile-spin", `${-140 + Math.random() * 280}deg`);
    wealthEffects.append(yacht);
  }
}

function createYacht(className) {
  const yacht = document.createElement("span");
  yacht.className = className;
  yacht.innerHTML = `
    <span class="yacht-mast"></span>
    <span class="yacht-sail yacht-sail-main"></span>
    <span class="yacht-sail yacht-sail-front"></span>
    <span class="yacht-cabin"><i></i><i></i><i></i></span>
    <span class="yacht-hull"></span>
    <span class="yacht-wake"></span>
  `;
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

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.version !== STORAGE_VERSION) {
      return {
        amount: DEFAULT_AMOUNT,
        currency: currencies[saved.currency] ? saved.currency : "USD",
        version: STORAGE_VERSION
      };
    }

    const savedAmount = Number(saved.amount);
    return {
      amount: clamp(Number.isFinite(savedAmount) ? savedAmount : DEFAULT_AMOUNT, 0, MAX_AMOUNT),
      currency: currencies[saved.currency] ? saved.currency : "USD",
      version: STORAGE_VERSION
    };
  } catch {
    return { amount: DEFAULT_AMOUNT, currency: "USD", version: STORAGE_VERSION };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatInputAmount(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}
