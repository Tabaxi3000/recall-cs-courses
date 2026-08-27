"use strict";

const DAY = 86_400_000;
const STORAGE_KEY = "recall-cs-courses-v1";
const THEME_KEY = "recall-cs-theme";
const COURSE_COLORS = { "CS 111": "cs111", "CS 157": "cs157", "CS 251": "cs251", "CS 259Q": "cs259q" };

const $ = (selector) => document.querySelector(selector);
const views = [$("#dashboard"), $("#studyView"), $("#completeView"), $("#browseView"), $("#toolsView")];

function hashId(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

const cards = [];
const decks = [];
for (const [course, courseData] of Object.entries(CARD_DATA)) {
  for (const [unit, pairs] of Object.entries(courseData.units)) {
    const unitCards = pairs.map(([question, answer]) => {
      const card = {
        id: hashId(`${course}|${unit}|${question}`),
        course,
        unit,
        question,
        answer,
        color: COURSE_COLORS[course]
      };
      cards.push(card);
      return card;
    });
    decks.push({ course, unit, color: COURSE_COLORS[course], cards: unitCards });
  }
}
function today() { return new Date().toISOString().slice(0, 10); }
function defaultTools() {
  return {
    focusSessions: 0,
    focusMinutes: 0,
    sprintsCompleted: 0,
    quizAttempts: 0,
    quizCorrect: 0,
    scratchpad: "",
    timer: { preset: "classic", phase: "focus", remaining: 25 * 60, running: false, endAt: 0, cycle: 0 }
  };
}
function defaultStore() {
  return { version: 1, progress: {}, settings: { newPerDay: 20 }, introduced: { date: today(), count: 0 }, reviewDates: [], tools: defaultTools() };
}
function normalizeStore(parsed) {
  const base = defaultStore();
  return {
    ...base,
    ...parsed,
    settings: { ...base.settings, ...parsed.settings },
    introduced: { ...base.introduced, ...parsed.introduced },
    reviewDates: Array.isArray(parsed.reviewDates) ? parsed.reviewDates : [],
    tools: { ...base.tools, ...parsed.tools, timer: { ...base.tools.timer, ...parsed.tools?.timer } }
  };
}
function loadStore() {
  const base = defaultStore();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && parsed.version === 1 && parsed.progress) return normalizeStore(parsed);
  } catch (_) { /* use defaults */ }
  return base;
}
let store = loadStore();

