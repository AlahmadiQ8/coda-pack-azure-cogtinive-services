export interface SentimentResponse {
  kind: string;
  results: Results;
}

export interface AnalysisRequest {
  kind:          string;
  parameters:    SentimentParameters;
  analysisInput: AnalysisInput;
}

interface Results {
  documents: DocumentResponse[];
  errors: any[];
  modelVersion: Date;
}

interface DocumentResponse {
  id: string;
  sentiment: string;
  confidenceScores: ConfidenceScores;
  sentences: Sentence[];
  warnings: any[];
}

interface ConfidenceScores {
  positive: number;
  neutral:  number;
  negative: number;
}

interface Sentence {
  sentiment: string;
  confidenceScores: ConfidenceScores;
  offset: number;
  length: number;
  text: string;
}


interface AnalysisInput {
  documents: DocumentRequest[];
}

interface DocumentRequest {
  id:       string;
  language: string;
  text:     string;
}

interface SentimentParameters {
  modelVersion: string;
}
