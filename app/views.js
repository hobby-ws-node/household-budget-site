import { CATEGORIES, ACCOUNTS, INCOME_BREAKDOWN } from './data.js';
import { renderDonut, renderBarChart } from './charts.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');

function createText(s) { return document.createTextNode(String(s)); }

function $(s) { return document.querySelector(s); }
function createElement(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach((k) => {
      if (k === 'style' && attrs[k] && typeof attrs[k] === 'object') {
        Object.assign(el.style, attrs[k]);
      } else if (k.startsWith('on') && typeof attrs[k] === 'string') {
        el.setAttribute(k, attrs[k]);
      } else if (k.startsWith('data-')) {
        el.setAttribute(k, attrs[k]);
      } else {
        el[k] = attrs[k];
        // outerHTML serializes attributes, not properties: keep value/selected/checked in sync.
        if ((k === 'value' || k === 'selected' || k === 'checked') && attrs[k] !== false) {
          el.setAttribute(k, k === 'value' ? String(attrs[k]) : '');
        }
      }
    });
  }
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}
function q(s) { return document.querySelector(s); }

function setAttr(el, key, value) {
  el.setAttribute(key, value);
}

// Currency formatting: amounts re-format when the user changes currency in Settings.
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£' };
function fmt(state, n) {
  const sym = CURRENCY_SYMBOLS[state.getState().selectedCurrency] || '$';
  return sym + Number(n).toFixed(2);
}
function sym(state) {
  return CURRENCY_SYMBOLS[state.getState().selectedCurrency] || '$';
}

function renderDashboard(state) {
  const totalIncome = state.getTotalIncome();
  const totalExpenses = state.getTotalExpenses();
  const balance = state.getBalance();
  const spentByCategory = state.getSpentByCategory();
  const upcomingBills = state.getUpcomingBills(7);
  const overdueBills = state.getOverdueBills();

  const mainDiv = createElement('div');
  mainDiv.innerHTML = '';

  const cards = createElement('div', { className: 'cards' });

  const ci = createElement('div', { className: 'card income' });
  ci.appendChild(createText('Income this month: ' + fmt(state, totalIncome)));
  cards.appendChild(ci);

  const ce = createElement('div', { className: 'card expenses' });
  ce.appendChild(createText('Expenses this month: ' + fmt(state, totalExpenses)));
  cards.appendChild(ce);

  const cb = createElement('div', { className: 'card balance' });
  cb.appendChild(createText('Balance remaining: ' + fmt(state, balance)));
  cards.appendChild(cb);

  mainDiv.appendChild(cards);

  const bh = createElement('div', { className: 'budget-health' });
  bh.appendChild(createElement('h3', null, 'Budget health'));

  const bg = createElement('div', { className: 'budget-grid' });
  CATEGORIES.forEach((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    const budget = state.getState().budgets.get(cat.id) || cat.budget;
    const pct = budget > 0 ? (spent / budget) * 100 : 0;
    const over = spent > budget;
    const barPct = Math.min(95, pct);
    const barCol = over ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#10B981';

    const bi = createElement('div', { className: 'budget-item' });
    const ns = createElement('span', null, cat.name);
    bi.appendChild(ns);

    const bp = createElement('div', { className: 'budget-progress' });
    const bb = createElement('div', { className: 'budget-bar', style: { width: barPct + '%', background: barCol } } );
    bp.appendChild(bb);
    bi.appendChild(bp);

    const ss = createElement('span', null, fmt(state, spent) + ' / ' + fmt(state, budget));
    bi.appendChild(ss);

    if (over) {
      const ws = createElement('span', { className: 'over-warning' }, 'Over by ' + fmt(state, spent - budget));
      bi.appendChild(ws);
    }

    const inf = createElement('div', { className: 'budget-info' },
      createElement('span', null, fmt(state, spent)),
      createElement('span', null, fmt(state, budget - spent) + ' left')
    );
    bi.appendChild(inf);

    bg.appendChild(bi);
  });
  bh.appendChild(bg);

  mainDiv.appendChild(bh);

  const ubDiv = createElement('div', { className: 'upcoming-bills' });
  const ubH = createElement('h3', null, 'Upcoming bills (next 7 days)');
  ubDiv.appendChild(ubH);

  const ulList = createElement('div', { className: 'upcoming-list' });
  if (upcomingBills.length > 0) {
    upcomingBills.forEach((bill) => {
      const due = new Date(bill.due);
      const dueStr = (due.getMonth() + 1) + '/' + due.getDate();
      const dl = Math.ceil((new Date(bill.due) - new Date()) / (1000 * 60 * 60 * 24));

      const ui = createElement('div', { className: 'upcoming-item' },
        createElement('span', null, bill.name),
        createElement('span', null, fmt(state, bill.amount) + ' — due ' + dueStr),
        dl > 0 ? createElement('span', { className: 'days-left' }, dl + 'd left') : null
      );
      ulList.appendChild(ui);
    });
  } else {
    ulList.appendChild(createText('No upcoming bills'));
  }
  ubDiv.appendChild(ulList);
  mainDiv.appendChild(ubDiv);

  const rt = createElement('div', { className: 'recent-transactions' });
  const rh = createElement('h3', null, 'Recent transactions');
  rt.appendChild(rh);

  const tbl = createElement('table');
  const thead = createElement('thead');
  const hr = createElement('tr');
  ['Date', 'Description', 'Category', 'Amount', 'Type'].forEach((t) => {
    const th = createElement('th', null, t);
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  tbl.appendChild(thead);

  const tbody = createElement('tbody');
  state.getState().transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)
    .forEach((t) => {
      const d = new Date(t.date);
      const ds = (d.getMonth() + 1) + '/' + d.getDate();
      const cat = CATEGORIES.find((c) => c.id === t.category);
      const clr = cat ? cat.color : '#6b7280';

      const tr = createElement('tr');
      tr.appendChild(createElement('td', null, ds));
      tr.appendChild(createElement('td', null, t.description));
      const tdCat = createElement('td', null);
      const cs = createElement('span', { style: { color: clr } }, cat ? cat.name : t.category);
      tdCat.appendChild(cs);
      tr.appendChild(tdCat);
      tr.appendChild(createElement('td', null, fmt(state, t.amount)));
      tr.appendChild(createElement('td', null, t.type));
      tbody.appendChild(tr);
    });
  tbl.appendChild(tbody);

  const tf = createElement('tfoot');
  const fr = createElement('tr');
  ['', '', '', '', ''].forEach(() => fr.appendChild(createElement('td')));
  const spanI = createElement('span', null, 'Income: ' + fmt(state, state.getState().transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)));
  const spanE = createElement('span', null, 'Expense: ' + fmt(state, state.getState().transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)));
  fr.children[4].appendChild(spanI);
  fr.children[4].appendChild(spanE);
  tf.appendChild(fr);
  tbl.appendChild(tf);

  rt.appendChild(tbl);

  const at = createElement('div', { className: 'add-transaction' },
    createElement('button', { onclick: 'goAddTransaction()' }, 'Add transaction')
  );
  rt.appendChild(at);

  return mainDiv.outerHTML;
}

