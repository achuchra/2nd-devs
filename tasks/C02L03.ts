import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeTask } from "./core/initialize-task";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { OpenAIEmbeddings } from "@langchain/openai";
import { answerTask } from "./core/answer-task";

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string }>('embedding');

  const chat = new ChatOpenAI({ modelName: "gpt-4" });
  const inferredText = await chat.invoke([
    new SystemMessage(`You only analyze the text I send you and you only respond with the content which is to be further proceed. You infer what's the input for the next task based on the text you receive. You only respond with the words in double quotes (but don't return the double quotes) and nothing else. \n`),
    new HumanMessage(taskContent.msg),
  ])

  const embeddings = new OpenAIEmbeddings();
  const res = await embeddings.embedQuery(inferredText.content as string);

  answerTask(taskToken, JSON.stringify({ answer: res }), { contentType: 'application/json' });
}

runTask();
