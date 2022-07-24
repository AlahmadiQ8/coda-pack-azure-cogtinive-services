export type SentimentResponse = Response<SentimentDocumentResponse>;
export type LanguageDetectionResponse = Response<LanguageDetectonDocumentResponse>;
export type SentimentRequest = Request<DocumentRequest & { language: string }>
export type LanguageDetectionRequest = Request<DocumentRequest>


interface Request<T> {
  kind:          string;
  parameters:    SentimentParameters;
  analysisInput: AnalysisInput<T>;
}

interface Response<T> {
  kind: string;
  results: Results<T>;
}

interface Results<T> {
  documents: T[];
  errors: any[];
  modelVersion: Date;
}

interface SentimentDocumentResponse {
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

interface LanguageDetectonDocumentResponse {
  id:               string;
  detectedLanguage: DetectedLanguage;
  warnings:         any[];
}

interface DetectedLanguage {
  name:            string;
  iso6391Name:     string;
  confidenceScore: number;
}


interface AnalysisInput<T> {
  documents: T[];
}

interface DocumentRequest {
  id:       string;
  text:     string;
}

interface SentimentParameters {
  modelVersion: string;
}
