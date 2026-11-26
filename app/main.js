import { store } from './store.js';
import { render } from './views.js';
import { CATEGORIES } from './data.js';

const app = document.getElementById('app');
let pendingOpenForm = null;

function navigate(hash) {
  const normalized = hash.startsWith('#') ? hash : `#${hash}`;
  location.hash = normalized;
}

function renderUI() {
  window.__shotReady = false;
  // Blurring first: replacing innerHTML while the focused node is mid-event throws.
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const html = render(store);
  app.innerHTML = html;
  applyTxFilters();
  window.__shotReady = true;
  window.scrollTo(0, 0);
  if (pendingOpenForm === 'transaction') {
    pendingOpenForm = null;
    openAddTransactionForm();
  }
}

window.addEventListener('hashchange', () => {
  renderUI();
});

document.addEventListener('DOMContentLoaded', () => {
  renderUI();

  // Wire nav links
  document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = link.getAttribute('href');
      navigate(hash);
    });
  });

  // Handle form submissions for add/edit transactions
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'transactionForm') {
      e.preventDefault();
      const id = document.getElementById('txId').value;
      const transaction = {
        id: id || Date.now().toString(),
        date: document.getElementById('txDate').value,
        description: document.getElementById('txDescription').value,
        category: document.getElementById('txCategory').value,
        account: document.getElementById('txAccount').value,
        amount: parseFloat(document.getElementById('txAmount').value),
        type: document.getElementById('txType').value,
      };
      if (id) {
        store.editTransaction(id, transaction);
      } else {
        store.addTransaction(transaction);
      }
      closeAddTransactionForm();
      renderUI();
    }
    if (e.target.id === 'billForm') {
      e.preventDefault();
      const bill = {
        id: Date.now().toString(),
        name: document.getElementById('billName').value,
        amount: parseFloat(document.getElementById('billAmount').value),
        due: document.getElementById('billDue').value,
        paid: false,
        category: document.getElementById('billCategory').value,
      };
      store.addBill(bill);
      closeAddBillForm();
      renderUI();
    }
    if (e.target.id === 'goalForm') {
      e.preventDefault();
      const goal = {
        id: Date.now().toString(),
        name: document.getElementById('goalName').value,
        target: parseFloat(document.getElementById('goalTarget').value),
        saved: 0,
        category: 'general',
      };
      store.addGoal(goal);
      closeAddGoalForm();
      renderUI();
    }
  });

  // Live transaction filtering (search + category + type) without a full re-render.
  document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') applyTxFilters();
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'filterCategory' || e.target.id === 'filterType') applyTxFilters();
  });
});

// Filter the transactions table in place and update the visible totals.
function applyTxFilters() {
  const searchEl = document.getElementById('searchInput');
  if (!searchEl) return;
  const q = searchEl.value.trim().toLowerCase();
  const cat = document.getElementById('filterCategory').value;
  const type = document.getElementById('filterType').value;
  let inc = 0;
  let exp = 0;
  document.querySelectorAll('tbody tr[data-desc]').forEach((row) => {
    const ok =
      (!q || row.dataset.desc.includes(q)) &&
      (!cat || row.dataset.cat === cat) &&
      (!type || row.dataset.type === type);
    row.style.display = ok ? '' : 'none';
    if (ok) {
      const amt = parseFloat(row.dataset.amount) || 0;
      if (row.dataset.type === 'income') inc += amt;
      else exp += amt;
    }
  });
  const incEl = document.getElementById('txIncomeTotal');
  const expEl = document.getElementById('txExpenseTotal');
  if (incEl) incEl.textContent = 'Income: ' + fmtAmount(inc);
  if (expEl) expEl.textContent = 'Expense: ' + fmtAmount(exp);
}

function fmtAmount(n) {
  const sym = { USD: '$', EUR: '€', GBP: '£' }[store.getState().selectedCurrency] || '$';
  return sym + Number(n).toFixed(2);
}

