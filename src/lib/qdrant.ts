import {QdrantClient} from "@qdrant/js-client-rest";

export const client = new QdrantClient({
  url: process.env.QDRANT_HOST,
  apiKey: process.env.QDRANT_API_KEY,
});
