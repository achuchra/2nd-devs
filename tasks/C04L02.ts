import { ChatOpenAI } from '@langchain/openai';
import { initializeTask } from './core/initialize-task';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { answerTask } from './core/answer-task';

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{
    msg: string;
    'example for ToDo': string;
    'example for Calendar': string;
    question: string;
  }>('tools');

  const chat = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' }).bind({
    response_format: {
      type: 'json_object',
    },
  });

  console.log(`question: ${taskContent.question}`);

  const now = new Date();
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const { content: answer } = (await chat.invoke([
    new SystemMessage(
      `Jesteś ekspertem w przypisywaniu poszczególnych obowiązków i zadań do odpowiedniej kategorii. Na podstawie wiadomości uzytkownika przypisujesz odpowiednią kategorię oraz zwracasz odpowiedź w formacie JSON. Daty zawsze zwracasz w formacie YYYY-MM-DD \n
      ###PRZYKŁADY###\n
      ${taskContent['example for ToDo']}\n
      ${taskContent['example for Calendar']}\n
      ###KONTEKST###\n
      Dziś jest ${today}. Dziś jest poniedziałek.`
    ),
    new HumanMessage(taskContent.question),
  ])) as { content: string };

  await answerTask(taskToken, JSON.stringify({ answer: JSON.parse(answer) }));
};

runTask();
