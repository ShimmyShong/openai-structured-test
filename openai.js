const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

console.log()

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const MeetingSetup = z.object({
  customerName: z.string(),
  technicianName: z.enum(["danny", "jordan", "ryan", "kim", "jenny", "andrew", "alex", "any"]),
  isAppointment: z.boolean().describe('True if scheduled for the future, inferred if after current date'),
  description: z.string(),
  startDatetime: z.string().describe(`Format: YYYY-MM-DDTHH:MM, e.g., 2024-10-16T11:47. When the prompt mentions "next weekend", it refers to the weekend **after** this upcoming one. If today is close to the current weekend, "next weekend" means **the following weekend**, not this one. ***AND NO SUNDAYS*** Default to current time if time is unspecified.`)
});



const openInit = async (prompt) => {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `Extract the nail salon meeting information. Currently ${new Date} the salon operates from 8am-7pm, Monday through Saturday.` },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(MeetingSetup, "customer_setup"),
  });
  const event = completion.choices[0].message.parsed;
  console.log(event);
  console.log(`Prompt tokens: ${completion.usage.prompt_tokens}, Output tokens: ${completion.usage.completion_tokens}`);
  return completion;
};

module.exports = { openInit };
