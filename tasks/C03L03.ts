//whoami

import { ChatOpenAI } from "@langchain/openai";
import { initializeTask } from "./core/initialize-task";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { answerTask } from "./core/answer-task";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { writeFileSync } from "fs";

// get searched person's name and surname by different hints provided from multiple calls to initialize task.
// gather those in a single context;
const runTask = async () => {
  // load current context.md
  const loader = new TextLoader("./tasks/assets/c03l03_context.md");
  const [doc] = await loader.load();
  const currentContext = doc.pageContent;

  // initialize task
  const { taskToken, taskContent } = await initializeTask<{ msg: string, hint: string }>('whoami');

  // add next hint to the context
  const newContext = currentContext ? `${currentContext}\n${taskContent.hint}` : taskContent.hint;

  // save new context to the file
  const newContextPath = './tasks/assets/c03l03_context.md';
  writeFileSync(newContextPath, newContext);

  // load new context file
  const newLoader = new TextLoader(newContextPath);
  const [updatedDoc] = await newLoader.load();
  console.log(updatedDoc.pageContent);

  // ask gpt-4 who is described in the context
  const chat = new ChatOpenAI({ modelName: "gpt-4" });

  const { content } = await chat.invoke([ 
    new SystemMessage('Uwielbiam zagadki. Rozpoznaję osoby po opisie na ich temat, który otrzymam. Odpowiadam tylko wtedy gdy mam absolutną pewność kto jest opisywany. Jeśli nie jestem pewny, odpowiadam "Nie wiem". Jeśli znam odpowiedź, odpowiadam jedynie imieniem i nazwiskiem tej osoby.'),
    new HumanMessage(updatedDoc.pageContent),
  ]);

  if (content === 'Nie wiem.') {
    await runTask();
  } else {
    await answerTask(taskToken, JSON.stringify({ answer: content }));
  }
}

runTask();