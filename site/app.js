const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local demo state only */ }
  },
};

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function seededRandom(seed = 167) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function drawAncientMap() {
  const canvas = document.querySelector("#procedural-map");
  const host = canvas.parentElement;
  const width = host.clientWidth;
  const height = host.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const random = seededRandom(167);
  const point = ([x, y]) => [x * width, y * height];

  ctx.fillStyle = "#758184";
  ctx.fillRect(0, 0, width, height);

  const paper = ctx.createRadialGradient(width * 0.52, height * 0.45, 20, width * 0.5, height * 0.48, width * 0.75);
  paper.addColorStop(0, "rgba(234,220,178,.16)");
  paper.addColorStop(1, "rgba(37,43,42,.20)");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  const regions = [
    { color: "#a9844b", points: [[.05,.31],[.18,.18],[.34,.21],[.39,.37],[.34,.54],[.18,.65],[.05,.57]] },
    { color: "#9b9b76", points: [[.18,.18],[.30,.08],[.50,.10],[.62,.22],[.55,.39],[.39,.37],[.34,.21]] },
    { color: "#b29551", points: [[.18,.65],[.34,.54],[.39,.37],[.55,.39],[.63,.58],[.53,.73],[.31,.79]] },
    { color: "#9b6554", points: [[.55,.39],[.62,.22],[.82,.18],[.96,.30],[.93,.57],[.78,.69],[.63,.58]] },
    { color: "#80905f", points: [[.31,.79],[.53,.73],[.63,.58],[.78,.69],[.86,.84],[.68,.94],[.45,.91]] },
  ];

  function regionPath(points) {
    const [firstX, firstY] = point(points[0]);
    ctx.beginPath();
    ctx.moveTo(firstX, firstY);
    for (let index = 1; index < points.length; index += 1) {
      const previous = point(points[index - 1]);
      const current = point(points[index]);
      const midX = (previous[0] + current[0]) / 2 + (random() - 0.5) * 13;
      const midY = (previous[1] + current[1]) / 2 + (random() - 0.5) * 13;
      ctx.quadraticCurveTo(midX, midY, current[0], current[1]);
    }
    ctx.closePath();
  }

  regions.forEach((region) => {
    regionPath(region.points);
    ctx.fillStyle = region.color;
    ctx.globalAlpha = 0.86;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(55,45,31,.48)";
    ctx.lineWidth = 1.15;
    ctx.stroke();
  });

  ctx.save();
  ctx.globalAlpha = 0.23;
  ctx.strokeStyle = "#efe3c4";
  ctx.lineWidth = 0.65;
  for (let row = 0; row < 18; row += 1) {
    const y = 22 + row * 34 + random() * 14;
    for (let x = 8 + random() * 18; x < width; x += 45 + random() * 34) {
      ctx.beginPath();
      ctx.arc(x, y, 5 + random() * 7, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    }
  }
  ctx.restore();

  function mountain(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.55);
    ctx.quadraticCurveTo(x - size * 0.48, y - size * 0.2, x, y - size);
    ctx.quadraticCurveTo(x + size * 0.48, y - size * 0.2, x + size, y + size * 0.55);
    ctx.moveTo(x - size * 0.45, y + size * 0.25);
    ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.5, y + size * 0.25);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(54,45,32,.62)";
  ctx.lineWidth = 0.75;
  const ranges = [
    [.14,.43,.29,.41], [.31,.25,.47,.23], [.40,.56,.58,.52],
    [.61,.33,.81,.31], [.66,.61,.86,.56], [.35,.73,.53,.72],
  ];
  ranges.forEach(([x1, y1, x2, y2]) => {
    const count = 7;
    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      const x = (x1 + (x2 - x1) * t) * width;
      const y = (y1 + (y2 - y1) * t) * height + Math.sin(t * Math.PI * 2) * 9;
      mountain(x, y, 9 + random() * 8);
    }
  });

  function river(points) {
    ctx.beginPath();
    const [x, y] = point(points[0]);
    ctx.moveTo(x, y);
    for (let index = 1; index < points.length; index += 1) {
      const [px, py] = point(points[index - 1]);
      const [cx, cy] = point(points[index]);
      ctx.bezierCurveTo(px + (cx - px) * 0.55, py, px + (cx - px) * 0.42, cy, cx, cy);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(62,83,85,.78)";
  ctx.lineWidth = 2.1;
  river([[.42,.12],[.46,.31],[.43,.52],[.49,.72],[.45,.91]]);
  river([[.62,.24],[.66,.39],[.61,.57],[.67,.80]]);
  ctx.strokeStyle = "rgba(215,222,204,.35)";
  ctx.lineWidth = 0.75;
  river([[.42,.12],[.46,.31],[.43,.52],[.49,.72],[.45,.91]]);

  ctx.save();
  ctx.setLineDash([5, 7]);
  ctx.strokeStyle = "rgba(110,39,32,.65)";
  ctx.lineWidth = 1.2;
  river([[.19,.55],[.34,.48],[.47,.58],[.64,.43],[.81,.36]]);
  ctx.restore();
  [[.19,.55],[.34,.48],[.47,.58],[.64,.43],[.81,.36]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(142,45,35,.82)";
    ctx.arc(x * width, y * height, 3.1, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.save();
  ctx.translate(width * 0.085, height * 0.84);
  ctx.strokeStyle = "rgba(238,224,190,.48)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  for (let ray = 0; ray < 16; ray += 1) {
    ctx.rotate(Math.PI / 8);
    ctx.moveTo(0, -20);
    ctx.lineTo(0, -38);
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.14;
  for (let index = 0; index < 900; index += 1) {
    const x = random() * width;
    const y = random() * height;
    ctx.fillStyle = random() > 0.5 ? "#2a251d" : "#fff3d2";
    ctx.fillRect(x, y, random() * 1.3 + 0.2, random() * 1.1 + 0.2);
  }
  ctx.restore();
}

drawAncientMap();
let mapResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(mapResizeTimer);
  mapResizeTimer = setTimeout(drawAncientMap, 120);
});

function nextSaturdayAtEleven() {
  const now = Date.now();
  const china = new Date(now + 8 * 60 * 60 * 1000);
  let daysAhead = (6 - china.getUTCDay() + 7) % 7;
  let target = Date.UTC(
    china.getUTCFullYear(),
    china.getUTCMonth(),
    china.getUTCDate() + daysAhead,
    3, 0, 0,
  );
  if (target <= now) target += 7 * 24 * 60 * 60 * 1000;
  return target;
}

let nextUpdate = nextSaturdayAtEleven();
function updateCountdown() {
  const remaining = Math.max(0, nextUpdate - Date.now());
  if (!remaining) nextUpdate = nextSaturdayAtEleven();
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  document.querySelector("#count-days").textContent = String(days).padStart(2, "0");
  document.querySelector("#count-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#count-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#count-seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const subscribeButton = document.querySelector("#subscribe-button");
function renderSubscription() {
  const subscribed = storage.get("fanren-subscription", false);
  subscribeButton.classList.toggle("subscribed", subscribed);
  subscribeButton.textContent = subscribed ? "传音符已收下" : "设下周六传音";
}
renderSubscription();
subscribeButton.addEventListener("click", () => {
  const next = !storage.get("fanren-subscription", false);
  storage.set("fanren-subscription", next);
  renderSubscription();
  showToast(next ? "传音符已收入储物袋，周六见" : "已撤下本周传音符");
});

const nodeContent = {
  episode: {
    eyebrow: "本周残图 · 正片节点",
    title: "新章已现世",
    copy: "周六 11:00 正片节点已标记。沿图向东，可继续找到本集剧情坐标与道友解析。",
    action: "查看本周路线",
  },
  story: {
    eyebrow: "本周残图 · 剧情坐标",
    title: "六处行迹已辨明",
    copy: "人物、法宝、地点与关键事件被归入同一张路线图，适合看完正片后快速回顾。",
    action: "展开剧情坐标",
  },
  analysis: {
    eyebrow: "本周残图 · 百家论道",
    title: "八份解析已收录",
    copy: "残图只保留标题、作者与原址入口，不搬运正文，让好内容回到创作者身边。",
    action: "寻找优质解析",
  },
  remix: {
    eyebrow: "本周残图 · 灵感集市",
    title: "二十四份二创入图",
    copy: "从绘画、剪辑到原著考据，巡检器按更新时间和热度持续补全本周灵感坐标。",
    action: "前往灵感集市",
  },
};

document.querySelectorAll(".map-marker").forEach((marker) => {
  marker.addEventListener("click", () => {
    document.querySelectorAll(".map-marker").forEach((item) => item.classList.remove("active"));
    marker.classList.add("active");
    const content = nodeContent[marker.dataset.node];
    document.querySelector("#node-eyebrow").textContent = content.eyebrow;
    document.querySelector("#node-title").textContent = content.title;
    document.querySelector("#node-copy").textContent = content.copy;
    document.querySelector("#node-action").firstChild.textContent = `${content.action} `;
  });
});

document.querySelector("#node-action").addEventListener("click", () => {
  document.querySelector("#route").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".content-tabs button").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".content-tabs button").forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });
    document.querySelectorAll(".content-card").forEach((card) => {
      card.classList.toggle("hidden", tab.dataset.filter !== "all" && card.dataset.kind !== tab.dataset.filter);
    });
  });
});

