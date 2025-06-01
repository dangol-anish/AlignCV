export interface DynamicResumeSections {
  [section: string]: string | string[] | object | object[];
}

export type AtsScoreType = { score: number; explanation: string } | null;
