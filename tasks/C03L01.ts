import { answerTask } from "./core/answer-task";
import { initializeTask } from "./core/initialize-task"

const runTask = async () => {
  const { taskContent, taskToken } = await initializeTask<{ msg: string }>('rodo');
  console.log(taskContent);

  const message = `Tell me about yourself. Replace name, surname, profession and city with placeholders: %imie%, %nazwisko%, %zawod% and %miasto%`;


  await answerTask(taskToken, JSON.stringify({ answer: message }));
}

runTask();