let savedItems = storage.get("fanren-bag", []);
function renderBag() {
  document.querySelector("#bag-count").textContent = String(savedItems.length);
  document.querySelectorAll(".save-button").forEach((button) => {
    const saved = savedItems.includes(button.dataset.save);
    button.classList.toggle("saved", saved);
    button.textContent = saved ? "已收入储物袋" : "收入储物袋";
  });
}
renderBag();
document.querySelectorAll(".save-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.save;
    savedItems = savedItems.includes(id) ? savedItems.filter((item) => item !== id) : [...savedItems, id];
    storage.set("fanren-bag", savedItems);
    renderBag();
    showToast(savedItems.includes(id) ? "已收入储物袋" : "已从储物袋移出");
  });
});
document.querySelector("#open-bag").addEventListener("click", () => {
  showToast(savedItems.length ? `储物袋中已有 ${savedItems.length} 份内容` : "储物袋还是空的，去寻些宝物吧");
});

const baseVotes = { treasure: 592, "old-friend": 437, "new-place": 257 };
function renderVotes(choice) {
  const votes = { ...baseVotes };
  if (choice) votes[choice] += 1;
  const total = Object.values(votes).reduce((sum, value) => sum + value, 0);
  document.querySelector("#vote-total").textContent = total.toLocaleString("zh-CN");
  Object.entries(votes).forEach(([key, value]) => {
    const percentage = Math.round((value / total) * 100);
    document.querySelector(`[data-percent="${key}"]`).textContent = `${percentage}%`;
    document.querySelector(`[data-bar="${key}"]`).style.setProperty("--vote-width", `${percentage}%`);
  });
}
const existingVote = storage.get("fanren-prediction", null);
if (existingVote) {
  const radio = document.querySelector(`input[name="prediction"][value="${existingVote}"]`);
  if (radio) radio.checked = true;
}
renderVotes(existingVote);
document.querySelector("#prediction-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = new FormData(event.currentTarget).get("prediction");
  if (!selected) return showToast("请先选择一条线索");
  storage.set("fanren-prediction", selected);
  renderVotes(selected);
  showToast("这一念已经落下，周六见分晓");
});

const checkinButton = document.querySelector("#checkin-button");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
function renderCheckin() {
  const checked = storage.get("fanren-checkin", "") === today;
  checkinButton.classList.toggle("checked", checked);
  checkinButton.disabled = checked;
  checkinButton.querySelector("span").textContent = checked ? "今日已签到" : "每日签到";
  checkinButton.querySelector("b").textContent = checked ? "灵砂 +10" : "+10 灵砂";
}
renderCheckin();
checkinButton.addEventListener("click", () => {
  storage.set("fanren-checkin", today);
  renderCheckin();
  showToast("今日签到完成，获得 10 灵砂");
});

document.querySelector("#share-map").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    showToast("残图地址已抄录");
  } catch {
    showToast("可复制浏览器地址分享残图");
  }
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".main-nav a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { threshold: [0.18, 0.45] });
  sections.forEach((section) => observer.observe(section));
}
