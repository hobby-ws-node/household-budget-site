export const CATEGORIES = [
  { id: 'groceries', name: 'Groceries', budget: 650, color: '#4F46E5' },
  { id: 'dining', name: 'Dining Out', budget: 220, color: '#EF4444' },
  { id: 'transport', name: 'Transport', budget: 180, color: '#10B981' },
  { id: 'housing', name: 'Housing', budget: 1850, color: '#F59E0B' },
  { id: 'utilities', name: 'Utilities', budget: 260, color: '#8B5CF6' },
  { id: 'entertainment', name: 'Entertainment', budget: 120, color: '#EC4899' },
  { id: 'health', name: 'Health', budget: 150, color: '#F97316' },
  { id: 'shopping', name: 'Shopping', budget: 200, color: '#6366F1' },
  { id: 'kids', name: 'Kids', budget: 180, color: '#84CC16' },
  { id: 'subscriptions', name: 'Subscriptions', budget: 65, color: '#EF4444' },
];

export const ACCOUNTS = [
  { id: 'checking', name: 'Everyday Checking', balance: 4820.50 },
  { id: 'savings', name: 'Joint Savings', balance: 12400.00 },
  { id: 'credit', name: 'Credit Card', balance: -1284.30 },
  { id: 'cash', name: 'Cash', balance: 320.00 },
];

export const INCOME_BREAKDOWN = [
  { name: 'Alex', amount: 4100 },
  { name: 'Sam', amount: 3300 },
];

