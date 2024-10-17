const { geminiInit } = require('./gemini')
const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

const fs = require('fs')

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const isAppointmentClear = z.object({
  isClear: z.boolean().describe('Check if the appointment is understandable')
});

let answerArray = [];
const testPrompts = [
  "Can I schedule three pedicures for me and my friends on Friday at 3 PM?",
  "I need a manicure with Jenny next Monday morning at 10.",
  "Book me for a quick gel set, um, for tomorrow around noon. Doesn't matter who does it.",
  "Hey, can I get a pedi for Saturday? Preferably around 4 PM.",
  "Schedule an oil change for my car next Tuesday at 2 PM.",
  "I need four manicures for next Wednesday at 2:00, any tech is fine.",
  "Hi, can I book a haircut for 5 PM tomorrow?",
  "Pedicure with Danny at 2 PM tomorrow, please.",
  "I need a couple of gel manicures for Thursday around noon.",
  "Can I get a gel set done for my dog on Saturday? Haha, just kidding! But I need one for me at 1 PM.",
  "Schedule me and my sister for two pedicures on Sunday at 11 AM.",
  "I want to book five manicures for Thursday at 3 PM.",
  "Book a massage for me on Friday at 4:00 PM.",
  "Can you schedule an appointment for a gel manicure with Danny on Monday afternoon at 2:30?",
  "I need a hair appointment for 10 AM this Saturday.",
  "Schedule a pedi with Alex, um, next Wednesday at 5 PM.",
  "Can I get a couple of pedicures for this Saturday morning at 9?",
  "Hey, can I come in for a walk-in around 2 PM today for a gel set?",
  "Can I schedule a pedicure with Jenny on Friday morning at 10:30?",
  "Book me a nail service for tomorrow at 3:00.",
  "Can I come in for an eyebrow waxing on Thursday at 5:00?",
  "I’d like to book three pedicures for Sunday afternoon at 1 PM. Any technician is fine.",
  "Schedule an oil change for my car at 8 AM on Wednesday.",
  "Manicure for next Tuesday at 11, with anyone who's free.",
  "I need a pedi, for 4 PM today, anyone available?",
  "Book me for four pedicures this Friday at noon.",
  "Can I schedule a full set for tomorrow morning at 10 AM with Alex?",
  "I need a haircut for Friday, 6 PM.",
  "Schedule a pedi and manicure with Jenny on Monday morning at 9 AM.",
  "I need to book a massage for Saturday at 3 PM.",
  "Can you put me down for a nail appointment with Danny for next Friday at 10:00 AM?",
  "I need three pedicures and one gel manicure, anyone available, next Tuesday around noon?",
  "Pedicure at 1:00 PM on Friday, with whoever’s free.",
  "Can I come in for a quick manicure tomorrow at 11:00 AM?",
  "I'd like to schedule an appointment for five people to get their nails done on Thursday afternoon at 2:00.",
  "Book me and my mom for a mani-pedi this Saturday at 10 AM.",
  "Schedule a pedi for me with Danny at 4 PM next Thursday.",
  "Hi, can I get a gel manicure tomorrow around 10:00 AM?",
  "Schedule a full set for 2:00 PM on Sunday. Anyone can do it.",
  "Book me a haircut with Jordan for next Tuesday at 3 PM.",
  "I'd like to get a pedicure done today at 1:00 PM, if that's possible.",
  "Can you schedule a mani-pedi for me and a friend for 5 PM tomorrow?",
  "I'd like to schedule a gel set for Saturday afternoon at 3:30 PM, anyone available?",
  "Hey, can you book me a massage for next Thursday at noon?",
  "Schedule two manicures and a pedicure for Tuesday at 11:30 AM.",
  "I want to book an eyebrow tinting for Friday morning at 9.",
  "Can I get a quick mani at 2 PM today?",
  "Book me and my friend for two pedicures tomorrow at noon, anyone’s fine.",
  "I need a haircut for Sunday afternoon at 3:00 PM.",
  "Can I get a gel set done on Thursday at 11 AM, preferably with Jenny?",
  "Hey, can I come in for a massage on Wednesday at 2:00 PM?",
  "Can you book me for a nail appointment next Tuesday at 10 AM?",
  "Schedule a nail art session for me with Danny, Saturday at noon."
];

const init = async (prompt) => {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Check if this prompt has enough understandable information to create a proper nail salon appointment. **MUST HAVE A DATE AND TIME AND NUMBER OF SERVICES**` },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(isAppointmentClear, "appointment-detailed"),
    });
    const event = completion.choices[0].message.parsed;
    console.log(event.isClear)
    console.log(`Prompt tokens: ${completion.usage.prompt_tokens}, Output tokens: ${completion.usage.completion_tokens}`);
    if (!event.isClear) return
    answerArray.push(await geminiInit(prompt))
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    fs.writeFile('answers.json', JSON.stringify(answerArray, null, 2), function (err) {
      if (err) throw err;
      console.log('Works!')
    })
  }
}

testPrompts.forEach((testPrompt) => {
  init(testPrompt)
})