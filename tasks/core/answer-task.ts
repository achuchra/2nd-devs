export const answerTask = async (taskToken: string, answer: any, options?: { contentType: string }): Promise<void> => { 
  console.log('sending answer: ', answer);
  const config = {
    method: 'POST',
    headers: { 'Content-Type': options?.contentType || 'text/plain'},
    body: answer,
  };

  fetch(`https://tasks.aidevs.pl/answer/${taskToken}`, config)
    .then((response) => response.text())
    .then((result) => {
      console.log('Answer result:', result);
    })
    .catch((error) => {
      console.error('Error while answering the task:', error);
    });
}