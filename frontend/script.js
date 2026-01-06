const API_BASE_URL = "http://localhost:3000/api";
const modelContainer = document.getElementsByClassName("modelContainer")[0];
const modelDropdown = document.querySelector(".modelDropdown1");
const searchInput = document.querySelector(".searchInput");
const searchInput1 = document.querySelector(".searchInput1");
const chatArea = document.querySelector('.chatArea');
const loader = document.querySelector('.loadContainer');
const chatScreen = chatArea.children[0].children[0];
const historyList = document.querySelector('.historyList');
const N=8, K=5;
var chatData;
chatDataResponse = getData();
chatDataResponse.then(data=>{
  chatData = data;
});
var chatId = (sessionStorage.getItem('chatId'))? sessionStorage.getItem('chatId'): 0;
const FACTUAL_KEYWORDS = ["what is", "what are", "who is", "who was", "when is", "when was", "where is", "where was", "define", "definition of", "meaning of", "full form of", "stands for", "abbreviation of", "overview of", "introduction to", "basic idea of", "explain briefly", "summary of", "diff ", "difference between", "differences between", "compare", "comparison of", "vs", "versus", "pros and cons", "advantages and disadvantages", "latest", "latest version", "current version", "release date", "introduced in", "first released", "history of", "origin of", "evolution of", "uses of", "applications of", "examples of", "real world examples", "use cases of"];
const REASONING_KEYWORDS = ["why", "how", "explain in detail", "step by step", "reason behind", "logic behind", "working of", "flow of", "internal working", "debug", "debugging", "fix", "fix this", "error", "error message", "bug", "issue", "problem", "not working", "fails", "failure", "crash", "unexpected output", "code", "write code", "implement", "implementation", "function", "method", "algorithm", "pseudo code", "data structure", "logic implementation", "time complexity", "space complexity", "optimize", "optimization", "improve performance", "refactor", "efficiency", "design", "system design", "architecture", "approach", "strategy", "best approach", "best way", "trade offs"];
const SIMPLE_KEYWORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "ok", "okay", "cool", "nice", "yes", "no", "sure", "alright", "done", "got it", "understood", "sounds good"];
function setChatId(title){
  for (let i = 0; i < chatData.length; i++) {
    if(title==chatData[i].title){
      sessionStorage.setItem('chatId', i);
      document.location.href = '/screen2';
    }
  }
}

async function postChat(toPost){
  try{
    const response = await fetch(`${API_BASE_URL}/data`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: toPost
    });
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
  } catch (error){
    console.error("Error calling postChat API:", error);
    throw error;
  }
}

async function getData(){
  try{
    const response = await fetch(`${API_BASE_URL}/data`, {
      method: "GET"
    });
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const a = await response.json();
    return a;
  } catch (error){
    return {};
  }
}

async function handleChat(message, model, chatId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        model: model,
        chatId: chatId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling handleChat API:", error);
    throw error;
  }
}

function getModel(prompt, messages){
  var model;
  try {
    for (let i = 0; i < modelContainer.children.length ; i++) {
      if (i==3) {
        continue;
      }
      if (modelContainer.children[i].children[0].checked) {
        if(i==4){
          sessionStorage.setItem('autoModelUsed', 1);
          model = autoAImodel(prompt, messages).model;
          messages = autoAImodel(prompt, messages).messages;
        } else{
          sessionStorage.setItem('autoModelUsed', 0);
          model = (i==0)? 'gpt-5-nano' : (i==1)? 'command-a-03-2025' : 'gemini-2.5-flash';
        }
        return {model: model, messages: messages}
      }
    }
  } catch (error) {
    let i = modelDropdown.selectedIndex;
    if(i==3){
      sessionStorage.setItem('autoModelUsed', 1);
      model = autoAImodel(prompt, messages).model;
      messages = autoAImodel(prompt, messages).messages;
    } else{
      sessionStorage.setItem('autoModelUsed', 0);
      model = (i==0)? 'gpt-5-nano' : (i==1)? 'command-a-03-2025' : 'gemini-2.5-flash';
    }
  }
  return {model: model, messages:messages};
}

async function startChat(){
  showLoader();
  var message = searchInput.value;
  d = await getData();
  var model = getModel(message, []).model;
  a = await handleChat(message+" :\n\nFormat the entire response as a HTML text to be placed inside an answerArea div in my document, dont give the outside answerArea div tag its already there, no css is requrired i have already done that also no margin padding required.", model, d.length);
  var result = a.response;
  if (result == "Error handling chat") {
    result = a.error;
  }
  postChat(JSON.stringify({title: message, messages: [{message: message, model: model, response: result}]}));
  sessionStorage.setItem('chatId', d.length)
  window.location.href = "/screen2";

}

