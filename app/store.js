import { CATEGORIES, ACCOUNTS, INCOME_BREAKDOWN, transactions as initialTransactions, bills as initialBills, goals as initialGoals } from './data.js';

const STORAGE_KEY = 'hearth-budget-v1';

function freshSeedState() {
  return {
    accounts: ACCOUNTS.map((a) => ({ ...a, transactions: [] })),
    transactions: initialTransactions.map((t) => ({ ...t, date: new Date(t.date) })),
    bills: initialBills.map((b) => ({ ...b, due: new Date(b.due) })),
    goals: initialGoals.map((g) => ({ ...g, created: new Date('2026-11-01') })),
    budgets: new Map(CATEGORIES.map((c) => [c.id, c.budget])),
    selectedCurrency: 'USD',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  };
}

const DEFAULT_STATE = freshSeedState();

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...freshSeedState(),
        accounts: parsed.accounts.map((a) => ({
          ...a,
          balance: a.balance,
          transactions: a.transactions ? a.transactions.map((t) => ({ ...t, date: new Date(t.date) })) : [],
        })),
        transactions: parsed.transactions.map((t) => ({ ...t, date: new Date(t.date) })),
        bills: parsed.bills.map((b) => ({ ...b, due: new Date(b.due) })),
        goals: parsed.goals.map((g) => ({ ...g, created: g.created ? new Date(g.created) : new Date('2026-11-01') })),
        budgets: new Map(parsed.budgets || CATEGORIES.map((c) => [c.id, c.budget])),
        selectedCurrency: parsed.selectedCurrency || 'USD',
        currentMonth: parsed.currentMonth ?? new Date().getMonth(),
        currentYear: parsed.currentYear ?? new Date().getFullYear(),
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  return freshSeedState();
}

