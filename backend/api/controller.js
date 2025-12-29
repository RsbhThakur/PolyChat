const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");
const { CohereClientV2 } = require("cohere-ai");
const dotenv = require("dotenv");
dotenv.config();

const handleChat = async (req, res) => {
  const { message, model, chatId } = req.body;

  try {
    // TODO: Implement chat logic
    if(model.includes('gpt')) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      async function main() {
        const response = await client.responses.create({
          model: model,
          input: message,
        });
        // console.log(response.output_text);
        res.json({model: model, response: response.output_text });
        
      }
      await main();
    } 

    else if(model.includes('gemini')) {
      const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
      async function main() {
        const response = await ai.models.generateContent({
          model: model,
          contents: message,
        });
        // console.log(response.text);
        res.json({ model: model, response: response.text });
      }
      await main();
    }

    else if(model.includes('command')) {
      const cohere = new CohereClientV2({
        token: process.env.COHERE_API_KEY,
      });
      async function main() {
        const response = await cohere.chat({
          model: model,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        });
        // console.log(response.message.content);
        res.json({model: model, response: response.message.content[0].text});
      }
      await main();
    }
  } catch (error) {
    res
    .json({ response: "Error handling chat", error: error.message });
  }
};

module.exports = {
  handleChat,
};
