import { answerTask } from "./core/answer-task";
import { initializeTask } from "./core/initialize-task"

const runTask = async () => {
  const { taskContent, taskToken } = await initializeTask<{ msg: string }>('functions');
  console.log(taskContent);

  const functionDefinition = {
    name: 'addUser',
    description: 'This function adds a new user to the database',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        surname: {
          type: 'string',
        },
        age: {
          type: 'number',
        }
      }
    }
  }

  await answerTask(taskToken, JSON.stringify({ answer: functionDefinition }));
}

runTask();