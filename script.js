const JPY_VALUES = {
  base: 3000,
  bonus_50k: 5000,
  bonus_100k: 10000,
  bonus_1m: 50000,
};

function copyBonusText() {
  const copyText = document.getElementById("copyTarget").textContent;

  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      const copyBtn = document.getElementById("copyBtn");
      copyBtn.textContent = "📋 コピーしました";
      setTimeout(() => {
        copyBtn.textContent = "📋 コピーする";
      }, 2500);
    })
    .catch(() => {
      const copyBtn = document.getElementById("copyBtn");
      copyBtn.textContent = "📋 コピー失敗";
      setTimeout(() => {
        copyBtn.textContent = "📋 コピーする";
      }, 2500);
    });
}

const currencyNames = {
  USD: "USD（米ドル）",
  EUR: "EUR（ユーロ）",
  GBP: "GBP（英ポンド）",
  AUD: "AUD（豪ドル）",
  CAD: "CAD（カナダドル）",
  HKD: "HKD（香港ドル）",
  CNY: "CNY（中国元）",
  KRW: "KRW（韓国ウォン）",
  ZAR: "ZAR（南アフリカランド）",
  IDR: "IDR（インドネシアルピア）",
  MYR: "MYR（マレーシアリンギット）",
  THB: "THB（タイバーツ）",
  PHP: "PHP（フィリピンペソ）",
  VND: "VND（ベトナムドン）",
  SGD: "SGD（シンガポールドル）",
  INR: "INR（インドルピー）",
  BRL: "BRL（ブラジルレアル）",
  MXN: "MXN（メキシコペソ）",
  COP: "COP（コロンビアペソ）",
  CLP: "CLP（チリペソ）",
  ARS: "ARS（アルゼンチンペソ）",
  PEN: "PEN（ペルーソル）",
  UYU: "UYU（ウルグアイペソ）",
};

const noDecimalCurrencies = ["IDR", "VND", "KRW", "CLP", "COP", "ARS"];
const currencyList = Object.keys(currencyNames);

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("currency");
  currencyList.forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = currencyNames[code];
    select.appendChild(option);
  });
});

async function generate() {
  const currency = document.getElementById("currency").value;
  const rateInfo = document.getElementById("rateInfo");
  const copyWrapper = document.getElementById("copyWrapper");
  const rateOutput = document.getElementById("rateOutput");
  const copyTarget = document.getElementById("copyTarget");

  if (!currency) {
    rateOutput.textContent = "通貨を選択してください";
    rateOutput.className = "error";
    rateInfo.classList.remove("hidden");
    copyWrapper.classList.add("hidden");
    return;
  }

  rateOutput.textContent = "為替レートを取得中...";
  rateOutput.className = "loading";
  rateInfo.classList.remove("hidden");
  copyWrapper.classList.add("hidden");

  try {
    let rate;

    // 複数のAPIを試す
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/JPY`);
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates[currency]) {
          rate = data.rates[currency];
        }
      }
    } catch (e) {
      console.log("First API failed:", e);
    }

    if (!rate) {
      try {
        const res = await fetch(
          `https://api.exchangerate.host/latest?base=JPY&symbols=${currency}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.rates && data.rates[currency]) {
            rate = data.rates[currency];
          }
        }
      } catch (e) {
        console.log("Second API failed:", e);
      }
    }

    if (!rate) {
      // フォールバック：参考レート（2024年参考値）
      const fallbackRates = {
        USD: 0.0067,
        EUR: 0.0061,
        GBP: 0.0053,
        AUD: 0.0099,
        CAD: 0.009,
        HKD: 0.0525,
        CNY: 0.0478,
        KRW: 8.9,
        ZAR: 0.125,
        IDR: 103,
        MYR: 0.0314,
        THB: 0.234,
        PHP: 0.375,
        VND: 164,
        SGD: 0.009,
        INR: 0.559,
        BRL: 0.033,
        MXN: 0.115,
        COP: 26.4,
        CLP: 6.1,
        ARS: 5.7,
        PEN: 0.0251,
        UYU: 0.264,
      };

      if (fallbackRates[currency]) {
        rate = fallbackRates[currency];
      } else {
        throw new Error("為替レートが取得できませんでした");
      }
    }

    const today = new Date().toISOString().split("T")[0].replace(/-/g, "/");
    const rateSource = "（リアルタイム取得 or 参考値）";

    const format = (value) => {
      const raw = value * rate;
      return noDecimalCurrencies.includes(currency)
        ? Math.round(raw).toLocaleString()
        : raw.toFixed(2);
    };

    // 為替レート情報
    const rateText = `為替レート：1円 = ${rate.toFixed(
      6
    )} ${currency} ${rateSource}
取得日時：${today}`;

    // コピー対象文面
    const copyText = `${currency}向け希望単価ライン
↓
Base Fee
・${format(JPY_VALUES.base)} ${currency} per video

Performance Bonus (based on views)
・50,000 views → +${format(JPY_VALUES.bonus_50k)} ${currency}
・100,000 views → +${format(JPY_VALUES.bonus_100k)} ${currency}
・1,000,000 views → +${format(JPY_VALUES.bonus_1m)} ${currency}`;

    rateOutput.textContent = rateText;
    rateOutput.className = "";

    copyTarget.textContent = copyText;
    copyTarget.className = "";

    rateInfo.classList.remove("hidden");
    copyWrapper.classList.remove("hidden");
  } catch (e) {
    rateOutput.textContent = "エラーが発生しました：" + e.message;
    rateOutput.className = "error";
    rateInfo.classList.remove("hidden");
    copyWrapper.classList.add("hidden");
  }
}