function renderTransactions(state) {
  const trs = state.getState().transactions;
  const cats = CATEGORIES;

  const mainDiv = createElement('div');

  const filterBar = createElement('div', { className: 'filter-bar' });
  const fc = createElement('select', { id: 'filterCategory' });
  const defOpt = createElement('option', { value: '' }, '');
  fc.appendChild(defOpt);
  cats.forEach((c) => {
    const opt = createElement('option', { value: c.id }, c.name);
    fc.appendChild(opt);
  });
  filterBar.appendChild(fc);

  const ft = createElement('select', { id: 'filterType' });
  const optAll = createElement('option', { value: '' }, 'All types');
  ft.appendChild(optAll);
  const optInc = createElement('option', { value: 'income' }, 'Income');
  ft.appendChild(optInc);
  const optExp = createElement('option', { value: 'expense' }, 'Expense');
  ft.appendChild(optExp);
  filterBar.appendChild(ft);

  const si = createElement('input', { type: 'text', placeholder: 'Search...', id: 'searchInput' });
  filterBar.appendChild(si);
  mainDiv.appendChild(filterBar);

  const tbl = createElement('table');
  const thead = createElement('thead');
  const hr = createElement('tr');
  ['Date', 'Description', 'Category', 'Account', 'Amount', 'Type', 'Actions'].forEach((t) => {
    const th = createElement('th', null, t);
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  tbl.appendChild(thead);

  const tbody = createElement('tbody');
  trs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((t) => {
    const d = new Date(t.date);
    const ds = (d.getMonth() + 1) + '/' + d.getDate();
    const cat = cats.find((c) => c.id === t.category);
    const clr = cat ? cat.color : '#6b7280';
    const ac = ACCOUNTS.find((a) => a.id === t.account);

    const tr = createElement('tr', {
      'data-desc': t.description.toLowerCase(),
      'data-cat': t.category,
      'data-type': t.type,
      'data-amount': String(t.amount),
    });
    tr.appendChild(createElement('td', null, ds));
    tr.appendChild(createElement('td', null, t.description));

    const tdCat = createElement('td', null);
    const catS = createElement('span', { style: { color: clr } }, cat ? cat.name : t.category);
    tdCat.appendChild(catS);
    tr.appendChild(tdCat);

    const tdAcct = createElement('td', null, ac ? ac.name : t.account);
    tr.appendChild(tdAcct);

    const tdAmt = createElement('td', null, fmt(state, t.amount));
    tr.appendChild(tdAmt);

    const tdType = createElement('td', null, t.type);
    tr.appendChild(tdType);

    const tdAct = createElement('td');
    const btnEdit = createElement('button', { className: 'small-btn', onclick: 'openEditTransaction("' + t.id + '")' }, 'Edit');
    const btnDel = createElement('button', { className: 'small-btn danger', onclick: 'removeTransactionConfirm("' + t.id + '")' }, 'Delete');
    tdAct.appendChild(btnEdit);
    tdAct.appendChild(btnDel);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);

  const tfoot = createElement('tfoot');
  const fr = createElement('tr');
  ['', '', '', '', '', ''].forEach(() => fr.appendChild(createElement('td')));
  const spanInc = createElement('span', { id: 'txIncomeTotal' }, 'Income: ' + fmt(state, trs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)));
  const spanExp = createElement('span', { id: 'txExpenseTotal' }, 'Expense: ' + fmt(state, trs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)));
  fr.children[5].appendChild(spanInc);
  fr.children[5].appendChild(spanExp);
  tfoot.appendChild(fr);
  tbl.appendChild(tfoot);

  mainDiv.appendChild(tbl);

  const showBtn = createElement('div', { className: 'add-transaction' },
    createElement('button', { onclick: 'openAddTransactionForm()' }, 'Add transaction')
  );
  mainDiv.appendChild(showBtn);

  const addForm = createElement('div', { className: 'add-transaction-form' },
    createElement('h3', null, 'Add transaction'),
    createElement('form', { id: 'transactionForm' },
      createElement('input', { type: 'hidden', id: 'txId' }),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Date'),
          createElement('input', { type: 'date', id: 'txDate', required: true })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Description'),
          createElement('input', { type: 'text', id: 'txDescription', required: true })
        )
      ),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Category'),
          createElement('select', { id: 'txCategory', required: true },
            ...cats.map((c) => createElement('option', { value: c.id }, c.name))
          )
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Account'),
          createElement('select', { id: 'txAccount', required: true },
            ...ACCOUNTS.map((a) => createElement('option', { value: a.id }, a.name))
          )
        )
      ),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Amount'),
          createElement('input', { type: 'number', id: 'txAmount', step: '0.01', required: true })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Type'),
          createElement('select', { id: 'txType', required: true },
            createElement('option', { value: 'income' }, 'Income'),
            createElement('option', { value: 'expense' }, 'Expense')
          )
        )
      ),
      createElement('div', { style: { marginTop: '16px' } },
        createElement('button', { type: 'submit' }, 'Save transaction'),
        createElement('button', { type: 'button', onclick: 'closeAddTransactionForm()', style: { marginLeft: '8px' } }, 'Cancel')
      )
    )
  );
  mainDiv.appendChild(addForm);

  return mainDiv.outerHTML;
}