async function reStartChat(){
  showLoader();
  var message = searchInput1.value;
  var chatData = await getData();
  var messages = chatData[chatId].messages;
  var model = getModel(message, messages).model;
  var messages = getModel(message, messages).messages;
  var toAsk = `With reference to the following convo with the AI models given in sequence in the JSON form ${JSON.stringify(messages)} Now Answer the following new question by the user: ${message}  :\n\nFormat the entire response as a HTML text to be placed inside an answerArea div in my document, dont give the outside answerArea div tag its already there, no css is requrired i have already done that also no margin padding required.`;
  a = await handleChat(toAsk, model, chatId);
  var result = a.response;
  if (result == "Error handling chat") {
    result = a.error;
  }
  chatData[chatId].messages.push({message: message, model: model, response: result});
  postChat(JSON.stringify(chatData[chatId]));
  window.location.href = "/screen2";
}
try {
  searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      startChat();
    }
  });  
} 
catch (error) {
  searchInput1.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      reStartChat();
    }
  });  
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(async () => {
    var chatData = await getData();
    if(chatData.length){
      for (let i = chatData.length -1; i >= 0; i--) {
        const title = chatData[i].title;
        historyList.innerHTML += `<a onclick="setChatId('${title}');" class="chatItem"><span class="chatTitle">${title}</span></a>`;
      }
    }
    if (window.location.pathname === "/screen2") {
      const screen = document.querySelector('.chatContent');
      if (chatData.length) {
        for (let i = 0; i < chatData[chatId].messages.length; i++){
          var { message, model, response } = chatData[chatId].messages[i];
          text = (model.includes('gpt')) ? 'GPT-5 Nano' : (model.includes('command')) ? 'Cohere' : (model.includes('gemini')) ? 'Gemini 2.5 Flash' : 'GPT-5 Nano';
          response = response.replaceAll('```html\n', '');
          screen.innerHTML += `            <div class="prompt"><h2>${message}</h2></div>
              <div class="basePromptLine">
                  <div class="logoPrompt"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-5 h-5 ico3"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"></path></svg></div>
                  <div class="modelInfo">Answer generated by ${text}</div>
                  <div class="copyReloadBtns">
                      <button class="baseLineBtns"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-4 h-4 ico3"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"></path></svg></button>
                      <button class="baseLineBtns"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-4 h-4 ico3"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg></button>
                  </div>
              </div>
              <div class="borderLine"></div>
              <div class="answerArea">
                  ${response}
              </div>`;
        }
        if(parseInt(sessionStorage.getItem('autoModelUsed'))){ i=3; }
        else{
          i = (model.includes('gpt'))? 0 : (model.includes('command')) ? 1 : 2;
        }
        modelDropdown.selectedIndex = i;
        const prompts = document.querySelectorAll('.prompt');
        const answers = document.querySelectorAll('.answerArea');
        const basePromptLines = document.querySelectorAll('.basePromptLine');
        const borderLine = document.querySelectorAll('.borderLine');
        const lastPrompt = prompts[prompts.length-1];
        const lastAns = answers[answers.length-1];
        const lastBasePromptLine = basePromptLines[basePromptLines.length-1];
        const lastBorderLine = borderLine[borderLine.length-1];
        toScroll = chatScreen.scrollHeight - (65+lastPrompt.clientHeight+lastAns.clientHeight+lastBasePromptLine.clientHeight+lastBorderLine.clientHeight)
        window.scrollBy({top: toScroll, behavior: 'smooth'});
       }
    }
  }, 200);
});

function redirect(){
  window.location.pathname = '/';
}

function showLoader(){
  chatArea.style.display = "none";
  loader.style.display = "flex";
}

function autoAImodel(prompt, messages){
  if(messages.length>N){
    return {model: "command-a-03-2025", messages: messages.slice(-K)};
  }
  if(isFactual(prompt)){ return {model: "gemini-2.5-flash", messages: messages}; }
  if(prompt.split(" ").length<K) { return {model: "gpt-5-nano", messages: messages}; }
  if(isSimple(prompt)){ return {model: "gpt-5-nano", messages: messages}; }
  if(isReasoning(prompt)){ return {model: "command-a-03-2025", messages: messages}; }

  return {model: "gpt-5-nano", messages:messages};
}

function isFactual(prompt){
  const a = prompt.toLowerCase();
  return FACTUAL_KEYWORDS.some(k => a.includes(k));
}

function isReasoning(prompt){
  const a = prompt.toLowerCase();
  return REASONING_KEYWORDS.some(k => a.includes(k));
}

function isSimple(prompt){
  const a = prompt.toLowerCase();
  return SIMPLE_KEYWORDS.some(k => a.includes(k));
}