import * as coda from "@codahq/packs-sdk";
import { getTokenPlaceholder, toLanguageDetectionSchema, toSentimentSchema } from "./helpers";
import { LanguageDetectionSchema, SentimentSchema } from "./schemas";
import { SentimentRequest, LanguageDetectionRequest, LanguageDetectionResponse, SentimentResponse } from "./types";

export const pack = coda.newPack();

pack.addNetworkDomain("azure.com");

pack.setUserAuthentication({
  type: coda.AuthenticationType.Custom,
  requiresEndpointUrl: true,
  params: [
    {name: "key", description: "API Key for the Azure language resource. You can find your key and endpoint by navigating to your resource's Keys and Endpoint page, under Resource Management."},
  ],
});

pack.addFormula({
  name: "AnalyzeSentiment",
  description: "Get the sentiment of a given text (Positive, Negative, Neutral, Mixed, Unkown).",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "text", 
      description: "The text to be analyzed"
    })
  ],
  resultType: coda.ValueType.Object,
  schema: SentimentSchema,
  execute: async ([text], context) => {
    if (text?.length < 3) {
      return {
        sentiment: 'unknown',
        positiveScore: 0,
        neutralScore: 0,
        negativeScore: 0,
      }
    }

    const request: SentimentRequest = {
      kind: "SentimentAnalysis",
      parameters: {
        modelVersion: 'latest',
      },
      analysisInput: {
        documents: [ {
            id: '1',
            language: 'en',
            text
          }
        ]
      }
    };

    let response = await context.fetcher.fetch<SentimentResponse>({
      method: 'POST',
      url: coda.withQueryParams(coda.joinUrl('language', ':analyze-text'), { 'api-version': '2022-05-01' }),
      headers: {
        'Ocp-Apim-Subscription-Key': getTokenPlaceholder('key', context),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request)
    });

    return toSentimentSchema(response.body);
  }
})

pack.addFormula({
  name: "DetectLanguage",
  description: "Detects the language a given text and returns the language code.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "text", 
      description: "The text to detect its language"
    })
  ],
  resultType: coda.ValueType.Object,
  schema: LanguageDetectionSchema,
  execute: async ([text], context) => {
    if (text?.length < 3) {
      return {
        name: 'Unknown',
        isoName: 'Uknown',
        confidenceScore: 0
      }
    }

    const request: LanguageDetectionRequest = {
      kind: "LanguageDetection",
      parameters: {
        modelVersion: 'latest',
      },
      analysisInput: {
        documents: [ {
            id: '1',
            text
          }
        ]
      }
    };

    let response = await context.fetcher.fetch<LanguageDetectionResponse>({
      method: 'POST',
      url: coda.withQueryParams(coda.joinUrl('language', ':analyze-text'), { 'api-version': '2022-05-01' }),
      headers: {
        'Ocp-Apim-Subscription-Key': getTokenPlaceholder('key', context),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request)
    });

    return toLanguageDetectionSchema(response.body);
  }
})

pack.addColumnFormat({
  name: "Sentiment", 
  instructions: "Show sentiment result of a given document",
  formulaName: "AnalyzeSentiment"
})
