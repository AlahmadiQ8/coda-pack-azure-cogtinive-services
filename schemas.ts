import * as coda from "@codahq/packs-sdk";

export const SentimentSchema = coda.makeObjectSchema({
  properties: {
    sentiment: { type: coda.ValueType.String, required: true }, 
    positiveScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    neutralScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent },
    negativeScore: { type: coda.ValueType.Number, codaType: coda.ValueHintType.Percent }
  },
  featuredProperties: ['sentiment'],
  displayProperty: 'sentiment'
})

export const LanguageDetectionSchema = coda.makeObjectSchema({
  properties: {
    name: { type: coda.ValueType.String, required: true },
    isoName: { type: coda.ValueType.String, required: true },
    confidenceScore: { type: coda.ValueType.Number, required: true, codaType: coda.ValueHintType.Percent },
  },
  featuredProperties: ['name'],
  displayProperty: 'name'
})