import { client } from "../utils/client.ts";

Deno.serve(async (req) => {
  const supabase = client(req);
  try {
    const { lesson_number } = await req.json();
    const { data, error } = await supabase
      .from("javascript")
      .select("subtopic")
      .eq("lesson_number", lesson_number)
      .order("subtopic", { ascending: false })
      .limit(1);

    if (error) throw error;

    const result = data.length > 0 ? data[0].subtopic : null;

    return new Response(JSON.stringify({ maxSubtopic: result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
