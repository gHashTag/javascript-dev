async function getAiFeedback(query: string) {
  const response = await fetch(
    "https://flowiseai-railway-production-758e.up.railway.app/api/v1/prediction/46937ed0-41df-4c9c-80f9-f3056a1b81c9",
    {
      headers: {
        Authorization: "Bearer CD5cto1S80tZjGQ7zlfo9YQptD5F9DJN23i82t34aeE=",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ question: query }),
    },
  );
  const result = await response.json();
  return result.text;
}

export { getAiFeedback };