function renderBudgets(state) {
  const spentByCategory = state.getSpentByCategory();
  const mainDiv = createElement('div');

  const h = createElement('h1', null, 'Budgets');
  mainDiv.appendChild(h);

  const p = createElement('p', null, 'Set your monthly limits per category. Over-budget categories show warnings.');
  mainDiv.appendChild(p);

  const grid = createElement('div', { className: 'budgets-grid' });
  CATEGORIES.forEach((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    const budget = state.getState().budgets.get(cat.id) || cat.budget;
    const remaining = budget - spent;
    const pct = budget > 0 ? (spent / budget) * 100 : 0;
    const over = spent > budget;
    const barPct = Math.min(95, pct);
    const barCol = over ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#10B981';

    const card = createElement('div', { className: 'budget-card' });

    const hdr = createElement('div', { className: 'budget-header' });
    hdr.appendChild(createElement('span', null, cat.name));
    const budgetSpan = createElement('span', null, fmt(state, budget));
    hdr.appendChild(budgetSpan);
    card.appendChild(hdr);

    const pb = createElement('div', { className: 'budget-progress' });
    const pbarr = createElement('div', { className: 'budget-bar', style: { width: barPct + '%', background: barCol } } );
    pb.appendChild(pbarr);
    card.appendChild(pb);

    const bi = createElement('div', { className: 'budget-info' },
      createElement('span', null, fmt(state, spent) + ' spent'),
      createElement('span', null, fmt(state, remaining) + ' left')
    );
    card.appendChild(bi);

    if (over) {
      const ow = createElement('div', { className: 'over-warning' }, 'Over by ' + fmt(state, spent - budget));
      card.appendChild(ow);
    }

    const ed = createElement('input', { type: 'number', className: 'budget-edit', value: budget.toFixed(2),
      'data-category': cat.id, onchange: 'editBudgetInline(this, "' + cat.id + '")' } );
    card.appendChild(ed);

    grid.appendChild(card);
  });
  mainDiv.appendChild(grid);

  return mainDiv.outerHTML;
}

