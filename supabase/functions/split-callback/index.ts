Deno.serve(async (req) => {
  const { path } = await req.json();

  // Применяем split к пути
  const parts = path.split("_");

  return new Response(
    JSON.stringify(parts),
    { headers: { "Content-Type": "application/json" } },
  );
});
