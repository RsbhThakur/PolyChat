const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");
const { CohereClientV2 } = require("cohere-ai");
const mongoose = require("mongoose");
const Chat = require('./model');
const dotenv = require("dotenv");
dotenv.config();

const postData = async (req, res) => {
  try{
    const {title, messages} = req.body;
    var newMsg = await Chat.findOne({title: title}).exec();
    if(!newMsg){
      newMsg = new Chat({title: title, messages: messages});
    } else{
      newMsg.messages = messages;
    }
    await newMsg.save();
    res
    .status(200)
    .json({response: "Chat saved!"})
  } catch (error){
    res.json({ response: "Error handling chat", error: error.message });
  }
};

const getData = async (req, res) => {
  try{
    const messages = await Chat.find();
    res.json(messages);
  } catch(error){
    res.json({ response: "Error handling chat", error: error.message });
  }
};

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
  handleChat, postData, getData
};
