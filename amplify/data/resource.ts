import { defineData, a, type ClientSchema } from '@aws-amplify/backend';

// 📊 STAGE 1: Minimal Data Schema for Data Room
const schema = a.schema({
  // 📄 Document Model
  Document: a.model({
    name: a.string().required(),
    key: a.string().required(),
    size: a.integer(),
    type: a.string(), // PDF, TXT, etc.
    uploadedAt: a.datetime(),
    status: a.string().default('uploaded'),
    owner: a.string()
  })
  .authorization((allow) => allow.owner()),

  // 👤 User Profile Model
  UserProfile: a.model({
    email: a.string().required(),
    totalDocuments: a.integer().default(0),
    storageUsed: a.integer().default(0), // In bytes
    lastActiveAt: a.datetime(),
    owner: a.string()
  })
  .authorization((allow) => allow.owner())
});

// 🎯 Export Schema Type
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
});

console.log('📊 Stage 1: Minimal data schema configured');