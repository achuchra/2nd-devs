import { QdrantClient } from '@qdrant/js-client-rest';
import { initializeTask } from './core/initialize-task';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { v4 } from 'uuid';
import { answerTask } from './core/answer-task';

const COLLECTION_NAME = 'C03L04_search';

const runTask = async () => {
  const { taskContent, taskToken } = await initializeTask<{ msg: string; question: string }>(
    'search'
  );

  console.log(taskContent);

  // initialize qdrant client and embeddings in open ai
  const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
  const embeddings = new OpenAIEmbeddings();

  // get collections and check if there is a collection with the name COLLECTION_NAME
  const collections = await qdrant.getCollections();
  const indexed = collections.collections.find((collection) => collection.name === COLLECTION_NAME);

  // if not, create that collection
  if (!indexed) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: 1536, distance: 'Cosine', on_disk: true },
    });
  }

  // get task file form taskContent
  const taskFilePath = taskContent.msg.split(' - ')[1];
  console.log(taskFilePath);

  const fileContent = await fetch(taskFilePath).then(
    (response) =>
      response.json() as Promise<Array<{ title: string; url: string; info: string; date: string }>>
  );

  // save each info in a langchain document with metadata
  const documents: Document[] = [];
  fileContent.forEach(async (content) => {
    const document = new Document({ pageContent: content.info });
    document.metadata.source = COLLECTION_NAME;
    document.metadata.content = document.pageContent;
    document.metadata.uuid = v4();
    document.metadata.title = content.title;
    document.metadata.url = content.url;
    document.metadata.date = content.date;

    documents.push(document);
  });

  // BELOW ONCE IS ENOUGH 
  // generate embeddings for each document
  // const points = [];
  // for (const document of documents) {
  //   const [embedding] = await embeddings.embedDocuments([document.pageContent]);
  //   points.push({
  //     id: document.metadata.uuid,
  //     payload: document.metadata,
  //     vector: embedding,
  //   });
  // }

  // call upsert on qdrant collection
  // await qdrant.upsert(COLLECTION_NAME, {
  //   wait: true,
  //   batch: {
  //     ids: points.map((point) => point.id),
  //     vectors: points.map((point) => point.vector),
  //     payloads: points.map((point) => point.payload),
  //   },
  // });
  // ABOVE ONCE IS ENOUGH

  // search for the closest document to the question
  const search = await qdrant.search(COLLECTION_NAME, {
    vector: await embeddings.embedQuery(taskContent.question),
    limit: 1,
    filter: {
      must: [
        {
          key: 'source',
          match: {
            value: COLLECTION_NAME,
          },
        },
      ],
    },
  });

  // answer task with the url of the closest document
  console.log("search", search);
  if (search && search.length > 0) {
    const answer = search[0].payload?.["url"];
    
    if (answer) {
      await answerTask(taskToken, JSON.stringify({ answer }));
    }
  }
};
  
  runTask();