function renderBills(state) {
  const overdueBills = state.getOverdueBills();
  const upcomingBills = state.getUpcomingBills(7);
  const allBills = state.getState().bills;
  const mainDiv = createElement('div');

  const h = createElement('h1', null, 'Bills');
  mainDiv.appendChild(h);

  const summary = createElement('div', { className: 'bill-summary' });
  const dueSpan = createElement('span', null, 'Due this week: ' + fmt(state, upcomingBills.reduce((s, b) => s + b.amount, 0)));
  summary.appendChild(dueSpan);
  if (overdueBills.length > 0) {
    const os = createElement('span', { className: 'overdue-notice' }, 'Overdue: ' + fmt(state, overdueBills.reduce((s, b) => s + b.amount, 0)));
    summary.appendChild(os);
  }
  mainDiv.appendChild(summary);

  const list = createElement('div', { className: 'bills-list' });
  allBills.forEach((bill) => {
    const due = new Date(bill.due);
    const dueStr = (due.getMonth() + 1) + '/' + due.getDate();
    const dl = Math.ceil((new Date(bill.due) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = !bill.paid && new Date(bill.due) < new Date();
    const isDueSoon = !bill.paid && new Date(bill.due) >= new Date() && new Date(bill.due) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    const paidClass = bill.paid ? ' paid' : '';
    const dueCol = isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#10B981';

    const item = createElement('div', { className: 'bill-item' + paidClass },
      createElement('div', { className: 'bill-info' },
        createElement('span', null, bill.name),
        createElement('span', null, fmt(state, bill.amount) + ' — due ' + dueStr)
      ),
      createElement('div', { className: 'bill-actions' },
        createElement('button', { className: 'small-btn toggle-paid' + (bill.paid ? ' disabled' : ''), onclick: 'toggleBillPaid(\"' + bill.id + '\")' },
          bill.paid ? 'Paid' : 'Mark paid'),
        createElement('button', { className: 'small-btn danger', onclick: 'removeBillConfirm(\"' + bill.id + '\")' }, 'Delete')
      )
    );
    list.appendChild(item);
  });
  mainDiv.appendChild(list);

  const showBillBtn = createElement('div', { className: 'add-transaction' },
    createElement('button', { onclick: 'showAddBillForm()' }, 'Add bill')
  );
  mainDiv.appendChild(showBillBtn);

  const addForm = createElement('div', { className: 'add-bill-form' },
    createElement('h3', null, 'Add bill'),
    createElement('form', { id: 'billForm' },
      createElement('input', { type: 'hidden', id: 'billId' }),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Name'),
          createElement('input', { type: 'text', id: 'billName', required: true })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Amount'),
          createElement('input', { type: 'number', id: 'billAmount', step: '0.01', required: true })
        )
      ),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Due date'),
          createElement('input', { type: 'date', id: 'billDue', required: true })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Category'),
          createElement('select', { id: 'billCategory', required: true },
            ...CATEGORIES.map((c) => createElement('option', { value: c.id }, c.name))
          )
        )
      ),
      createElement('div', { style: { marginTop: '16px' } },
        createElement('button', { type: 'submit' }, 'Add bill'),
        createElement('button', { type: 'button', onclick: 'closeAddBillForm()', style: { marginLeft: '8px' } }, 'Cancel')
      )
    )
  );
  mainDiv.appendChild(addForm);

  return mainDiv.outerHTML;
}

