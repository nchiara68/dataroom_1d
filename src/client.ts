import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";

// 🔧 Generate Amplify client with proper typing
export const client = generateClient<Schema>({ authMode: "userPool" });

console.log('✅ Client configured for Stage 1');