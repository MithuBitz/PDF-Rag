import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import dotenv from "dotenv";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

const myQueue = new Queue("file-upload-queue", {
  connection: { host: "localhost", port: "6379" },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: "http://localhost:6333",
  collectionName: "pdf-rag",
});

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  return res.json({ status: "Done: 👍" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  // Implement the BullMQ
  await myQueue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ message: "Uploaded" });
});

app.get("/chat", async (req, res) => {
  const userQuery = "What is Step-Back Prompting";
  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);

  

  return res.json(result);
});

app.listen(8000, () => console.log(`Server running on PORT : ${8000}`));
