import { ChatOpenAI } from "@langchain/openai";
import { initializeTask } from "./core/initialize-task";
import { BaseMessageChunk, HumanMessage, MessageContent, SystemMessage } from "langchain/schema";
import { answerTask } from "./core/answer-task";

const CURRENCY_API_URL = "http://api.nbp.pl/api/exchangerates/tables/A?format=json";
const KNOWLEDGE_API_URL = "https://restcountries.com/v3.1/all";

const chooseApi = {
  waluta: CURRENCY_API_URL,
  wiedza_o_panstwie: KNOWLEDGE_API_URL,
}

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string, question: string }>('knowledge');

  console.log(taskContent);

  const chat = new ChatOpenAI({ modelName: "gpt-4" });

  //ask chat to decide which API should it use based on the question;
  const apiToUse = await chat.invoke([
    new SystemMessage("Analizujesz pytania, które otrzymujesz i na podstawie ich treści przypisujesz do nich kategorię. Do wyboru masz 3 kategorie: 'waluta', 'wiedza o panstwie' oraz 'inne'. Jezeli pytanie dotyczy konkretnego kraju, wybierz 'wiedza o panstwie'. Jezeli pytanie dotyczy kursu walut, wybierz 'waluta'. W przeciwnym wypadku wybierz 'inne'. Odpowiadasz jedynie nazwą kategorii."),
    new HumanMessage(taskContent.question),
  ]) as { content: "waluta" | "wiedza o panstwie" | "inne" };

  let answer: BaseMessageChunk;

  switch(apiToUse.content) {
    case "waluta": {
      const currencyData = await fetch(CURRENCY_API_URL).then((response) => response.json()) as any[];
      answer = await chat.invoke([
        new SystemMessage(`Przenalizuj dane otrzymane w kontekscie i odpowiedz na pytanie. Skorzystaj tylko z danych, które otrzymałeś. Odpowiadasz krótko, jedynie wartością, którą jest odpowiedzią na pytanie. \n
        ####KONTEKST####\n
        ${JSON.stringify(currencyData)}`),
        new HumanMessage(taskContent.question)
      ]);
      break;
    }
    case "wiedza o panstwie": {
      const knowledgeData = await fetch(KNOWLEDGE_API_URL).then((response) => response.json()) as any[];
      const whichCountry = await chat.invoke([
        new SystemMessage("Odczytaj nazwę kraju, o którym mowa w pytaniu. Odpowiadasz jedynie nazwą kraju. Odpowiadasz tylko w języku ANGIELSKIM!"),
        new HumanMessage(taskContent.question),
      ]);
      const countryData = knowledgeData.find((country) => country.name.common === whichCountry.content);
      answer = await chat.invoke([
        new SystemMessage(`Na podstawie otrzymanych danych o kraju jesteś w stanie odpowiedzieć na pytanie. Odpowiadasz jedynie wartością, która jest odpowiedzią na pytanie. \n
        ###KRAJ###\n
        ${JSON.stringify(countryData)}`),
        new HumanMessage(taskContent.question)
      ]);
      break;
    }
    default: {
      answer = await chat.invoke([
        new SystemMessage("Odpowiedz na pytanie. Odpowiadasz krótko, jedynie wartością, która jest odpowiedzią na pytanie."),
        new HumanMessage(taskContent.question)
      ])
      break;
    };
  }

  await answerTask(taskToken, JSON.stringify({ answer: answer.content }));
}

runTask();