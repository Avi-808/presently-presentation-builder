const startingSlides = [
  { title: "A brighter future\nstarts today.", subtitle: "How clean energy can power our next chapter", body: "A practical look at the shift to cleaner, more resilient energy." },
  { title: "The opportunity is\nright in front of us.", subtitle: "Three forces are changing the energy landscape", body: "Solar and wind are scaling faster than ever\nStorage makes renewable power more reliable\nCommunities can take part in local energy" },
  { title: "Progress happens\nwhen we begin.", subtitle: "Small steps. Shared momentum.", body: "Choose one change to make this month\nSupport the solutions already working\nBring one more person into the conversation" }
];
const themes = ["aurora", "paper", "midnight", "citrus"];
let slides = structuredClone(startingSlides);
let current = 0;
let theme = "aurora";
let zoom = 1;
let deck = "The Future of Clean Energy";
const $ = id => document.getElementById(id);
const esc = value => value.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

function renderSlide(target, data, index, deckName = deck) {
  target.className = `slide-canvas theme-${theme}`;
  target.innerHTML = `<div class="canvas-kicker"><span class="canvas-mark">P</span><span>${esc(deckName.toUpperCase())}</span></div><div class="canvas-content"><p class="canvas-eyebrow">${index === 0 ? "A BETTER WAY FORWARD" : `OUR STORY · ${String(index + 1).padStart(2,"0")}`}</p><h2>${esc(data.title || "Untitled slide")}</h2><p class="canvas-subtitle">${esc(data.subtitle || "")}</p><div class="canvas-body">${(data.body || "").split("\n").map(line => line.trim()).filter(Boolean).map(line => `<div class="body-point">${esc(line)}</div>`).join("")}</div></div><div class="canvas-footer"><span>IDEAS INTO ACTION</span><span>${String(index + 1).padStart(2,"0")}</span></div><div class="canvas-art art-one"></div><div class="canvas-art art-two"></div>`;
}

function syncForm() {
  const slide = slides[current];
  $("slideTitle").value = slide.title;
  $("slideSubtitle").value = slide.subtitle;
  $("slideBody").value = slide.body;
  $("charCount").textContent = `${slide.body.length} / 600`;
  $("currentNumber").textContent = String(current + 1).padStart(2,"0");
  $("slideTotal").textContent = String(slides.length).padStart(2,"0");
  $("deckName").textContent = deck;
  $("canvasDeckName").textContent = deck.toUpperCase();
  renderSlide($("slideCanvas"), slide, current);
  renderThumbnails();
  renderPresenter();
}

function renderThumbnails() {
  $("slideList").replaceChildren(...slides.map((slide, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `slide-item${index === current ? " active" : ""}`;
    item.setAttribute("aria-label", `Edit slide ${index + 1}: ${slide.title.replaceAll("\n"," ")}`);
    const thumb = document.createElement("div");
    thumb.className = `thumb theme-${theme}`;
    thumb.innerHTML = `<span class="thumb-title">${esc(slide.title.replaceAll("\n"," ") || "Untitled slide")}</span><span class="thumb-sub">${esc(slide.subtitle || "Add a subtitle")}</span><span class="thumb-number">${String(index + 1).padStart(2,"0")}</span>`;
    const meta = document.createElement("div");
    meta.className = "slide-item-meta";
    meta.innerHTML = `<span>${esc(slide.title.replaceAll("\n"," ") || "Untitled slide")}</span><em>${String(index + 1).padStart(2,"0")}</em>`;
    item.append(thumb, meta);
    item.addEventListener("click", () => goTo(index));
    return item;
  }));
}

function renderPresenter() {
  renderSlide($("presentCanvas"), slides[current], current);
  $("presentCount").textContent = `${current + 1} / ${slides.length}`;
}

function goTo(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  syncForm();
}

function updateSlide(key, value) {
  slides[current][key] = value;
  if (key === "body") $("charCount").textContent = `${value.length} / 600`;
  renderSlide($("slideCanvas"), slides[current], current);
  renderThumbnails();
  renderPresenter();
  localStorage.setItem("presently-draft", JSON.stringify({ slides, current, theme, deck }));
}

function addSlide() {
  slides.splice(current + 1, 0, { title: "Your next idea", subtitle: "Add a short supporting line", body: "First key point\nSecond key point" });
  goTo(current + 1);
  $("slideTitle").focus();
}

