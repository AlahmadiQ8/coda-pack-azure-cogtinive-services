import * as coda from "@codahq/packs-sdk";

export const SentimentSchema = coda.makeObjectSchema({
  properties: {
    sentiment: { type: coda.ValueType.String, required: true }, 
    positiveScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    neutralScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    negativeScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent }
  }
})