import { Document } from 'langchain/document';
import { initializeTask } from './core/initialize-task';
import { v4 } from 'uuid';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { answerTask } from './core/answer-task';

const COLLECTION_NAME = 'C03L05_people';

// fetch info about people from db and store so we can a question about them
const runTask = async () => {
  const { taskContent, taskToken } = await initializeTask<{
    msg: string;
    data: string;
    question: string;
  }>('people');

  const peopleInfo = (await fetch(taskContent.data).then((response) => response.json())) as Array<{
    imie: string;
    nazwisko: string;
    wiek: number;
    o_mnie: string;
    ulubiona_postac_z_kapitana_bomby: string;
    ulubiony_serial: string;
    ulubiony_film: string;
    ulubiony_kolor: string;
  }>;

  console.log(taskContent.question)

  // ask GPT-4 to tell us who is the question about
  const model = new ChatOpenAI({ modelName: 'gpt-4' });
  const { content } = await model.invoke([
    new SystemMessage(`Odczytaj imię i nazwisko, które pojawia się w pytaniu. Odpowiadasz tylko i wyłącznie imieniem i nazwiskiem jakie jest w pytaniu.`),
    new HumanMessage(taskContent.question),
  ])

  console.log(content);

  const person = peopleInfo.find((person) => `${person.imie} ${person.nazwisko}` === content);
  console.log('person?  ', person);

  const { content: answer } = await model.invoke([
    new SystemMessage(`Na podstawie otrzymanego obiektu z danymi o osobie jesteś w stanie odpowiedzieć na to pytanie: ${taskContent.question}. Klucze w obiekcie JSON informują o kategorii wartości klucza. \n
    ###przykład### \n
    { "ulubiony_film": "Titanic" } \n`),
    new HumanMessage(JSON.stringify(person)),
  ])

  await answerTask(taskToken, JSON.stringify({ answer }), { contentType: 'application/json' });
};

runTask();