function deleteSlide() {
  if (slides.length === 1) {
    slides[0] = { title: "Your presentation starts here.", subtitle: "Add a short supporting line", body: "Your first key point" };
    syncForm();
    return;
  }
  slides.splice(current, 1);
  goTo(Math.min(current, slides.length - 1));
}

function applyTheme(nextTheme) {
  if (!themes.includes(nextTheme)) return;
  theme = nextTheme;
  $("slideCanvas").className = `slide-canvas theme-${theme}`;
  $("presentCanvas").className = `slide-canvas theme-${theme}`;
  document.querySelectorAll(".swatch").forEach(button => button.classList.toggle("active", button.dataset.theme === theme));
  renderSlide($("slideCanvas"), slides[current], current);
  renderThumbnails();
  renderPresenter();
  localStorage.setItem("presently-draft", JSON.stringify({ slides, current, theme, deck }));
}

function startPresent() {
  $("presenter").classList.add("open");
  $("presenter").setAttribute("aria-hidden", "false");
  renderPresenter();
}
function stopPresent() {
  $("presenter").classList.remove("open");
  $("presenter").setAttribute("aria-hidden", "true");
}
function changeZoom(amount) {
  zoom = Math.max(.7, Math.min(1.2, zoom + amount));
  $("slideCanvas").style.transform = `scale(${zoom})`;
  $("zoomLabel").textContent = zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`;
}

$("slideTitle").addEventListener("input", event => updateSlide("title", event.target.value));
$("slideSubtitle").addEventListener("input", event => updateSlide("subtitle", event.target.value));
$("slideBody").addEventListener("input", event => updateSlide("body", event.target.value));
$("addSlide").addEventListener("click", addSlide);
$("deleteSlide").addEventListener("click", deleteSlide);
$("prevSlide").addEventListener("click", () => goTo(current - 1));
$("nextSlide").addEventListener("click", () => goTo(current + 1));
$("presentPrev").addEventListener("click", () => goTo(current - 1));
$("presentNext").addEventListener("click", () => goTo(current + 1));
$("presentButton").addEventListener("click", startPresent);
$("fullscreen").addEventListener("click", startPresent);
$("closePresenter").addEventListener("click", stopPresent);
$("exportButton").addEventListener("click", () => { startPresent(); window.setTimeout(() => window.print(), 100); });
$("zoomIn").addEventListener("click", () => changeZoom(.1));
$("zoomOut").addEventListener("click", () => changeZoom(-.1));
$("themeSwatches").addEventListener("click", event => { const button = event.target.closest("[data-theme]"); if (button) applyTheme(button.dataset.theme); });
$("themeButton").addEventListener("click", () => $("themeDialog").showModal());
$("closeTheme").addEventListener("click", () => $("themeDialog").close());
$("themeDialog").addEventListener("click", event => { const button = event.target.closest("[data-theme]"); if (button) { applyTheme(button.dataset.theme); $("themeDialog").close(); } });
$("renameDeck").addEventListener("click", () => {
  const next = window.prompt("Name your presentation", deck);
  if (next?.trim()) { deck = next.trim().slice(0, 60); $("deckName").textContent = deck; $("canvasDeckName").textContent = deck.toUpperCase(); renderSlide($("slideCanvas"), slides[current], current); renderPresenter(); }
});

document.addEventListener("keydown", event => {
  const editing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "Escape") { stopPresent(); if ($("themeDialog").open) $("themeDialog").close(); }
  if (editing || $("themeDialog").open) return;
  if (event.key === "ArrowRight") goTo(current + 1);
  if (event.key === "ArrowLeft") goTo(current - 1);
  if (event.key.toLowerCase() === "p") startPresent();
});

const saved = localStorage.getItem("presently-draft");
if (saved) {
  try {
    const draft = JSON.parse(saved);
    if (Array.isArray(draft.slides) && draft.slides.length && draft.slides.every(slide => typeof slide.title === "string" && typeof slide.subtitle === "string" && typeof slide.body === "string")) slides = draft.slides;
    if (themes.includes(draft.theme)) theme = draft.theme;
    if (typeof draft.deck === "string") deck = draft.deck;
    if (Number.isInteger(draft.current)) current = Math.max(0, Math.min(slides.length - 1, draft.current));
  } catch { localStorage.removeItem("presently-draft"); }
}
applyTheme(theme);
syncForm();
