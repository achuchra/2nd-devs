import { answerTask } from './core/answer-task';
import { initializeTask } from './core/initialize-task';

const renderFormUrl = 'https://get.renderform.io/api/v2/render';
const renderFormTemplateId = 'small-geckos-march-happily-1352';

const runTask = async () => {
  const { taskToken, taskContent } = await initializeTask<{
    msg: string;
    text: string;
    image: string;
  }>('meme');

  // console.log(taskContent);

  // const options = {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'X-API-KEY': process.env.RENDERFORM_API_KEY! },
  //   data: `{
  //     "template": "${renderFormTemplateId}",
  //     "data": {
  //       "title.text": "${taskContent.text}",
  //       "image_1.src": "${taskContent.image}"
  //     },
  //   }`
  // };

  // const image = await fetch(renderFormUrl, options).then(async (res) => {
  //   if (res.ok) {
  //     return (await res.json()) as { href: string };
  //   } else {
  //     console.log("res", res);
  //     throw res;
  //   }
  // });

  // console.log(image);
  const url = `https://cdn.renderform.io/qU7GcMjzJmiWPi4Aqjzf/results/req-3b919a4e-b941-45ff-b5df-efaf6f041294.jpg`;
  await answerTask(taskToken, JSON.stringify({ answer: url }));
};

runTask();