function renderGoals(state) {
  const goals = state.getState().goals;
  const mainDiv = createElement('div');

  const h = createElement('h1', null, 'Savings Goals');
  mainDiv.appendChild(h);

  const grid = createElement('div', { className: 'goals-grid' });
  goals.forEach((goal) => {
    const pct = (goal.saved / goal.target) * 100;
    const barPct = Math.min(95, pct);

    const card = createElement('div', { className: 'goal-card' });

    const hdr = createElement('div', { className: 'goal-header' });
    hdr.appendChild(createElement('span', null, goal.name));
    const valSpan = createElement('span', null, fmt(state, goal.saved) + ' / ' + fmt(state, goal.target));
    hdr.appendChild(valSpan);
    card.appendChild(hdr);

    const pb = createElement('div', { className: 'goal-progress' });
    const pbarr = createElement('div', { className: 'goal-bar', style: { width: barPct + '%', background: '#10B981' } } );
    pb.appendChild(pbarr);
    card.appendChild(pb);

    const actions = createElement('div', { className: 'goal-actions' },
      createElement('button', { className: 'small-btn', onclick: 'addFundsGoal(\"' + goal.id + '\", 100)' }, 'Add 100'),
      createElement('button', { className: 'small-btn danger', onclick: 'removeGoalConfirm(\"' + goal.id + '\")' }, 'Delete')
    );
    card.appendChild(actions);

    grid.appendChild(card);
  });
  mainDiv.appendChild(grid);

  const showGoalBtn = createElement('div', { className: 'add-transaction' },
    createElement('button', { onclick: 'showAddGoalForm()' }, 'Create goal')
  );
  mainDiv.appendChild(showGoalBtn);

  const addForm = createElement('div', { className: 'add-goal-form' },
    createElement('h3', null, 'Create savings goal'),
    createElement('form', { id: 'goalForm' },
      createElement('input', { type: 'hidden', id: 'goalId' }),
      createElement('div', { className: 'form-row' },
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Goal name'),
          createElement('input', { type: 'text', id: 'goalName', required: true })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', null, 'Target amount'),
          createElement('input', { type: 'number', id: 'goalTarget', step: '0.01', required: true })
        )
      ),
      createElement('div', { style: { marginTop: '16px' } },
        createElement('button', { type: 'submit' }, 'Create goal'),
        createElement('button', { type: 'button', onclick: 'closeAddGoalForm()', style: { marginLeft: '8px' } }, 'Cancel')
      )
    )
  );
  mainDiv.appendChild(addForm);

  return mainDiv.outerHTML;
}

function renderReports(state) {
  const spentByCategory = state.getSpentByCategory();
  const transactions = state.getState().transactions;
  const totalIncome = state.getTotalIncome();
  const totalExpenses = state.getTotalExpenses();
  const mainDiv = createElement('div');

  const h = createElement('h1', null, 'Reports');
  mainDiv.appendChild(h);

  const grid = createElement('div', { className: 'reports-grid' });

  // Category spending donut
  const donutSection = createElement('div', { className: 'report-section' });
  const donutH = createElement('h2', null, 'Spending by category');
  donutSection.appendChild(donutH);

  const donutContainer = createElement('div', { className: 'donut-wrapper' });
  // We'll insert the donut SVG via innerHTML
  const donutData = CATEGORIES.map((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    if (spent === 0) return null;
    return { label: cat.name, value: spent };
  }).filter((d) => d !== null);

  if (donutData.length > 0) {
    const donutSVG = renderDonut(donutData, 300, 300, 'Spending by Category', sym(state));
    donutContainer.appendChild(donutSVG);
  } else {
    donutContainer.appendChild(createText('No spending data'));
  }
  donutSection.appendChild(donutContainer);

  // Legend
  const legend = createElement('div', { className: 'donut-legend' });
  CATEGORIES.forEach((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    const li = createElement('div', { className: 'legend-item' },
      createElement('span', { className: 'dot', style: { background: cat.color } }, ''),
      createElement('span', null, cat.name + ': ' + fmt(state, spent))
    );
    legend.appendChild(li);
  });
  donutSection.appendChild(legend);
  grid.appendChild(donutSection);

  // Monthly trend chart
  const msSection = createElement('div', { className: 'report-section' });
  const msH = createElement('h2', null, 'Monthly income vs spending (Jun-Nov)');
  msSection.appendChild(msH);

  const chartWrapper = createElement('div', { className: 'chart-wrapper' });
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const incomeData = [7400, 7200, 7500, 7300, 7100, totalIncome];
  const spendingData = [3500, 3800, 3600, 3900, 3700, totalExpenses];

  const incomeSVG = renderBarChart(months.map((m, i) => ({ label: m, value: incomeData[i] })), 340, 280, 'Monthly income', sym(state));
  chartWrapper.appendChild(incomeSVG);
  const spendingSVG = renderBarChart(months.map((m, i) => ({ label: m, value: spendingData[i] })), 340, 280, 'Monthly spending', sym(state));
  chartWrapper.appendChild(spendingSVG);
  msSection.appendChild(chartWrapper);
  grid.appendChild(msSection);

  // Top categories
  const tcSection = createElement('div', { className: 'report-section' });
  const tcH = createElement('h2', null, 'Top spending categories');
  tcSection.appendChild(tcH);

  const ol = createElement('ol');
  const sorted = [...CATEGORIES].sort((a, b) => {
    const sa = spentByCategory[a.id] || 0;
    const sb = spentByCategory[b.id] || 0;
    return sb - sa;
  });
  sorted.slice(0, 5).forEach((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    const li = createElement('li', null, cat.name + ': ' + fmt(state, spent));
    ol.appendChild(li);
  });
  tcSection.appendChild(ol);
  grid.appendChild(tcSection);

  mainDiv.appendChild(grid);

  return mainDiv.outerHTML;
}

