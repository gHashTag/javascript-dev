import { client } from "./utils/client.ts";

interface QuestionContext {
  lesson_number: number;
  subtopic: number;
}

async function getQuestion(ctx: QuestionContext) {
  const supabaseClient = client();

  const { lesson_number, subtopic } = ctx;

  const { data, error } = await supabaseClient
    .from("javascript")
    .select("*")
    .eq("lesson_number", lesson_number)
    .eq("subtopic", subtopic);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export { getQuestion };
