export const initializeTask = async<T>(taskName: string): Promise<{ taskToken: string, taskContent: T }> => {
  const taskToken = await getTaskToken(taskName);
  const taskContent = await getTaskContent<T>(taskToken);

  return { taskToken, taskContent };
}

const getTaskToken = async (taskName: string): Promise<string> => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: `{"apikey":"${process.env.AI_DEVS_API_KEY}"}`
  };

  const data = await fetch(`https://tasks.aidevs.pl/token/${taskName}?=`, options);

  if (data.ok) {
    const result = await data.json() as { token: string };
    return result.token;
  } else {
    console.error('Error while getting task token:', data.statusText);
    throw new Error('Error while getting task token');
  }
}

const getTaskContent = async <T>(token: string): Promise<T> => {
  const data = await fetch(`https://tasks.aidevs.pl/task/${token}`, {
    method: 'POST',
  });
  const taskContent = await data.json() as T;
  
  return taskContent;
}
