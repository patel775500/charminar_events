import type { RequestHandler } from "express";

interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing OPENROUTER_API_KEY" });
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25000);
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // Helpful to pass host metadata for rate limits/attribution
        "HTTP-Referer": req.headers.origin || "http://localhost:5173",
        "X-Title": "Charminar Event Assistant",
      },
      body: JSON.stringify({ model, messages }),
      signal: ctrl.signal,
    }).catch((err)=>{
      throw new Error(`Network error to OpenRouter: ${err?.message || String(err)}`);
    }).finally(()=> clearTimeout(t));

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: "OpenRouter error", detail: text });
    }

    const data = (await resp.json()) as any;
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) {
      return res.status(200).json({ message: "I'm having trouble reaching the AI service right now. Meanwhile, go to /organizer to create (auto-approve if no clash) or /customer to browse genres and book (max 10)." });
    }
    return res.json({ message: content });
  } catch (err: any) {
    console.error("/api/chat error:", err);
    return res.status(500).json({ error: "Chat proxy failed", detail: String(err?.message || err) });
  }
};
