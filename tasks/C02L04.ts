import { initializeTask } from "./core/initialize-task";
import { writeFileSync } from "fs";
import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
import { answerTask } from "./core/answer-task";

const getFilePathLocal = async () => {
  const { taskToken, taskContent } = await initializeTask<{ msg: string }>('whisper');
  const localPath = './tasks/assets/mateusz.mp3';
  const path = taskContent.msg.split('file: ')[1];

  const file = await fetch(path);

  if (file && file.body) {
    const buffer = await file.arrayBuffer();
    writeFileSync(localPath, Buffer.from(buffer));
    return { localPath, taskToken }
  }
}

getFilePathLocal()
.then(async data => {
  if (data?.localPath && data?.taskToken) {
    const { localPath, taskToken } = data;
    console.log('File downloaded successfully:', localPath);
    
    const loader = new OpenAIWhisperAudio(data.localPath);
    const docs = await loader.load() as Array<{ pageContent: string, metadata: { source: string } }>;

    console.log(docs[0].pageContent);

    await answerTask(taskToken, JSON.stringify({ answer: docs[0].pageContent }));
  }
});


