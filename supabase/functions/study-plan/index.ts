import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// mode: "timetable" | "recovery"
// payload: { mode, subjects, dailyHours, preferredStart, missedBlocks?, today, horizonDays }
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode } = payload;

    const systemPrompt =
      mode === "recovery"
        ? `You are an expert study planner. The student has MISSED study blocks. Redistribute the missed topics into upcoming days (starting from tomorrow), respecting their daily study hours and exam dates. Avoid the past. Group sensibly. Prioritize subjects with the closest exam date and weak subjects first.`
        : `You are an expert study planner. Build an optimal day-by-day timetable from today until each subject's exam date. Respect daily study hour budget. Weak subjects get ~40% more time. Subjects with closer exams get higher priority. Distribute realistic 45-90 min blocks. Use varied topics like "Revision", "Practice problems", "Concept building", "Mock test" appropriately as exam approaches.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_schedule",
          description: "Return generated study blocks.",
          parameters: {
            type: "object",
            properties: {
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", description: "YYYY-MM-DD" },
                    startTime: { type: "string", description: "HH:MM 24h" },
                    endTime: { type: "string", description: "HH:MM 24h" },
                    subject: { type: "string" },
                    topic: { type: "string" },
                  },
                  required: ["date", "startTime", "endTime", "subject", "topic"],
                  additionalProperties: false,
                },
              },
              summary: { type: "string", description: "1-2 line summary in Hinglish" },
            },
            required: ["blocks", "summary"],
            additionalProperties: false,
          },
        },
      },
    ];

    const userPrompt = JSON.stringify(payload, null, 2);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "create_schedule" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again soon." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No plan returned");
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
