import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({ apiKey: "" });

const MeetingSetup = z.object({
  customerName: z.string().describe('<customer name> w/<appointment person or any>". Example: "Sally w/Danny" if the appointment is with Danny, or "Sally w/any" if not specified.'),
  isAppointment: z.boolean().describe('dont assume appointment'),
  description: z.string(),
  startDatetime: z.string().describe(`Follow thisformat, YYYY-MM-DDTHH:MM, example: 2024-10-16T11:47`)
});

const completion = await openai.beta.chat.completions.parse({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: `Extract the meeting information. currently ${new Date} only open from 8am-7pm mon-sat` },
    { role: "user", content: "ok yeah, yep. sure thing sally, i can definitely get you an appointment at 2:30 next weekend. oh you want it 1:30 instead? sure thing. and just a gel full set right? oh you want it with danny? sure thing. okay perfect" },
  ],
  response_format: zodResponseFormat(MeetingSetup, "customer_setup"),
});

const event = completion.choices[0].message.parsed;

console.log(event)
console.log(`prompt tokens: ${completion.usage.prompt_tokens}, output tokens: ${completion.usage.completion_tokens}`)
