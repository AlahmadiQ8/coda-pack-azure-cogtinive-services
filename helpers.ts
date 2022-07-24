import * as coda from "@codahq/packs-sdk";

import { LanguageDetectionResponse, SentimentResponse } from "./types";

export const toSentimentSchema = (sentimentResponse: SentimentResponse) => {
  const document = sentimentResponse.results.documents[0];
  return {
    sentiment: document.sentiment,
    positiveScore: document.confidenceScores.positive,
    neutralScore: document.confidenceScores.neutral,
    negativeScore: document.confidenceScores.negative,
  }
}

export const toLanguageDetectionSchema = (languageDetectionResponse: LanguageDetectionResponse) => {
  const document = languageDetectionResponse.results.documents[0];
  return {
    name: document.detectedLanguage.name,
    isoName: document.detectedLanguage.iso6391Name,
    confidenceScore: document.detectedLanguage.confidenceScore
  }
}

export function getTokenPlaceholder(token: string, context: coda.ExecutionContext): string {
  return `{{${token}-${context.invocationToken}}}`;
}