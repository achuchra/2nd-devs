import { HumanMessage } from 'langchain/schema';
import { SystemMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeTask } from "./core/initialize-task";
import { answerTask } from './core/answer-task';


export const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string, input: string[], question: string }>('inprompt');

  const chat = new ChatOpenAI({ modelName: "gpt-4" });
  
  const nameFinder = await chat.invoke([ 
    new SystemMessage("You are an expert in reading given text and analysing its content to be able to answer questions related to that text. You always respond with the shortest answer possible without further explanations"),
    new HumanMessage(`Find a name inside the question I send you and respond back only with the name and nothing else. \n 
    Question: ${taskContent.question}.`),
  ]);

  const filteredContext = taskContent.input.filter(sentence => sentence.includes(nameFinder.content as string));

  const finalResponse = await chat.invoke([
    new SystemMessage(`You only respond based on the context I provide. You don't use any of the knowledge you possess beside the context I give you. You always answer in polish language. \n
    ###CONTEXT### \n
    ${filteredContext.join('\n')}`),
    new HumanMessage(taskContent.question)
  ]);

  answerTask(taskToken, `{"answer": "${finalResponse.content}"}`);
};

runTask();