function dateInputValue(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

function goAddTransaction() {
  if (!window.location.hash.includes('transactions')) {
    pendingOpenForm = 'transaction';
    navigate('#/transactions');
  } else {
    openAddTransactionForm();
  }
}

function openAddTransactionForm(transactionId) {
  const form = document.querySelector('.add-transaction-form');
  if (!form) return;

  if (transactionId) {
    const tx = store.getState().transactions.find((t) => t.id === transactionId);
    if (!tx) return;
    document.getElementById('txId').value = tx.id;
    document.getElementById('txDate').value = dateInputValue(tx.date);
    document.getElementById('txDescription').value = tx.description;
    document.getElementById('txCategory').value = tx.category;
    document.getElementById('txAccount').value = tx.account;
    document.getElementById('txAmount').value = Math.abs(tx.amount);
    document.getElementById('txType').value = tx.type;
    form.style.display = 'block';
  } else {
    form.style.display = 'block';
    document.getElementById('txType').value = 'expense';
  }
  document.getElementById('txDescription').focus();
}

function closeAddTransactionForm() {
  const form = document.querySelector('.add-transaction-form');
  if (form) form.style.display = 'none';
}

function closeAddBillForm() {
  const form = document.querySelector('.add-bill-form');
  if (form) form.style.display = 'none';
}

function showAddBillForm() {
  const form = document.querySelector('.add-bill-form');
  if (form) form.style.display = 'block';
}

function closeAddGoalForm() {
  const form = document.querySelector('.add-goal-form');
  if (form) form.style.display = 'none';
}

function showAddGoalForm() {
  const form = document.querySelector('.add-goal-form');
  if (form) form.style.display = 'block';
}

function openEditTransaction(id) {
  const form = document.querySelector('.add-transaction-form');
  if (!form) return;
  const tx = store.getState().transactions.find((t) => t.id === id);
  if (!tx) return;
  openAddTransactionForm(id);
  // The form will be populated with the existing data
}

function removeTransactionConfirm(id) {
  if (confirm('Delete this transaction?')) {
    store.removeTransaction(id);
    renderUI();
  }
}

function toggleBillPaid(id) {
  store.toggleBillPaid(id);
  renderUI();
}

function removeBillConfirm(id) {
  if (confirm('Delete this bill?')) {
    store.removeBill(id);
    renderUI();
  }
}

function addFundsGoal(id, amount) {
  store.addFundsGoal(id, amount);
  renderUI();
}

function removeGoalConfirm(id) {
  if (confirm('Delete this goal?')) {
    store.removeGoal(id);
    renderUI();
  }
}

function editBudgetInline(input, categoryId) {
  const amount = parseFloat(input.value);
  if (!isNaN(amount)) {
    store.editBudget(categoryId, amount);
    renderUI();
  }
}

function setCurrency(currency) {
  store.setSelectedCurrency(currency);
  renderUI();
}

function addCategory() {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) return;

  const exists = CATEGORIES.some((c) => c.name.toLowerCase() === name.toLowerCase());
  if (exists) return;

  const newCategory = {
    id: `cat-${Date.now()}`,
    name,
    budget: 0,
    color: '#6b7280',
  };
  CATEGORIES.push(newCategory);
  store.editBudget(newCategory.id, 0);
  renderUI();
}

function resetDemoData() {
  if (confirm('Reset all data to seed data?')) {
    store.resetToSeed();
    renderUI();
  }
}

function exportData() {
  const data = store.getState();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hearth-budget-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearAllData() {
  if (confirm('Clear ALL user data? This cannot be undone.')) {
    localStorage.removeItem('hearth-budget-v1');
    renderUI();
  }
}

// The views use inline onclick/onchange attributes; expose the handlers globally.
Object.assign(window, {
  goAddTransaction,
  openAddTransactionForm,
  closeAddTransactionForm,
  closeAddBillForm,
  showAddBillForm,
  closeAddGoalForm,
  showAddGoalForm,
  openEditTransaction,
  removeTransactionConfirm,
  toggleBillPaid,
  removeBillConfirm,
  addFundsGoal,
  removeGoalConfirm,
  editBudgetInline,
  setCurrency,
  addCategory,
  resetDemoData,
  exportData,
  clearAllData,
});