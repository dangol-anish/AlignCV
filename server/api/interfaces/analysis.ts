export interface CategoryEvaluation {
  score: number;
  evaluation: string;
  comments: string[];
}

export type CategoryClassifierResult = Record<string, string>;
