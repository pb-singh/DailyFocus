import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExpenseCategory, Task, Transaction, UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

export const predictCategory = async (description: string): Promise<ExpenseCategory> => {
  if (!apiKey) return ExpenseCategory.Other;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Categorize this transaction description into one of these exact categories: Food, Transport, Housing, Entertainment, Utilities, Shopping, Health, Income, Other. Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: Object.values(ExpenseCategory),
            },
          },
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    return (json.category as ExpenseCategory) || ExpenseCategory.Other;
  } catch (error) {
    console.error("AI Error:", error);
    return ExpenseCategory.Other;
  }
};

export const polishTask = async (text: string): Promise<string> => {
  if (!apiKey) return text;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Rewrite this task to be concise, actionable, and clear (max 10 words): "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("AI Error:", error);
    return text;
  }
};

export const summarizeTask = async (text: string): Promise<string> => {
  if (!apiKey) return text;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Summarize this task title into a very concise version (max 5 words) retaining key meaning: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("AI Error:", error);
    return text;
  }
};

export const analyzeSpending = async (transactions: Transaction[], budget: number): Promise<string> => {
  if (!apiKey) return "Please configure your API Key to get insights.";

  const recent = transactions.slice(0, 20).map(t => `${t.type}: ₹${t.amount} on ${t.category} (${t.description})`).join('\n');
  const prompt = `Analyze these recent transactions against a monthly budget of ₹${budget}. Provide 3 short, bulleted actionable tips to improve financial health. Keep it friendly.
  Data:
  ${recent}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to generate insights at this moment.";
  }
};

export const generateContextualAdvice = async (tab: string, data: { tasks: Task[], transactions: Transaction[], profile: UserProfile }): Promise<string> => {
  if (!apiKey) return "Stay focused and productive!";

  let prompt = "";
  if (tab === 'tasks' || tab === 'dashboard') {
    const pendingCount = data.tasks.filter(t => !t.completed).length;
    prompt = `The user has ${pendingCount} pending tasks. Give a one-sentence motivating quote or productivity tip suitable for right now.`;
  } else if (tab === 'expenses' || tab === 'stats') {
     const spent = data.transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
     prompt = `The user has spent ₹${spent} so far. Give a one-sentence financial wisdom tip.`;
  } else {
    prompt = "Give a short, friendly compliment to the user.";
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text?.trim() || "Have a great day!";
  } catch (error) {
    return "Keep moving forward!";
  }
};