export const store = (() => {
  const state = loadFromStorage();

  function save() {
    const serializable = {
      ...state,
      accounts: state.accounts.map((a) => ({
        ...a,
        balance: a.balance,
        transactions: a.transactions.map((t) => ({
          id: t.id,
          date: t.date.toISOString().split('T')[0],
          description: t.description,
          category: t.category,
          account: t.account,
          amount: t.amount,
          type: t.type,
        })),
      })),
      transactions: state.transactions.map((t) => ({
        id: t.id,
        date: t.date.toISOString().split('T')[0],
        description: t.description,
        category: t.category,
        account: t.account,
        amount: t.amount,
        type: t.type,
      })),
      bills: state.bills.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        due: b.due.toISOString().split('T')[0],
        paid: b.paid,
        category: b.category,
      })),
      goals: state.goals.map((g) => ({
        id: g.id,
        name: g.name,
        target: g.target,
        saved: g.saved,
        category: g.category,
        created: (g.created ? new Date(g.created) : new Date('2026-11-01')).toISOString().split('T')[0],
      })),
      budgets: [...state.budgets],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  function toDate(v) {
    return v instanceof Date ? v : new Date(v);
  }

  function getState() {
    return state;
  }

  function resetToSeed() {
    const fresh = freshSeedState();
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh);
    save();
  }

  function setState(newState) {
    Object.assign(state, newState);
    save();
  }

  function addTransaction(transaction) {
    const tx = { ...transaction, date: toDate(transaction.date) };
    state.transactions.push(tx);
    // Also add to the account's transaction list
    const account = state.accounts.find((a) => a.id === tx.account);
    if (account) {
      account.transactions.push(tx);
    }
    save();
  }

  function editTransaction(id, updated) {
    const idx = state.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const old = state.transactions[idx];
    const account = state.accounts.find((a) => a.id === old.account);
    const newAccount = updated.account || old.account;

    // Remove from old account's transactions if account changed
    if (newAccount !== old.account && account) {
      account.transactions = account.transactions.filter((t) => t.id !== id);
    }

    state.transactions[idx] = { ...old, ...updated, date: toDate(updated.date ?? old.date) };
    // Add to new account's transactions
    const newAcc = state.accounts.find((a) => a.id === newAccount);
    if (newAcc && !newAcc.transactions.some((t) => t.id === id)) {
      newAcc.transactions.push(state.transactions[idx]);
    }

    if (account && newAccount !== old.account) {
      account.transactions = account.transactions.filter((t) => t.id !== id);
    }

    save();
    return true;
  }

  function removeTransaction(id) {
    const idx = state.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const removed = state.transactions.splice(idx, 1)[0];
    const account = state.accounts.find((a) => a.id === removed.account);
    if (account) {
      account.transactions = account.transactions.filter((t) => t.id !== id);
    }
    save();
    return true;
  }

  function addBill(bill) {
    state.bills.push({ ...bill, due: toDate(bill.due) });
    save();
  }

  function removeBill(id) {
    const idx = state.bills.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    state.bills.splice(idx, 1);
    save();
    return true;
  }

  function toggleBillPaid(id) {
    const idx = state.bills.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    state.bills[idx].paid = !state.bills[idx].paid;
    save();
    return true;
  }

  function addGoal(goal) {
    state.goals.push(goal);
    save();
  }

  function removeGoal(id) {
    const idx = state.goals.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    state.goals.splice(idx, 1);
    save();
    return true;
  }

  function addFundsGoal(id, amount) {
    const idx = state.goals.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    state.goals[idx].saved = Math.min(state.goals[idx].target, state.goals[idx].saved + amount);
    // Also add to the relevant account
    save();
    return true;
  }

  function editBudget(categoryId, amount) {
    state.budgets.set(categoryId, amount);
    save();
  }

  function setSelectedCurrency(currency) {
    state.selectedCurrency = currency;
    save();
  }

  function setCurrentMonth(month) {
    state.currentMonth = month;
    save();
  }

  function setCurrentYear(year) {
    state.currentYear = year;
    save();
  }

  function getTotalIncome() {
    return state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function getTotalExpenses() {
    return state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function getBalance() {
    const accountBalances = state.accounts.reduce((sum, a) => sum + a.balance, 0);
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    return income - expenses + accountBalances;
  }

  function getSpentByCategory() {
    const result = {};
    CATEGORIES.forEach((c) => (result[c.id] = 0));
    state.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        result[t.category] = (result[t.category] || 0) + t.amount;
      });
    return result;
  }

  function getBudgetSpentPercent(categoryId) {
    const budget = state.budgets.get(categoryId) || 0;
    const spent = getSpentByCategory()[categoryId] || 0;
    if (budget === 0) return 0;
    return Math.min(100, (spent / budget) * 100);
  }

  function getBudgetRemaining(categoryId) {
    const budget = state.budgets.get(categoryId) || 0;
    const spent = getSpentByCategory()[categoryId] || 0;
    return budget - spent;
  }

  function getOverdueBills() {
    const now = new Date();
    return state.bills.filter((b) => !b.paid && new Date(b.due) < now);
  }

  function getUpcomingBills(days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return state.bills.filter((b) => !b.paid && new Date(b.due) >= now && new Date(b.due) <= future);
  }

  function getAccountBalance(accountId) {
    const account = state.accounts.find((a) => a.id === accountId);
    return account ? account.balance : 0;
  }

  function getTotalSpentThisWeek() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return state.transactions
      .filter(
        (t) =>
          t.type === 'expense' && new Date(t.date) >= weekAgo && new Date(t.date) <= now
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  return {
    getState,
    setState,
    resetToSeed,
    addTransaction,
    editTransaction,
    removeTransaction,
    addBill,
    removeBill,
    toggleBillPaid,
    addGoal,
    removeGoal,
    addFundsGoal,
    editBudget,
    setSelectedCurrency,
    setCurrentMonth,
    setCurrentYear,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getSpentByCategory,
    getBudgetSpentPercent,
    getBudgetRemaining,
    getOverdueBills,
    getUpcomingBills,
    getAccountBalance,
    getTotalSpentThisWeek,
    save,
  };
})();