export const transactions = [
  { id: 't1', date: '2026-11-01', description: 'GreenMart groceries', category: 'groceries', account: 'checking', amount: 87.45, type: 'expense' },
  { id: 't2', date: '2026-11-01', description: 'Alex salary', category: 'income', account: 'checking', amount: 4100, type: 'income' },
  { id: 't3', date: '2026-11-02', description: 'City Power & Light', category: 'utilities', account: 'checking', amount: 132.00, type: 'expense' },
  { id: 't4', date: '2026-11-02', description: 'Sam salary', category: 'income', account: 'checking', amount: 3300, type: 'income' },
  { id: 't5', date: '2026-11-03', description: 'Metro Transit pass', category: 'transport', account: 'checking', amount: 12.50, type: 'expense' },
  { id: 't6', date: '2026-11-04', description: 'Target shopping', category: 'shopping', account: 'checking', amount: 45.99, type: 'expense' },
  { id: 't7', date: '2026-11-05', description: 'Cineplex movies', category: 'entertainment', account: 'checking', amount: 28.50, type: 'expense' },
  { id: 't8', date: '2026-11-06', description: 'GreenMart groceries', category: 'groceries', account: 'checking', amount: 122.30, type: 'expense' },
  { id: 't9', date: '2026-11-07', description: 'Starbucks coffee', category: 'dining', account: 'checking', amount: 7.85, type: 'expense' },
  { id: 't10', date: '2026-11-08', description: 'Riverside Dining', category: 'dining', account: 'checking', amount: 52.00, type: 'expense' },
  { id: 't11', date: '2026-11-09', description: 'City Power & Light', category: 'utilities', account: 'checking', amount: 98.40, type: 'expense' },
  { id: 't12', date: '2026-11-10', description: 'Metro Transit pass', category: 'transport', account: 'checking', amount: 15.00, type: 'expense' },
  { id: 't13', date: '2026-11-11', description: 'GreenMart groceries', category: 'groceries', account: 'checking', amount: 94.20, type: 'expense' },
  { id: 't14', date: '2026-11-12', description: 'Electric bill', category: 'utilities', account: 'checking', amount: 132.00, type: 'expense' },
  { id: 't15', date: '2026-11-13', description: 'Entertainment center', category: 'entertainment', account: 'checking', amount: 35.00, type: 'expense' },
  { id: 't16', date: '2026-11-14', description: 'Pharmacy', category: 'health', account: 'checking', amount: 42.75, type: 'expense' },
  { id: 't17', date: '2026-11-15', description: 'Internet bill', category: 'utilities', account: 'checking', amount: 79.00, type: 'expense' },
  { id: 't18', date: '2026-11-15', description: 'Netflix subscription', category: 'subscriptions', account: 'checking', amount: 18.99, type: 'expense' },
  { id: 't19', date: '2026-11-16', description: 'Kids school supplies', category: 'kids', account: 'checking', amount: 35.50, type: 'expense' },
  { id: 't20', date: '2026-11-17', description: 'Gym fitness', category: 'entertainment', account: 'checking', amount: 45.00, type: 'expense' },
  { id: 't21', date: '2026-11-18', description: 'Water bill', category: 'utilities', account: 'checking', amount: 46.00, type: 'expense' },
  { id: 't22', date: '2026-11-19', description: 'Amazon shopping', category: 'shopping', account: 'checking', amount: 78.20, type: 'expense' },
  { id: 't23', date: '2026-11-20', description: 'Phone bill', category: 'utilities', account: 'checking', amount: 110.00, type: 'expense' },
  { id: 't24', date: '2026-11-21', description: 'GreenMart groceries', category: 'groceries', account: 'checking', amount: 67.80, type: 'expense' },
  { id: 't25', date: '2026-11-22', description: 'Gym fitness', category: 'entertainment', account: 'checking', amount: 45.00, type: 'expense' },
  { id: 't26', date: '2026-11-23', description: 'City Power & Light', category: 'utilities', account: 'checking', amount: 88.30, type: 'expense' },
  { id: 't27', date: '2026-11-24', description: 'Movie night', category: 'entertainment', account: 'checking', amount: 32.00, type: 'expense' },
  { id: 't28', date: '2026-11-25', description: 'Streaming bundle', category: 'subscriptions', account: 'checking', amount: 32.00, type: 'expense' },
  { id: 't29', date: '2026-11-26', description: 'Car insurance', category: 'utilities', account: 'checking', amount: 148.00, type: 'expense' },
  { id: 't30', date: '2026-11-26', description: 'Alex side gig', category: 'income', account: 'checking', amount: 200, type: 'income' },
  { id: 't31', date: '2026-11-26', description: 'Sam side gig', category: 'income', account: 'checking', amount: 150, type: 'income' },
  { id: 't32', date: '2026-11-05', description: 'Babysitting', category: 'kids', account: 'checking', amount: 65.00, type: 'income' },
  { id: 't33', date: '2026-11-10', description: 'Pet sitting', category: 'health', account: 'checking', amount: 40.00, type: 'income' },
  { id: 't34', date: '2026-11-15', description: 'House cleaning', category: 'shopping', account: 'checking', amount: 120.00, type: 'expense' },
  { id: 't35', date: '2026-11-20', description: 'Gift purchase', category: 'shopping', account: 'checking', amount: 89.50, type: 'expense' },
];

export const bills = [
  { id: 'b1', name: 'Rent', amount: 1850, due: '2026-11-01', paid: true, category: 'housing' },
  { id: 'b2', name: 'Electric', amount: 132, due: '2026-11-12', paid: true, category: 'utilities' },
  { id: 'b3', name: 'Internet', amount: 79, due: '2026-11-15', paid: false, category: 'utilities' },
  { id: 'b4', name: 'Water', amount: 46, due: '2026-11-18', paid: false, category: 'utilities' },
  { id: 'b5', name: 'Phone', amount: 110, due: '2026-11-20', paid: false, category: 'utilities' },
  { id: 'b6', name: 'Gym', amount: 45, due: '2026-11-22', paid: false, category: 'entertainment' },
  { id: 'b7', name: 'Streaming bundle', amount: 32, due: '2026-11-25', paid: false, category: 'subscriptions' },
  { id: 'b8', name: 'Car insurance', amount: 148, due: '2026-11-28', paid: false, category: 'utilities' },
];

export const goals = [
  { id: 'g1', name: 'Family vacation', target: 3000, saved: 1850, category: 'entertainment' },
  { id: 'g2', name: 'New sofa', target: 1200, saved: 640, category: 'shopping' },
  { id: 'g3', name: 'Emergency fund', target: 10000, saved: 6200, category: 'utilities' },
];