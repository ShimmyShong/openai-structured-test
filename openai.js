const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

console.log()

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const MeetingSetup = z.object({
  customerName: z.string(),
  technicianName: z.enum(["danny", "jordan", "ryan", "kim", "jenny", "andrew", "alex", "any"]),
  isAppointment: z.boolean().describe('dont assume appointment'),
  description: z.string(),
  startDatetime: z.string().describe(`Follow: YYYY-MM-DDTHH:MM, example: 2024-10-16T11:47. Use current time if not specified`)
});

const openInit = async (prompt) => {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `Extract the nail salon meeting information. currently ${new Date} only open from 8am-7pm mon-sat` },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(MeetingSetup, "customer_setup"),
  });
  const event = completion.choices[0].message.parsed;
  console.log(event)
  console.log(`prompt tokens: ${completion.usage.prompt_tokens}, output tokens: ${completion.usage.completion_tokens}`)
}

module.exports = { openInit }