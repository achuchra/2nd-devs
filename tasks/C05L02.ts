import OpenAI from 'openai';
import bigJson from './core/assets/c05l02_context_big.json';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { answerTask } from './core/answer-task';
import { initializeTask } from './core/initialize-task';

const data = bigJson as Record<string, string[]>;

const chat = new ChatOpenAI({ modelName: 'gpt-4' });

const names = Object.keys(data);

let answer = '';

const runTask = async () => {
  // get details for each person seperately
  await (async function () {
    for await (const name of names) {
      const { content } = await chat.invoke([
        new SystemMessage(`Jestes detektywem, ktory zbiera informacje o osobach. Jestes w stanie przeanalizowac informacje o danej osobie i zwrocic je w skroconej formie nie gubiac zadnej informacji oraz nie dodajac nic wiecej. Upewnij sie, ze skrocona wersja zawiera wszystkie informacji, o ktore moze pozniej zapytac ktos inny. Odpowiadasz jedynie tekstem zaczynajac od frazy "Poczatek informacji o <imie>" i konczysz fraza "Koniec informacji o <imie>". Bazujesz jedynie na informacjach otrzymanych od uzytownika. Otrzymujesz informacje w formacie JSON, gdzie kluczem jest imie osoby, a wartoscia tabela z informacjami na jej temat. \n
        ###PRZYKLADOWY KONTEKST### \n
        { "Jan": "Urodzil sie w 1990 roku w miescie Warszawa. Studiowal i jest absolwentem Politechniki Warszawskiej." }
        ### \n
        ###PRZYKLADOWA ODPOWIEDZ### \n
        Poczatek informacji o Janie. Urodzony w 1990 roku w Warszawie. Absolwent Politechniki Warszawskiej. Koniec informacji o Janie.`),
        new HumanMessage(
          `Przeanalizuj i zwroc skroconwa wersje informacji dla tych danych: \n ${JSON.stringify(data[name])}`
        ),
      ]);

      answer += content;
    }
  })();

  const { taskToken } = await initializeTask<{ msg: string; text: string; image: string }>(
    'optimaldb'
  );
  answerTask(taskToken, JSON.stringify({ answer }));
};

runTask();


