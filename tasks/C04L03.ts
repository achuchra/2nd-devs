import { ChatOpenAI } from '@langchain/openai';
import { initializeTask } from './core/initialize-task';
import { HumanMessage } from 'langchain/schema';
import OpenAI from 'openai';
import { answerTask } from './core/answer-task';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string; url: string }>('gnome');

  console.log(taskContent);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: taskContent.msg },
          {
            type: 'image_url',
            image_url: {
              url: taskContent.url,
            },
          },
        ],
      },
    ],
  });
  const answer = response.choices[0].message.content;

  await answerTask(taskToken, JSON.stringify({ answer }));
};

runTask();
