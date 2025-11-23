const LS_KEY = "tm_expenses_v3";
const PKR_TO_USD = 0.0036;
const PKR_TO_EUR = 0.0033;

const form = document.getElementById("expense-form");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const dateInp = document.getElementById("date");
const category = document.getElementById("category");
const note = document.getElementById("note");
const imageInput = document.getElementById("image");
const listEl = document.getElementById("list");
const totalEl = document.getElementById("total");
const convertedEl = document.getElementById("converted");
const previewContainer = document.getElementById("preview-container");
const preview = document.getElementById("preview");
let expenses = [];

function load() {
  try {
    expenses = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    expenses = [];
  }
  render();
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(expenses));
  render();
}

function currency(n) {
  return "PKR " + Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function render() {
  listEl.innerHTML = "";
  if (expenses.length === 0) {
    listEl.innerHTML = '<div class="empty">No expenses yet.</div>';
  }

  expenses
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((e) => {
      const div = document.createElement("div");
      div.className = "expense";
      div.innerHTML = `
        <strong>${e.desc}</strong> - <span>${currency(e.amount)}</span>
        <p>${e.category} · ${formatDate(e.date)}</p>
        ${e.note ? `<p>📝 ${e.note}</p>` : ""}
        ${e.image ? `<img src="${e.image}" alt="expense image"/>` : ""}
      `;
      listEl.appendChild(div);
    });

  const total = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  totalEl.textContent = currency(total);
  convertedEl.textContent = `≈ USD ${(total * PKR_TO_USD).toFixed(2)} | EUR ${(total * PKR_TO_EUR).toFixed(2)}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = desc.value.trim();
  const a = parseFloat(amount.value || 0);
  const c = category.value;
  const dat = dateInp.value || new Date().toISOString().slice(0, 10);
  const n = note.value.trim();
  const img = preview.src || "";

  if (!d || !a) {
    alert("Please enter description and amount.");
    return;
  }

  const obj = { id: Date.now(), desc: d, amount: a, category: c, date: dat, note: n, image: img };
  expenses.push(obj);
  form.reset();
  previewContainer.style.display = "none";
  save();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  form.reset();
  previewContainer.style.display = "none";
});

document.getElementById("clear-all").addEventListener("click", () => {
  if (confirm("Clear all expenses?")) {
    expenses = [];
    save();
  }
});

amount.addEventListener("input", () => {
  const a = parseFloat(amount.value || 0);
  convertedEl.textContent = a
    ? `≈ USD ${(a * PKR_TO_USD).toFixed(2)} | EUR ${(a * PKR_TO_EUR).toFixed(2)}`
    : "";
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    previewContainer.style.display = "block";
  };
  reader.readAsDataURL(file);
});

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

load();
