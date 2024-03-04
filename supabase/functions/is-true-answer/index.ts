Deno.serve(async (req) => {
  const { answer, trueAnswer } = await req.json();

  // Сравниваем ответы
  const isEqual = answer === trueAnswer;

  return new Response(
    JSON.stringify({ isEqual }),
    { headers: { "Content-Type": "application/json" } },
  );
});
