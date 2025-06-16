import { defineStorage } from '@aws-amplify/backend';

// 📁 STAGE 1: S3 Storage Configuration - Following reference project pattern
export const storage = defineStorage({
  name: 'dataRoomDocuments',
  access: (allow) => ({
    // 👤 Allow authenticated users to manage files in documents folder
    'documents/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ]
  })
});

console.log('📁 Stage 1: S3 storage configured with documents access');