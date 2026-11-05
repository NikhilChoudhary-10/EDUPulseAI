# 🚀 EduPulse AI — My First AI App!

Welcome to **EduPulse AI**! This is my very first project building a full-stack application integrated with artificial intelligence. I built this to explore how to build backend Node.js servers, manage local environment variables, and connect directly to the **Gemini AI API**.

EduPulse AI streamlines the study process by generating smart notes, flashcards, and interactive quizzes instantly from text prompts, uploaded documents, or YouTube links.

---

## ✨ Features

* **🤖 AI Study Notes:** Instantly generates concise, well-structured study notes for any topic using Gemini AI.
* **📁 Smart Document Summaries:** Supports uploading files (`PDF`, `PPTX`, `TXT`, `MD`, `CSV`) to parse out short summaries.
* **🎥 YouTube Summarizer:** Takes any public YouTube link and builds a quick key-takeaways summary.
* **🌐 Bilingual Output:** Generates materials cleanly in both English and Hindi.
* **🧠 Active Recall Tools:** Built-in interactive Flashcards and Quizzes straight on the dashboard.

---

## 🛠️ Tech Stack & Concepts Explored
* **Frontend:** HTML5, CSS3, JavaScript (DOM Manipulation)
* **Backend:** Node.js, Express.js
* **AI Integration:** Google Gemini AI API
* **Version Control:** Git & GitHub *(Learned how to securely configure `.gitignore` to protect environment variables!)*

---

## ⚙️ How I Set Up and Run This Locally

### Prerequisites
* [Node.js](https://nodejs.org) installed on my machine.

### Local Development Steps

1. **Install Dependencies:**
   I open my terminal in VS Code and install the project packages:
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   * I created a local `.env` file in the root folder.
   * I added my personal Gemini API key inside it like this:
     ```env
     GEMINI_API_KEY=my_secret_gemini_api_key
     ```
   *(Note: This file is intentionally hidden from this public repository using a `.gitignore` rule to keep my personal Google AI billing and keys 100% secure.)*

3. **Running the Server:**
   boot up the Node backend engine by running:
   ```bash
   npm start
   ```

4. **Viewing the App:**
   Once running, the application handles the AI requests on the backend and displays the user interface locally at `http://localhost:3000`.

---
*Proudly built as a learning milestone. Feel free to check out the codebase!*