function saveStore() { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
function resetDailyCounter() {
  if (store.introduced.date !== today()) {
    store.introduced = { date: today(), count: 0 };
    saveStore();
  }
}
function progressFor(id) { return store.progress[id]; }
function isNew(id) { return !progressFor(id); }
function isDue(id) { const progress = progressFor(id); return Boolean(progress && progress.due <= Date.now()); }

function scheduleFrom(previous, grade) {
  const next = { ease: 2.5, interval: 0, reps: 0, lapses: 0, ...previous };
  if (grade === 1) {
    next.reps = 0;
    next.lapses += 1;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.interval = 0;
    next.due = Date.now() + 10 * 60_000;
  } else if (grade === 2) {
    next.ease = Math.max(1.3, next.ease - 0.15);
    next.interval = next.reps === 0 ? 1 : Math.max(next.interval + 1, Math.round(next.interval * 1.2));
    next.due = Date.now() + next.interval * DAY;
  } else if (grade === 3) {
    next.interval = next.reps === 0 ? 1 : Math.max(1, Math.round(next.interval * next.ease));
    next.reps += 1;
    next.due = Date.now() + next.interval * DAY;
  } else {
    next.ease += 0.15;
    next.interval = next.reps === 0 ? 4 : Math.max(4, Math.round(next.interval * next.ease * 1.3));
    next.reps += 1;
    next.due = Date.now() + next.interval * DAY;
  }
  next.lastReview = Date.now();
  return next;
}

function formatInterval(progress, grade) {
  if (grade === 1) return "10m";
  const days = scheduleFrom(progress, grade).interval;
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

function shuffle(list) {
  const output = [...list];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function showView(active) {
  views.forEach((view) => view.classList.toggle("hidden", view !== active));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderMath(element) {
  if (!window.temml) return;
  try {
    temml.renderMathInElement(element, { fences: "$+", throwOnError: false });
  } catch (error) {
    console.warn("Math rendering failed", error);
  }
}

function streak() {
  const dates = new Set(store.reviewDates || []);
  let count = 0;
  const cursor = new Date();
  if (!dates.has(today())) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

let courseFilter = "All";
function renderDashboard() {
  resetDailyCounter();
  const due = cards.filter((card) => isDue(card.id)).length;
  const learned = cards.filter((card) => !isNew(card.id)).length;
  const room = Math.max(0, store.settings.newPerDay - store.introduced.count);
  const availableNew = Math.min(room, cards.length - learned);
  const percentage = Math.round((learned / cards.length) * 100);

  $("#dueStat").textContent = due;
  $("#newStat").textContent = availableNew;
  $("#learnedStat").textContent = learned;
  $("#streakStat").textContent = streak();
  $("#coverageLabel").textContent = `${percentage}%`;
  $("#coverageBar").style.width = `${percentage}%`;
  $("#dashboardLead").textContent = due + availableNew > 0
    ? `${due} due and up to ${availableNew} new cards are ready across ${cards.length} questions.`
    : `Nothing is due. You have introduced ${learned} of ${cards.length} cards.`;
  $("#studyAllButton").disabled = due + availableNew === 0;
  $("#footerCount").textContent = `${cards.length} cards · ${decks.length} topic decks`;

  const filters = $("#courseFilters");
  filters.innerHTML = "";
  ["All", ...Object.keys(CARD_DATA)].forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.classList.toggle("active", name === courseFilter);
    button.onclick = () => { courseFilter = name; renderDashboard(); };
    filters.appendChild(button);
  });

  const library = $("#courseLibrary");
  library.innerHTML = "";
  for (const course of Object.keys(CARD_DATA)) {
    if (courseFilter !== "All" && courseFilter !== course) continue;
    const courseDecks = decks.filter((deck) => deck.course === course);
    const courseCards = cards.filter((card) => card.course === course);
    const courseLearned = courseCards.filter((card) => !isNew(card.id)).length;
    const section = document.createElement("section");
    section.className = "course-section";
    section.style.setProperty("--course", `var(--${COURSE_COLORS[course]})`);
    section.innerHTML = `<div class="course-heading"><span class="course-dot"></span><h3>${course}</h3><small>${courseLearned}/${courseCards.length} introduced</small></div>`;
    const grid = document.createElement("div");
    grid.className = "deck-grid";
    courseDecks.forEach((deck) => {
      const dueCount = deck.cards.filter((card) => isDue(card.id)).length;
      const newCount = deck.cards.filter((card) => isNew(card.id)).length;
      const learnedCount = deck.cards.length - newCount;
      const article = document.createElement("article");
      article.className = "deck-card";
      article.style.setProperty("--course", `var(--${deck.color})`);
      article.innerHTML = `
        <h4>${deck.unit}</h4>
        <div class="deck-meta"><span class="pill due">${dueCount} due</span><span class="pill">${newCount} new</span><span class="pill">${deck.cards.length} total</span></div>
        <div class="deck-actions"><button class="study-deck" type="button">Study deck</button><button class="cram-deck" type="button">Cram all</button></div>
        <div class="deck-mini"><i style="width:${Math.round((learnedCount / deck.cards.length) * 100)}%"></i></div>`;
      article.querySelector(".study-deck").onclick = () => startSession(deck.cards, false, deck.unit);
      article.querySelector(".cram-deck").onclick = () => startSession(deck.cards, true, deck.unit);
      grid.appendChild(article);
    });
    section.appendChild(grid);
    library.appendChild(section);
  }
  showView($("#dashboard"));
}

let session = null;
function buildQueue(pool) {
  resetDailyCounter();
  const due = shuffle(pool.filter((card) => isDue(card.id)));
  const room = Math.max(0, store.settings.newPerDay - store.introduced.count);
  const fresh = shuffle(pool.filter((card) => isNew(card.id))).slice(0, room);
  return [...due, ...fresh];
}

function startSession(pool, cram = false, label = "All courses") {
  const queue = cram ? shuffle(pool) : buildQueue(pool);
  if (!queue.length) return;
  session = { queue, total: queue.length, reviewed: 0, again: 0, cram, label, current: null, revealed: false };
  $("#cramBadge").classList.toggle("hidden", !cram);
  showView($("#studyView"));
  nextCard();
}

function nextCard() {
  if (!session.queue.length) return finishSession();
  session.current = session.queue.shift();
  session.revealed = false;
  const card = session.current;
  $("#courseBadge").textContent = card.course;
  $("#courseBadge").style.setProperty("--course", `var(--${card.color})`);
  $("#unitLabel").textContent = card.unit;
  $("#question").innerHTML = card.question;
  $("#answer").innerHTML = card.answer;
  $("#answerArea").classList.add("hidden");
  $("#ratingButtons").classList.add("hidden");
  $("#revealButton").classList.remove("hidden");
  $("#studyCounter").textContent = `${session.reviewed + 1} / ${session.total}`;
  $("#sessionBar").style.width = `${Math.round((session.reviewed / session.total) * 100)}%`;
  renderMath($("#question"));
}

function reveal() {
  if (!session || session.revealed) return;
  session.revealed = true;
  $("#answerArea").classList.remove("hidden");
  $("#revealButton").classList.add("hidden");
  $("#ratingButtons").classList.remove("hidden");
  renderMath($("#answer"));
  const progress = progressFor(session.current.id) || {};
  $("#againInterval").textContent = formatInterval(progress, 1);
  $("#hardInterval").textContent = formatInterval(progress, 2);
  $("#goodInterval").textContent = formatInterval(progress, 3);
  $("#easyInterval").textContent = formatInterval(progress, 4);
}

function rate(grade) {
  if (!session || !session.revealed) return;
  const card = session.current;
  if (!session.cram) {
    const wasNew = isNew(card.id);
    store.progress[card.id] = scheduleFrom(progressFor(card.id), grade);
    if (wasNew) store.introduced.count += 1;
    if (grade === 1) {
      session.again += 1;
      session.queue.push(card);
      session.total += 1;
    }
    if (!store.reviewDates.includes(today())) store.reviewDates.push(today());
    saveStore();
  }
  session.reviewed += 1;
  nextCard();
}

function finishSession() {
  const reviewed = session.reviewed;
  const suffix = session.cram ? "Cram mode did not change the schedule." : `${session.again} card${session.again === 1 ? "" : "s"} needed another pass.`;
  $("#completeSummary").textContent = `You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"} from ${session.label}. ${suffix}`;
  showView($("#completeView"));
}

function renderBrowse() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const matches = cards.filter((card) => !query || `${card.course} ${card.unit} ${card.question} ${card.answer}`.toLowerCase().includes(query));
  $("#browseCount").textContent = `${matches.length} of ${cards.length} cards`;
  const results = $("#browseResults");
  results.innerHTML = "";
  matches.slice(0, 200).forEach((card) => {
    const article = document.createElement("article");
    article.className = "browse-card";
    article.style.setProperty("--course", `var(--${card.color})`);
    article.innerHTML = `<header><span>${card.course}</span><span>${card.unit}</span></header><div class="browse-question">${card.question}</div><div class="browse-answer">${card.answer}</div>`;
    renderMath(article);
    results.appendChild(article);
  });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `recall-progress-${today()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported || imported.version !== 1 || typeof imported.progress !== "object") throw new Error("Unsupported file");
      store = normalizeStore(imported);
      saveStore();
      $("#settingsDialog").close();
      renderDashboard();
    } catch (_) {
      window.alert("That file is not a valid Recall progress export.");
    }
  };
  reader.readAsText(file);
}

const TIMER_PRESETS = {
  classic: { focus: 25, short: 5, long: 15 },
  deep: { focus: 50, short: 10, long: 20 }
};
function timerMinutes(phase = store.tools.timer.phase) {
  return TIMER_PRESETS[store.tools.timer.preset][phase];
}

function formatClock(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function setTimerMessage(message) {
  $("#timerMessage").textContent = message;
}

function advanceTimer(countFocus = false) {
  const timer = store.tools.timer;
  timer.running = false;
  timer.endAt = 0;
  if (timer.phase === "focus") {
    if (countFocus) {
      timer.cycle += 1;
      store.tools.focusSessions += 1;
      store.tools.focusMinutes += timerMinutes("focus");
    }
    timer.phase = timer.cycle > 0 && timer.cycle % 4 === 0 ? "long" : "short";
    setTimerMessage(countFocus ? "Focus block complete. Take the break." : "Focus skipped. Take a short reset.");
  } else {
    timer.phase = "focus";
    setTimerMessage("Break complete. Choose the next concrete task.");
  }
  timer.remaining = timerMinutes() * 60;
  saveStore();
  renderTimer();
  renderToolStats();
}

function renderTimer() {
  const timer = store.tools.timer;
  if (timer.running) {
    timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
    if (timer.remaining === 0) {
      advanceTimer(true);
      return;
    }
  }
  const phaseNames = { focus: "Focus", short: "Short break", long: "Long break" };
  $("#timerPhase").textContent = phaseNames[timer.phase];
  $("#timerDisplay").textContent = formatClock(timer.remaining);
  $("#timerToggleButton").textContent = timer.running ? "Pause" : timer.remaining < timerMinutes() * 60 ? "Resume" : `Start ${timer.phase === "focus" ? "focus" : "break"}`;
  $("#cycleLabel").textContent = `${timer.cycle % 4} of 4 focus blocks in this cycle`;
  document.title = timer.running ? `${formatClock(timer.remaining)} · Recall` : "Recall — CS Course Review";
  document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("active", button.dataset.preset === timer.preset));
}

function toggleTimer() {
  const timer = store.tools.timer;
  if (timer.running) {
    timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
    timer.running = false;
    timer.endAt = 0;
    setTimerMessage("Paused. Resume when the interruption is handled.");
  } else {
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining * 1000;
    setTimerMessage(timer.phase === "focus" ? "Stay with one task until the timer ends." : "Leave the screen if you can.");
  }
  saveStore();
  renderTimer();
}

function resetTimer() {
  const timer = store.tools.timer;
  timer.running = false;
  timer.endAt = 0;
  timer.remaining = timerMinutes() * 60;
  setTimerMessage(timer.phase === "focus" ? "One focused interval, then step away." : "A real break makes the next block better.");
  saveStore();
  renderTimer();
}

function chooseTimerPreset(name) {
  store.tools.timer.preset = name;
  store.tools.timer.phase = "focus";
  store.tools.timer.remaining = TIMER_PRESETS[name].focus * 60;
  store.tools.timer.running = false;
  store.tools.timer.endAt = 0;
  setTimerMessage(name === "deep" ? "A longer block for proofs, traces, and worked problems." : "One focused interval, then step away.");
  saveStore();
  renderTimer();
}

function renderToolStats() {
  $("#focusSessionStat").textContent = store.tools.focusSessions;
  $("#focusMinuteStat").textContent = store.tools.focusMinutes;
  $("#sprintStat").textContent = store.tools.sprintsCompleted;
  $("#quizStat").textContent = store.tools.quizAttempts ? `${Math.round((store.tools.quizCorrect / store.tools.quizAttempts) * 100)}%` : "—";
}

function populateCourseSelect(select) {
  select.innerHTML = Object.keys(CARD_DATA).map((course) => `<option>${course}</option>`).join("");
}

function populateUnitSelect(courseSelect, unitSelect, includeAll = false) {
  const course = courseSelect.value;
  const options = Object.keys(CARD_DATA[course].units);
  unitSelect.innerHTML = `${includeAll ? '<option value="All">All topics</option>' : ""}${options.map((unit) => `<option>${unit}</option>`).join("")}`;
}

const COURSE_DRILLS = {
  "CS 111": "Trace one process, descriptor, synchronization, or address-translation scenario on paper.",
  "CS 157": "Construct one proof and one countermodel; label every rule or semantic choice.",
  "CS 251": "Analyze one protocol or attack from invariant through repair and new assumption.",
  "CS 259Q": "Work one derivation, circuit, channel, or coding calculation without looking up the next step."
};

const SPRINT_TIMES = {
  25: [3, 12, 7, 3],
  50: [7, 25, 12, 6],
  90: [10, 45, 25, 10]
};
let currentSprint = null;

function buildSprint() {
  const course = $("#sprintCourse").value;
  const unit = $("#sprintUnit").value;
  const length = Number($("#sprintLength").value);
  const times = SPRINT_TIMES[length];
  const tasks = [
    "Closed-book brain dump: write definitions, formulas, and steps you remember.",
    COURSE_DRILLS[course],
    "Check the relevant notes and correct the work in a different color. Record why each miss happened.",
    "Write a three-sentence summary and choose the exact problem or deck to revisit next."
  ];
  currentSprint = { completed: false };
  const plan = $("#sprintPlan");
  plan.innerHTML = `<h3>${course} · ${length}-minute sprint</h3><p>${unit}</p>${tasks.map((task, index) => `<label class="sprint-step"><input type="checkbox"><span>${task}</span><small>${times[index]}m</small></label>`).join("")}`;
  plan.classList.remove("hidden");
  plan.querySelectorAll("input").forEach((input) => {
    input.onchange = () => {
      input.closest("label").classList.toggle("done", input.checked);
      const finished = [...plan.querySelectorAll("input")].every((item) => item.checked);
      if (finished && !currentSprint.completed) {
        currentSprint.completed = true;
        store.tools.sprintsCompleted += 1;
        saveStore();
        renderToolStats();
      }
    };
  });
}

let quizState = null;

function startQuiz() {
  const course = $("#quizCourse").value;
  const unit = $("#quizUnit").value;
  const count = Number($("#quizCount").value);
  const pool = cards.filter((card) => card.course === course && (unit === "All" || card.unit === unit));
  quizState = { cards: shuffle(pool).slice(0, Math.min(count, pool.length)), index: 0, correct: 0, missed: [] };
  $("#quizSetup").classList.add("hidden");
  $("#quizComplete").classList.add("hidden");
  $("#quizRunner").classList.remove("hidden");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const card = quizState.cards[quizState.index];
  $("#quizProgress").textContent = `${quizState.index + 1} / ${quizState.cards.length}`;
  $("#quizQuestion").innerHTML = card.question;
  $("#quizResponse").value = "";
  $("#quizReference").classList.add("hidden");
  $("#quizMarkButtons").classList.add("hidden");
  $("#checkQuizButton").classList.remove("hidden");
  renderMath($("#quizQuestion"));
  $("#quizResponse").focus();
}

function checkQuizAnswer() {
  const card = quizState.cards[quizState.index];
  $("#quizAnswer").innerHTML = card.answer;
  $("#quizReference").classList.remove("hidden");
  $("#quizMarkButtons").classList.remove("hidden");
  $("#checkQuizButton").classList.add("hidden");
  renderMath($("#quizAnswer"));
}

function markQuiz(correct) {
  if (correct) quizState.correct += 1;
  else quizState.missed.push(quizState.cards[quizState.index]);
  quizState.index += 1;
  if (quizState.index < quizState.cards.length) renderQuizQuestion();
  else finishQuiz();
}

function finishQuiz() {
  const total = quizState.cards.length;
  store.tools.quizAttempts += total;
  store.tools.quizCorrect += quizState.correct;
  saveStore();
  renderToolStats();
  $("#quizRunner").classList.add("hidden");
  $("#quizProgress").textContent = "Complete";
  const complete = $("#quizComplete");
  complete.innerHTML = `<h3>${quizState.correct} of ${total} recalled</h3><p>${quizState.missed.length ? `${quizState.missed.length} prompt${quizState.missed.length === 1 ? "" : "s"} should get another pass.` : "No misses in this set."}</p><button id="reviewMissesButton" class="primary-button" type="button" ${quizState.missed.length ? "" : "disabled"}>Cram missed prompts</button><button id="newQuizButton" class="secondary-button" type="button">Build another quiz</button>`;
  complete.classList.remove("hidden");
  complete.querySelector("#reviewMissesButton").onclick = () => startSession(quizState.missed, true, "quiz misses");
  complete.querySelector("#newQuizButton").onclick = () => {
    complete.classList.add("hidden");
    $("#quizSetup").classList.remove("hidden");
    $("#quizProgress").textContent = "Not started";
  };
}

function renderTools() {
  if (!$("#sprintCourse").options.length) {
    populateCourseSelect($("#sprintCourse"));
    populateCourseSelect($("#quizCourse"));
    populateUnitSelect($("#sprintCourse"), $("#sprintUnit"));
    populateUnitSelect($("#quizCourse"), $("#quizUnit"), true);
  }
  $("#studyScratchpad").value = store.tools.scratchpad;
  renderToolStats();
  renderTimer();
  showView($("#toolsView"));
}

$("#studyAllButton").onclick = () => startSession(cards, false, "all four courses");
$("#homeLink").onclick = (event) => { event.preventDefault(); renderDashboard(); };
$("#toolsButton").onclick = renderTools;
$("#leaveToolsButton").onclick = renderDashboard;
$("#revealButton").onclick = reveal;
$("#ratingButtons").querySelectorAll("button").forEach((button) => { button.onclick = () => rate(Number(button.dataset.grade)); });
$("#leaveStudyButton").onclick = renderDashboard;
$("#returnButton").onclick = renderDashboard;
$("#browseButton").onclick = () => { showView($("#browseView")); renderBrowse(); $("#searchInput").focus(); };
$("#leaveBrowseButton").onclick = renderDashboard;
$("#searchInput").oninput = renderBrowse;

$("#timerToggleButton").onclick = toggleTimer;
$("#timerResetButton").onclick = resetTimer;
$("#timerSkipButton").onclick = () => advanceTimer(false);
document.querySelectorAll("[data-preset]").forEach((button) => { button.onclick = () => chooseTimerPreset(button.dataset.preset); });
$("#sprintCourse").onchange = () => populateUnitSelect($("#sprintCourse"), $("#sprintUnit"));
$("#quizCourse").onchange = () => populateUnitSelect($("#quizCourse"), $("#quizUnit"), true);
$("#buildSprintButton").onclick = buildSprint;
$("#startQuizButton").onclick = startQuiz;
$("#checkQuizButton").onclick = checkQuizAnswer;
$("#quizMissButton").onclick = () => markQuiz(false);
$("#quizCorrectButton").onclick = () => markQuiz(true);
$("#studyScratchpad").oninput = () => {
  store.tools.scratchpad = $("#studyScratchpad").value;
  saveStore();
  $("#scratchSaved").textContent = "Saved locally";
};

const settingsDialog = $("#settingsDialog");
$("#settingsButton").onclick = () => { $("#newPerDayInput").value = store.settings.newPerDay; settingsDialog.showModal(); };
$("#saveSettingsButton").onclick = () => {
  store.settings.newPerDay = Math.max(1, Math.min(100, Number($("#newPerDayInput").value) || 20));
  saveStore();
  renderDashboard();
};
$("#exportButton").onclick = exportProgress;
$("#importInput").onchange = (event) => { if (event.target.files[0]) importProgress(event.target.files[0]); };

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}
applyTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("#themeButton").onclick = () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

document.addEventListener("keydown", (event) => {
  if (settingsDialog.open || !session || $("#studyView").classList.contains("hidden")) return;
  if (event.code === "Space") { event.preventDefault(); reveal(); }
  if (session.revealed && /^[1-4]$/.test(event.key)) rate(Number(event.key));
});

window.setInterval(renderTimer, 1000);
renderDashboard();
