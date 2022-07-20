import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();

pack.addNetworkDomain("azure.com");

pack.setUserAuthentication({
  type: coda.AuthenticationType.Custom,
  requiresEndpointUrl: true,
  params: [
    {name: "key", description: "API Key for the Azure language resource. You can find your key and endpoint by navigating to your resource's Keys and Endpoint page, under Resource Management."},
  ],
});

const SentimentSchema = coda.makeObjectSchema({
  properties: {
    sentiment: { type: coda.ValueType.String, required: true }, 
    positiveScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    neutralScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    negativeScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent }
  }
})

const toSentimentSchema = (sentimentResponse: SentimentResponse) => {
  const document = sentimentResponse.results.documents[0];
  return {
    sentiment: document.sentiment,
    positiveScore: document.confidenceScores.positive,
    neutralScore: document.confidenceScores.neutral,
    negativeScore: document.confidenceScores.negative,
  }
}

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

    const request: AnalysisRequest = {
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

pack.addColumnFormat({
  name: "Sentiment", 
  instructions: "Show sentiment result of a given document",
  formulaName: "AnalyzeSentiment"
})

function getTokenPlaceholder(token: string, context: coda.ExecutionContext): string {
  return `{{${token}-${context.invocationToken}}}`;
}

interface SentimentResponse {
  kind: string;
  results: Results;
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

interface AnalysisRequest {
  kind:          string;
  parameters:    SentimentParameters;
  analysisInput: AnalysisInput;
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
