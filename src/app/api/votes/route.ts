import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { VOTE_QUESTIONS, type VoteQuestion } from '@src/data/vote-questions';
import { getCstDateString } from '@src/utils/time';

interface VoteStorage {
  questions: VoteQuestion[];
  votes: Record<string, number[]>;
  currentQuestionId: string | null;
  lastResetDate: string;
}

const STORAGE_PATH = path.join(process.cwd(), 'src', 'data', 'votes.json');

const readStorage = async (): Promise<VoteStorage> => {
  try {
    const raw = await fs.readFile(STORAGE_PATH, 'utf-8');
    return JSON.parse(raw) as VoteStorage;
  } catch {
    return {
      questions: [...VOTE_QUESTIONS],
      votes: {},
      currentQuestionId: null,
      lastResetDate: '',
    };
  }
};

const writeStorage = async (storage: VoteStorage) => {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(storage, null, 2), 'utf-8');
};

const syncQuestions = (storage: VoteStorage) => {
  const storedIds = new Set(storage.questions.map((question) => question.id));
  const merged = [...storage.questions];
  VOTE_QUESTIONS.forEach((question) => {
    if (!storedIds.has(question.id)) {
      merged.push({ ...question });
    }
  });
  return { ...storage, questions: merged };
};

const selectNextQuestion = (storage: VoteStorage) => {
  let next = storage.questions.find((question) => !question.askedBefore);
  if (!next) {
    storage.questions = storage.questions.map((question) => ({
      ...question,
      askedBefore: false,
    }));
    next = storage.questions[0] ?? null;
  }
  if (!next) return storage;
  storage.questions = storage.questions.map((question) =>
    question.id === next?.id ? { ...question, askedBefore: true } : question,
  );
  storage.currentQuestionId = next.id;
  storage.votes[next.id] = Array(next.responses.length).fill(0);
  return storage;
};

const refreshDailyQuestion = (storage: VoteStorage) => {
  const today = getCstDateString();
  if (storage.lastResetDate !== today || !storage.currentQuestionId) {
    storage.lastResetDate = today;
    storage = selectNextQuestion(storage);
  }
  return storage;
};

export const GET = async () => {
  let storage = await readStorage();
  storage = syncQuestions(storage);
  storage = refreshDailyQuestion(storage);
  await writeStorage(storage);

  const question =
    storage.questions.find(
      (item) => item.id === storage.currentQuestionId,
    ) ?? storage.questions[0];
  const votes = storage.votes[question?.id ?? ''] ?? [];
  const totalVotes = votes.reduce((sum, count) => sum + count, 0);

  return NextResponse.json({
    question,
    votes,
    totalVotes,
    cstDate: storage.lastResetDate,
  });
};

export const POST = async (request: Request) => {
  const payload = (await request.json()) as {
    questionId: string;
    choiceIndex: number;
  };

  let storage = await readStorage();
  storage = syncQuestions(storage);
  storage = refreshDailyQuestion(storage);

  if (payload.questionId !== storage.currentQuestionId) {
    return NextResponse.json({ error: 'Question expired.' }, { status: 400 });
  }

  const votes = storage.votes[payload.questionId];
  if (!votes || payload.choiceIndex < 0 || payload.choiceIndex >= votes.length) {
    return NextResponse.json({ error: 'Invalid vote.' }, { status: 400 });
  }

  votes[payload.choiceIndex] += 1;
  storage.votes[payload.questionId] = votes;
  await writeStorage(storage);

  const totalVotes = votes.reduce((sum, count) => sum + count, 0);
  return NextResponse.json({
    question: storage.questions.find(
      (item) => item.id === payload.questionId,
    ),
    votes,
    totalVotes,
    cstDate: storage.lastResetDate,
  });
};
