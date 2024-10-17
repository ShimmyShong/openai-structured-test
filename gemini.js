const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const { openInit } = require('./openai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
  description: `Extract and organize meeting details from voice-recorded, unstructured text.`,
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      customerName: {
        type: SchemaType.STRING,
        description: `The full name of the customer booking the service. This can include additional context if part of a sentence, such as 'with technician name'.
Example: 'Jeremy with Jenny' or 'Asha appointment with Kim'.`
      },
      technicianName: {
        type: SchemaType.STRING,
        description: `The name of the technician providing the service. This may be inferred from the sentence structure or explicitly stated.
Example: In 'Jeremy with Jenny', 'Jenny' would be the technician's name. If not explicitly mentioned, attempt to infer the name from context, or leave blank if unavailable.`
      },
      isAppointment: {
        type: SchemaType.BOOLEAN,
        description: `Indicates if the service is a scheduled appointment. True if the date is in the future or inferred from words like 'next', 'tomorrow', or specific dates/times.
Example: If the text says 'next Tuesday' or 'at 2:20', set this field to True. Set it to False for walk-ins or if no specific date/time is mentioned.`
      },
      description: {
        type: SchemaType.STRING,
        description: `A brief description of the service requested. This includes the type of service and any related phrases that clarify the nature of the appointment.
Example: 'pedicure', 'gel set', or 'manicure with Jenny'. Capture any relevant detail about the service.`
      },
      startDatetime: {
        type: SchemaType.STRING,
        description: `The specific date and time of the appointment. Infer this from phrases like 'next weekend', 'tomorrow', or any specific times mentioned in the text.
Expected format: YYYY-MM-DDTHH:MM. 
Example: 
- If the text says 'next Tuesday at 2:20', the date would be inferred as '2024-10-22T14:20' (assuming today's date is October 16, 2024).
- For 'next weekend', if today's date is Wednesday, October 16, 2024, 'next weekend' would be interpreted as the upcoming Saturday, i.e., '2024-10-26T14:00' for Saturday. Sundays CANNOT be included as the salon is closed on Sundays (time inferred if not mentioned). Default to the current time if no specific time is provided.`
      }
    },
    required: ["customerName", "technicianName", "isAppointment", "description", "startDatetime"]
  }
};



const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema
  }
});

const geminiInit = async (prompt) => {
  try {
    const result = await model.generateContent(`It is currently ${new Date().toISOString()} and the salon is open from 8am - 7pm Monday to Saturday.Please extract the customer name, technician name, service description, appointment status, and start time for the following nail salon meeting information: ${prompt}`);
    console.log(JSON.parse(result.response.text())[0])
    console.log(`tokens: ${result.response.usageMetadata.promptTokenCount}`)
    return { ...JSON.parse(result.response.text())[0], model: "gemini-1.5-flash" }
  } catch (err) {
    const completion = await openInit(prompt)
    return { ...completion.choices[0].message.parsed, model: "gpt-4o-mini" }
  }
}

module.exports = { geminiInit }