import * as coda from "@codahq/packs-sdk";

import { SentimentResponse } from "./types";

export const toSentimentSchema = (sentimentResponse: SentimentResponse) => {
  const document = sentimentResponse.results.documents[0];
  return {
    sentiment: document.sentiment,
    positiveScore: document.confidenceScores.positive,
    neutralScore: document.confidenceScores.neutral,
    negativeScore: document.confidenceScores.negative,
  }
}

export function getTokenPlaceholder(token: string, context: coda.ExecutionContext): string {
  return `{{${token}-${context.invocationToken}}}`;
}