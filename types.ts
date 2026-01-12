export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum ExpenseCategory {
  Food = 'Food',
  Transport = 'Transport',
  Housing = 'Housing',
  Entertainment = 'Entertainment',
  Utilities = 'Utilities',
  Shopping = 'Shopping',
  Health = 'Health',
  Income = 'Income',
  Other = 'Other',
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string; // ISO Date string
  reminderTime?: string; // ISO Date string
  notified?: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  type: TransactionType;
  date: string; // ISO Date string
  createdAt: number;
}

export interface UserProfile {
  name: string;
  email: string;
  monthlyBudget: number;
  avatarUrl?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  snoozeDurationMinutes: number;
}

export type Tab = 'dashboard' | 'tasks' | 'expenses' | 'stats' | 'profile';

export interface AppData {
  tasks: Task[];
  transactions: Transaction[];
  profile: UserProfile;
  settings: UserSettings;
}
