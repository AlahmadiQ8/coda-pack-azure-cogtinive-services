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
  description: "Get the sentiment of a given text (Positive, Negative, Neutral).",
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

// A formula to fetch information about a repo.
// pack.addFormula({
//   name: "Repo",
//   description: "Get information about a repo from it's URL.",
//   parameters: [
//     coda.makeParameter({
//       type: coda.ParameterType.String,
//       name: "url",
//       description: "The URL of the repo.",
//     }),
//   ],
//   resultType: coda.ValueType.Object,
//   schema: RepoSchema,
//   execute: async function ([url], context) {
//     let { owner, name } = parseRepoUrl(url);
//     let response = await context.fetcher.fetch({
//       method: "GET",
//       url: `https://api.github.com/repos/${owner}/${name}`,
//     });
//     let repo = response.body;
//     return repo;
//   },
// });

// A column format that automatically applies the Repo() formula.
// pack.addColumnFormat({
//   name: "Repo",
//   instructions: "Show details about a GitHub repo, given a URL.",
//   formulaName: "Repo",
//   matchers: [RepoUrlRegex],
// });

// An action formula that allows a user to star a repo.
// pack.addFormula({
//   name: "Star",
//   description: "Add a star to a repo.",
//   parameters: [
//     coda.makeParameter({
//       type: coda.ParameterType.String,
//       name: "url",
//       description: "The URL of the repo.",
//     }),
//   ],
//   resultType: coda.ValueType.Boolean,
//   isAction: true,
//   execute: async function ([url], context) {
//     let { owner, name } = parseRepoUrl(url);
//     let response = await context.fetcher.fetch({
//       method: "PUT",
//       url: `https://api.github.com/user/starred/${owner}/${name}`,
//     });
//     return true;
//   },
// });

// A sync table that lists all of the user's repos.
// pack.addSyncTable({
//   name: "Repos",
//   description: "All of the repos that the user has access to.",
//   identityName: "Repo",
//   schema: RepoSchema,
//   formula: {
//     name: "SyncRepos",
//     description: "Sync the repos.",
//     parameters: [],
//     execute: async function ([], context) {
//       // Get the page to start from.
//       let page = (context.sync.continuation?.page as number) || 1;

//       // Fetch a page of repos from the GitHub API.
//       let url = coda.withQueryParams("https://api.github.com/user/repos", {
//         page: page,
//         per_page: PageSize,
//       });
//       let response = await context.fetcher.fetch({
//         method: "GET",
//         url: url,
//       });
//       let repos = response.body;

//       // If there were some results, re-run this formula for the next page.
//       let continuation;
//       if (repos.length > 0) {
//         continuation = { page: page + 1 };
//       }

//       // Return the repos and the continuation (if any).
//       return {
//         result: repos,
//         continuation: continuation,
//       };
//     },
//   },
// });

// A helper function that parses a repo URL and returns the owner and name.
// function parseRepoUrl(url) {
//   let match = url.match(RepoUrlRegex);
//   if (!match) {
//     throw new coda.UserVisibleError("Invalid repo URL: " + url);
//   }
//   return {
//     owner: match[1],
//     name: match[2],
//   };
// }

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
