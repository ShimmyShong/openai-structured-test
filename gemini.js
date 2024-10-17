const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const { openInit } = require('./openai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
  description: `Meeting details`,
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      customerName: {
        type: SchemaType.STRING,
        description: "Name of customer"
      },
      technicianName: {
        type: SchemaType.STRING,
        description: "Name of technician"
      },
      isAppointment: {
        type: SchemaType.BOOLEAN,
        description: "is an appointment if set after current time"
      },
      description: {
        type: SchemaType.STRING,
        description: "Description of the appointment"
      },
      startDatetime: {
        type: SchemaType.STRING,
        description: "Follow format: YYYY-MM-DDTHH:MM, example: 2024-10-16T11:47. Use current time if not specified"
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
  for (i = 0; i < 10; i++) {
    try {
      const result = await model.generateContent(`Extract the nail salon meeting information. Currently ${new Date()} only open from 8am-7pm mon-sat: ${prompt}`);
      console.log(JSON.parse(result.response.text()))
      console.log(`tokens: ${result.response.usageMetadata.promptTokenCount}`)
    } catch (err) {
      await openInit(prompt)
    }
  }
}

module.exports = { geminiInit }