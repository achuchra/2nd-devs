import { answerTask } from './core/answer-task';
import { initializeTask } from './core/initialize-task';

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string }>('ownapi');

  console.log(taskContent);
  await answerTask(taskToken, JSON.stringify({ answer: "https://tutel.com.pl/call-gpt" }));
};

runTask();