function renderSettings(state) {
  const currencies = ['USD', 'EUR', 'GBP'];
  const selectedCurrency = state.getState().selectedCurrency;
  const mainDiv = createElement('div');

  const h = createElement('h1', null, 'Settings');
  mainDiv.appendChild(h);

  const grid = createElement('div', { className: 'settings-grid' });

  // Currency
  const csDiv = createElement('div', { className: 'settings-card' });
  const ch = createElement('h3', null, 'Currency');
  csDiv.appendChild(ch);
  const sel = createElement('select', { id: 'currencySelector', onchange: 'setCurrency(this.value)' });
  currencies.forEach((c) => {
    const opt = createElement('option', { value: c, selected: c === selectedCurrency }, c);
    sel.appendChild(opt);
  });
  csDiv.appendChild(sel);
  const hint = createElement('p', { className: 'hint' }, 'All amounts will re-format when you change currency.');
  csDiv.appendChild(hint);
  grid.appendChild(csDiv);

  // Manage categories
  const mcDiv = createElement('div', { className: 'settings-card' });
  const mch = createElement('h3', null, 'Manage categories');
  mcDiv.appendChild(mch);
  const cpInput = createElement('input', { type: 'text', id: 'newCategoryName', placeholder: 'New category name' });
  mcDiv.appendChild(cpInput);
  const addBtn = createElement('button', { className: 'small-btn', onclick: 'addCategory()' }, 'Add category');
  mcDiv.appendChild(addBtn);
  grid.appendChild(mcDiv);

  // Data actions
  const daDiv = createElement('div', { className: 'settings-card' });
  const dah = createElement('h3', null, 'Data actions');
  daDiv.appendChild(dah);
  const resetBtn = createElement('button', { className: 'small-btn', onclick: 'resetDemoData()' }, 'Reset demo data');
  const exportBtn = createElement('button', { className: 'small-btn', onclick: 'exportData()' }, 'Export JSON');
  const clearBtn = createElement('button', { className: 'small-btn danger', onclick: 'clearAllData()' }, 'Clear all data');
  daDiv.appendChild(resetBtn);
  daDiv.appendChild(exportBtn);
  daDiv.appendChild(clearBtn);
  grid.appendChild(daDiv);

  mainDiv.appendChild(grid);

  return mainDiv.outerHTML;
}

export function render(state) {
  const page = window.location.hash.replace(/^#\/?/, '') || 'dashboard';

  let content;
  switch (page) {
    case 'dashboard':
      content = renderDashboard(state);
      break;
    case 'transactions':
      content = renderTransactions(state);
      break;
    case 'budgets':
      content = renderBudgets(state);
      break;
    case 'bills':
      content = renderBills(state);
      break;
    case 'goals':
      content = renderGoals(state);
      break;
    case 'reports':
      content = renderReports(state);
      break;
    case 'settings':
      content = renderSettings(state);
      break;
    default:
      content = '<p>Page not found</p>';
  }

  return content;
}