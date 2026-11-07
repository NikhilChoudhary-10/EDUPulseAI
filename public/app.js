const $ = (id) => document.getElementById(id);

const names = {
  home: "Dashboard",
  topic: "AI Topic Notes",
  upload: "Upload PPT/PDF",
  yt: "YouTube Explainer",
  flash: "Flashcards",
  quiz: "Quiz",
};

function section(n) {
  document.querySelectorAll(".section").forEach((x) => x.classList.remove("active"));
  document.querySelectorAll(".nav").forEach((x) => x.classList.remove("active"));
  $(n)?.classList.add("active");
  document.querySelector(`[data-s="${n}"]`)?.classList.add("active");
  $("title").textContent = names[n] || "EduPulse AI";
  document.querySelector("aside").classList.remove("open");
}

document.querySelectorAll(".nav").forEach((b) => {
  b.onclick = () => section(b.dataset.s);
});

document.querySelectorAll("[data-go]").forEach((b) => {
  b.onclick = () => section(b.dataset.go);
});

$("theme").onclick = () => {
  document.body.classList.toggle("light");
};

/* API helper: existing backend endpoints are unchanged. */
async function post(url, body, form = false) {
  const response = await fetch(url, {
    method: "POST",
    headers: form ? {} : { "Content-Type": "application/json" },
    body: form ? body : JSON.stringify(body),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

/*
 * Render AI-generated Markdown safely.
 * Marked converts Markdown to HTML, DOMPurify sanitizes that HTML,
 * and MathJax typesets LaTeX after the content has been inserted.
 */
async function renderNotes(element, source) {
  const text = String(source ?? "");

  if (!window.marked || !window.DOMPurify) {
    // Safe fallback if the CDN libraries cannot load.
    element.textContent = text;
    return;
  }

  const html = window.marked.parse(text, {
    gfm: true,
    breaks: true,
  });

  element.innerHTML = window.DOMPurify.sanitize(html);

  if (window.MathJax?.typesetPromise) {
    try {
      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.warn("MathJax could not typeset part of the notes:", error);
    }
  }
}

function showMessage(element, message, className = "note-message") {
  element.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = message;
  element.appendChild(paragraph);
}

function responseText(data) {
  if (typeof data === "string") return data;
  return data?.text ?? data?.notes ?? data?.result ?? "";
}

async function copy(id, buttonId) {
  const element = $(id);
  const button = $(buttonId);
  const text = element.innerText || element.textContent || "";

  try {
    await navigator.clipboard.writeText(text);
    const oldText = button.textContent;
    button.textContent = "✓ Copied";
    setTimeout(() => {
      button.textContent = oldText;
    }, 1200);
  } catch {
    alert("Copy was blocked by your browser. Select the notes and copy them manually.");
  }
}

/* AI TOPIC NOTES */
$("topicBtn").onclick = async () => {
  const out = $("topicOut");
  const topic = $("topicInput").value.trim();

  if (!topic) {
    showMessage(out, "Enter a topic first.");
    return;
  }

  const button = $("topicBtn");
  button.disabled = true;
  button.textContent = "Generating notes…";
  showMessage(out, "AI is generating your notes. Please wait…");

  try {
    const data = await post("/api/topic-notes", {
      topic,
      language: $("topicLang").value,
      level: $("topicLevel").value,
    });

    await renderNotes(out, responseText(data));
  } catch (error) {
    showMessage(out, `Unable to generate notes: ${error.message}`, "note-error");
  } finally {
    button.disabled = false;
    button.textContent = "✨ Generate AI Notes";
  }
};

/* FILE UPLOAD NOTES */
$("file").onchange = () => {
  $("fname").textContent = $("file").files[0]?.name || "No file selected";
};

$("fileBtn").onclick = async () => {
  const file = $("file").files[0];
  const out = $("fileOut");

  if (!file) {
    showMessage(out, "Choose a file first.");
    return;
  }

  const button = $("fileBtn");
  button.disabled = true;
  button.textContent = "Analyzing…";
  showMessage(out, "AI is reading your material. Please wait…");

  const form = new FormData();
  form.append("file", file);
  form.append("language", $("fileLang").value);

  try {
    const data = await post("/api/analyze-file", form, true);
    await renderNotes(out, responseText(data));
  } catch (error) {
    showMessage(out, `Unable to analyze this file: ${error.message}`, "note-error");
  } finally {
    button.disabled = false;
    button.textContent = "📖 Analyze & Create Notes";
  }
};

/* YOUTUBE EXPLAINER */
$("ytBtn").onclick = async () => {
  const out = $("ytOut");
  const url = $("ytUrl").value.trim();

  if (!url) {
    showMessage(out, "Paste a YouTube URL first.");
    return;
  }

  const button = $("ytBtn");
  button.disabled = true;
  button.textContent = "Analyzing video…";
  showMessage(out, "AI is analyzing the public video. Please wait…");

  try {
    const data = await post("/api/youtube", {
      url,
      language: $("ytLang").value,
    });

    await renderNotes(out, responseText(data));
  } catch (error) {
    showMessage(out, `Unable to analyze this video: ${error.message}`, "note-error");
  } finally {
    button.disabled = false;
    button.textContent = "▶ Explain Video";
  }
};

$("copyTopic").onclick = () => copy("topicOut", "copyTopic");
$("copyFile").onclick = () => copy("fileOut", "copyFile");
$("copyYT").onclick = () => copy("ytOut", "copyYT");

/* FLASHCARDS */
const cards = [
  ["What is a semiconductor?", "A material with conductivity between a conductor and an insulator."],
  ["What is doping?", "Adding a controlled impurity to change conductivity."],
  ["What is a PN junction?", "The boundary between P-type and N-type semiconductor regions."],
  ["What is forward bias?", "A condition that reduces the junction barrier and permits significant current."],
  ["Name two semiconductor materials.", "Silicon and Germanium."],
];

let ci = 0;
let showAns = false;

function card() {
  showAns = false;
  $("fcCount").textContent = `${ci + 1}/${cards.length}`;
  $("fcText").textContent = cards[ci][0];
}

$("fc").onclick = () => {
  $("fcText").textContent = showAns ? cards[ci][0] : cards[ci][1];
  showAns = !showAns;
};

$("next").onclick = () => {
  ci = (ci + 1) % cards.length;
  card();
};

$("prev").onclick = () => {
  ci = (ci - 1 + cards.length) % cards.length;
  card();
};

card();

/* QUIZ */
const qs = [
  ["Which is a common semiconductor material?", ["Copper", "Silicon", "Wood", "Glass"], 1],
  ["What forms at a PN junction?", ["Depletion region", "Vacuum", "Metal plate", "Nothing"], 0],
  ["Which device mainly allows current in one direction?", ["Resistor", "Capacitor", "Diode", "Inductor"], 2],
];

let qi = 0;
let score = 0;
let answered = false;

function quiz() {
  answered = false;
  const question = qs[qi];
  $("progress").textContent = `Question ${qi + 1} of ${qs.length}`;

  const box = $("quizBox");
  box.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = question[0];
  box.appendChild(heading);

  question[1].forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = option;
    button.dataset.i = String(index);

    button.onclick = () => {
      if (answered) return;
      answered = true;

      box.querySelectorAll(".quiz-option").forEach((choice, choiceIndex) => {
        if (choiceIndex === question[2]) choice.classList.add("correct");
        if (choiceIndex === index && index !== question[2]) {
          choice.classList.add("wrong");
        }
      });

      if (index === question[2]) score++;
    };

    box.appendChild(button);
  });
}

$("nextQ").onclick = () => {
  if (!answered) {
    alert("Choose an answer first.");
    return;
  }

  if (qi < qs.length - 1) {
    qi++;
    quiz();
  } else {
    $("quizBox").innerHTML = "";
    const heading = document.createElement("h2");
    heading.textContent = `Score: ${Math.round((score / qs.length) * 100)}%`;
    const result = document.createElement("p");
    result.textContent = `You got ${score} of ${qs.length} correct.`;
    $("quizBox").append(heading, result);

    $("nextQ").textContent = "Restart Quiz";
    $("nextQ").onclick = () => {
      qi = 0;
      score = 0;
      $("nextQ").textContent = "Next Question";
      $("nextQ").onclick = nextQuestion;
      quiz();
    };
  }
};

function nextQuestion() {
  if (!answered) {
    alert("Choose an answer first.");
    return;
  }

  if (qi < qs.length - 1) {
    qi++;
    quiz();
  } else {
    $("quizBox").innerHTML = "";
    const heading = document.createElement("h2");
    heading.textContent = `Score: ${Math.round((score / qs.length) * 100)}%`;
    const result = document.createElement("p");
    result.textContent = `You got ${score} of ${qs.length} correct.`;
    $("quizBox").append(heading, result);
    $("nextQ").textContent = "Restart Quiz";
    $("nextQ").onclick = restartQuiz;
  }
}

function restartQuiz() {
  qi = 0;
  score = 0;
  $("nextQ").textContent = "Next Question";
  $("nextQ").onclick = nextQuestion;
  quiz();
}

$("nextQ").onclick = nextQuestion;
quiz();
