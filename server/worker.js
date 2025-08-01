import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";

import dotenv from "dotenv";

dotenv.config();

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`Job: ${job.data}`);
    const data = JSON.parse(job.data);
    // Now get the path of the data
    // Then read the pdf from the path
    // Chunk the pdf
    // Call the OpenAI to embedding the chunks
    // Store the embeddings in qdrant db

    // Load the PDF
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: process.env.OPENAI_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "pdf-rag",
      }
    );

    await vectorStore.addDocuments(docs);
    console.log("Docs are added");

    console.log("Docs: ", docs);
  },
  { concurrency: 100, connection: { host: "localhost", port: "6379" } }
);
