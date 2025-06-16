import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

// 🏗️ STAGE 1: Minimal Data Room Backend
export const backend = defineBackend({
  auth,
  data,
  storage
});

console.log('🏗️ Stage 1: Minimal data room backend configured');
