const API_BASE_URL = "http://localhost:3000/api";
var model; // gpt-5-nano, gemini-2.5-flash, command-a-03-2025

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

function nav() {
  const menuBtn = document.getElementById("menuBtn");
  const bg = window.getComputedStyle(menuBtn).getPropertyValue('background-image');
  if (bg.includes('cross.png')) {
    menuBtn.style.backgroundImage = 'url("hamburger.png")';
  } else {
    menuBtn.style.backgroundImage = 'url("cross.png")';
  }
}

function setModel(selectedModel) {
  model = selectedModel;
  window.location.href = "screen2";
}

// a = handleChat("Hello, how are you?", "gpt-5-nano");
// a.then((data) => {
//   console.log("Response from handleChat:", data.response);
// });