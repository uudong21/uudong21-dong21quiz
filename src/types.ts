export type QuizOption = 'O' | 'X';

export interface QuizQuestion {
  id: string;
  question: string;
  answer: QuizOption;
  explanation: string;
}

export type AppScreen = 'home' | 'quiz' | 'result' | 'fail' | 'admin';

export interface QuizResult {
  isCorrect: boolean;
  question: QuizQuestion;
}
