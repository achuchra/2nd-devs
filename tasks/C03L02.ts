import { TextLoader } from 'langchain/document_loaders/fs/text';
import { initializeTask } from './core/initialize-task';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { writeFileSync } from 'fs';
import { answerTask } from './core/answer-task';

export const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{
    msg: string;
    input: string;
    question: string;
  }>('scraper');

  const localPath = './tasks/assets/c03l02_context.md';

  const file = await fetch(taskContent.input, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', } }).catch((err) => {
    console.log('An error occured while getting the context');
    console.log(err.message);
    fetch(taskContent.input).catch((err) => {
      console.log('An error occured twice while getting the context');
      console.log(err.message);
      throw new Error('Too many unsuccesful attempts to fetch the context. Exiting.');
    });
  });

  if (file && file.body) {
    const buffer = await file.arrayBuffer();
    writeFileSync(localPath, Buffer.from(buffer));
  }

  const loader = new TextLoader(localPath);
  const [doc] = await loader.load();
  const chat = new ChatOpenAI();
  
  const { content } = await chat.invoke([
    new SystemMessage(`
        Answer questions as truthfully using the context below and nothing more. If you don't know the answer, say "don't know". You only answer in polish language.
        context###${doc.pageContent}###
    `),
    new HumanMessage(taskContent.question),
  ]);

  await answerTask(taskToken, JSON.stringify({ answer: content }));
};

runTask();
