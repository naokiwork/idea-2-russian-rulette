const state = {
  events: [
    {
      id: "evt-001",
      title: "サークル飲み",
      time: "21:00",
      date: "2025/11/14",
      players: 6,
      preset: {
        name: "Circle Night",
        maxPlayers: 6,
        shotCount: 1,
        chambers: 6,
        bullets: 2,
        penalty: "shot",
        rounds: 8,
        privacy: "private",
        nonAlcohol: false,
      },
    },
    {
      id: "evt-002",
      title: "ゼミ飲み",
      time: "22:30",
      date: "2025/11/15",
      players: 5,
      preset: {
        name: "Lab Party",
        maxPlayers: 5,
        shotCount: 1,
        chambers: 6,
        bullets: 1,
        penalty: "dare",
        rounds: 6,
        privacy: "private",
        nonAlcohol: false,
      },
    },
    {
      id: "evt-003",
      title: "クリスマス前夜",
      time: "20:00",
      date: "2025/12/20",
      players: 8,
      preset: {
        name: "Holiday Blast",
        maxPlayers: 8,
        shotCount: 1,
        chambers: 8,
        bullets: 2,
        penalty: "water",
        rounds: 10,
        privacy: "public",
        nonAlcohol: true,
      },
    },
  ],
  history: [
    {
      id: "hist-001",
      name: "Friday Russian",
      date: "2025/11/10",
      duration: "32m",
      players: 4,
      mvp: "Naoki",
    },
    {
      id: "hist-002",
      name: "Lab Party",
      date: "2025/11/03",
      duration: "27m",
      players: 5,
      mvp: "Ken",
    },
  ],
  currentRoom: null,
  players: [],
  round: 0,
  turnIndex: 0,
  isGameActive: false,
  roundLogs: [],
  results: null,
  nonAlcohol: false,
};

const selectors = {
  quickGameForm: document.getElementById("quickGameForm"),
  eventList: document.getElementById("eventList"),
  roomMeta: document.getElementById("roomMeta"),
  qrPlaceholder: document.getElementById("qrPlaceholder"),
  copyInvite: document.getElementById("copyInvite"),
  playerList: document.getElementById("playerList"),
  toggleReady: document.getElementById("toggleReady"),
  startGame: document.getElementById("startGame"),
  roundLabel: document.getElementById("roundLabel"),
  turnLabel: document.getElementById("turnLabel"),
  turnInfo: document.getElementById("turnInfo"),
  pullTrigger: document.getElementById("pullTrigger"),
  endGame: document.getElementById("endGame"),
  toggleNonAlcohol: document.getElementById("toggleNonAlcohol"),
  roundHistory: document.getElementById("roundHistory"),
  safetyAlert: document.getElementById("safetyAlert"),
  resultContent: document.getElementById("resultContent"),
  rematch: document.getElementById("rematch"),
  shareResult: document.getElementById("shareResult"),
  historyList: document.getElementById("historyList"),
  safetyGuide: document.getElementById("safetyGuide"),
  guideModal: document.getElementById("guideModal"),
  closeGuide: document.getElementById("closeGuide"),
  headerQuickStart: document.getElementById("headerQuickStart"),
  heroQuickStart: document.getElementById("heroQuickStart"),
  heroEventStart: document.getElementById("heroEventStart"),
  heroJoinEvent: document.getElementById("heroJoinEvent"),
};

function init() {
  renderEvents();
  renderHistory();
  selectors.quickGameForm.addEventListener("submit", handleQuickGameSubmit);
  selectors.copyInvite.addEventListener("click", copyInviteLink);
  selectors.toggleReady.addEventListener("click", () => togglePlayerReady("Naoki"));
  selectors.startGame.addEventListener("click", startGame);
  selectors.pullTrigger.addEventListener("click", pullTrigger);
  selectors.endGame.addEventListener("click", finishGame);
  selectors.toggleNonAlcohol.addEventListener("click", toggleNonAlcoholMode);
  selectors.rematch.addEventListener("click", rematch);
  selectors.shareResult.addEventListener("click", shareResults);
  selectors.safetyGuide.addEventListener("click", openGuide);
  selectors.closeGuide.addEventListener("click", closeGuide);
  selectors.guideModal.addEventListener("click", (e) => {
    if (e.target === selectors.guideModal) closeGuide();
  });

  const quickButtons = [
    selectors.headerQuickStart,
    selectors.heroQuickStart,
  ].filter(Boolean);
  quickButtons.forEach((btn) =>
    btn.addEventListener("click", () =>
      document.getElementById("quick-game").scrollIntoView({ behavior: "smooth" })
    )
  );
  selectors.heroEventStart?.addEventListener("click", () =>
    document.getElementById("events").scrollIntoView({ behavior: "smooth" })
  );
  selectors.heroJoinEvent?.addEventListener("click", () =>
    document.getElementById("events").scrollIntoView({ behavior: "smooth" })
  );
}

function handleQuickGameSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const config = Object.fromEntries(formData.entries());
  config.maxPlayers = Number(config.maxPlayers);
  config.shotCount = Number(config.shotCount);
  config.chambers = Number(config.chambers);
  config.bullets = Number(config.bullets);
  config.rounds = config.rounds === "unlimited" ? Infinity : Number(config.rounds);
  config.nonAlcohol = formData.get("nonAlcohol") === "on";
  createRoom(config);
}

function createRoom(config) {
  state.currentRoom = {
    id: generateRoomId(),
    ...config,
    link: `https://roulette.party/room/${crypto.randomUUID?.() || Date.now()}`,
  };
  const roster = ["Naoki", "Taro", "Yuko", "Ken", "Mika", "Leo", "Aya", "Ren"];
  state.players = roster.slice(0, config.maxPlayers).map((name, index) => ({
    name,
    ready: index === 0,
    isHost: index === 0,
    hits: 0,
    drinks: 0,
  }));
  state.round = 0;
  state.turnIndex = 0;
  state.isGameActive = false;
  state.roundLogs = [];
  state.results = null;
  state.nonAlcohol = config.nonAlcohol;
  updateLobbyUI();
  updateGameplayUI();
  renderResults();
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function renderEvents() {
  selectors.eventList.innerHTML = state.events
    .map(
      (event) => `
      <li class="event-card">
        <div>
          <p class="eyebrow">${event.date} · ${event.time}</p>
          <h4>${event.title}</h4>
          <p>${event.players} players · プリセット ${event.preset.rounds || "∞"} rounds</p>
        </div>
        <button class="secondary" data-event="${event.id}">このイベントで開始</button>
      </li>`
    )
    .join(" ");

  selectors.eventList.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => startFromEvent(btn.dataset.event))
  );
}

function startFromEvent(eventId) {
  const selected = state.events.find((evt) => evt.id === eventId);
  if (!selected) return;
  createRoom(selected.preset);
  selectors.roomMeta.textContent = `${selected.title} ルーム準備完了`;
}

function updateLobbyUI() {
  if (!state.currentRoom) {
    selectors.roomMeta.textContent = "ルーム未作成";
    selectors.qrPlaceholder.textContent = "QRコード生成中…";
    selectors.copyInvite.disabled = true;
    selectors.playerList.innerHTML = "";
    selectors.startGame.disabled = true;
    return;
  }
  selectors.roomMeta.textContent = `${state.currentRoom.name} · Room ${state.currentRoom.id}`;
  selectors.qrPlaceholder.textContent = `#${state.currentRoom.id}\nScan to join`;
  selectors.copyInvite.disabled = false;
  selectors.playerList.innerHTML = state.players
    .map(
      (player) => `
        <li class="player-item ${player.ready ? "ready" : ""}">
          <span>${player.isHost ? "👑 " : ""}${player.name}</span>
          <span>${player.ready ? "✅ Ready" : "…"}</span>
        </li>`
    )
    .join(" ");
  selectors.toggleReady.textContent = state.players[0]?.ready ? "Ready解除" : "自分をReady";
  selectors.startGame.disabled = !state.players.every((p) => p.ready);
}

function togglePlayerReady(name) {
  const player = state.players.find((p) => p.name === name);
  if (!player) return;
  player.ready = !player.ready;
  updateLobbyUI();
}

function startGame() {
  if (!state.currentRoom) return;
  state.isGameActive = true;
  state.round = 1;
  state.turnIndex = 0;
  state.roundLogs = [];
  state.players.forEach((p) => {
    p.ready = true;
    p.hits = 0;
    p.drinks = 0;
  });
  updateLobbyUI();
  updateGameplayUI();
}

function updateGameplayUI() {
  if (!state.isGameActive) {
    selectors.roundLabel.textContent = "Round —";
    selectors.turnLabel.textContent = "ロビー待機中";
    selectors.turnInfo.textContent = "プレイヤーが揃うと開始できます。";
    selectors.pullTrigger.disabled = true;
    selectors.endGame.disabled = true;
    selectors.toggleNonAlcohol.disabled = true;
    selectors.roundHistory.innerHTML = "";
  } else {
    selectors.roundLabel.textContent = `Round ${state.round}`;
    const currentPlayer = state.players[state.turnIndex];
    selectors.turnLabel.textContent = `${currentPlayer.name} のターン`;
    selectors.turnInfo.textContent = state.nonAlcohol
      ? "非アルモード中：ペナルティはウォーター/ジョーク"
      : "⚠ 飲み過ぎ注意：ヒットしたらショット";
    selectors.pullTrigger.disabled = false;
    selectors.endGame.disabled = false;
    selectors.toggleNonAlcohol.disabled = false;
  }
  selectors.toggleNonAlcohol.textContent = state.nonAlcohol
    ? "🛡 非アルモード OFF"
    : "🛡 非アルモード ON";
  renderRoundHistory();
  handleSafetyAlert();
}

function pullTrigger() {
  const player = state.players[state.turnIndex];
  const probability = state.currentRoom.bullets / state.currentRoom.chambers;
  const isHit = Math.random() < probability;
  const entry = {
    round: state.round,
    player: player.name,
    result: isHit ? "HIT" : "SAFE",
  };
  if (isHit) {
    player.hits += 1;
    player.drinks += state.nonAlcohol ? 0 : state.currentRoom.shotCount;
  }
  state.roundLogs.unshift(entry);
  if (state.roundLogs.length > 12) state.roundLogs.pop();

  if (isHit) {
    state.round += 1;
    state.turnIndex = 0;
    if (state.currentRoom.rounds !== Infinity && state.round > state.currentRoom.rounds) {
      finishGame();
      return;
    }
  } else {
    state.turnIndex = (state.turnIndex + 1) % state.players.length;
  }
  updateGameplayUI();
}

function renderRoundHistory() {
  selectors.roundHistory.innerHTML = state.roundLogs
    .map(
      (log) => `
        <li>
          <strong>R${log.round}</strong> · ${log.player}
          <span style="color:${log.result === "HIT" ? "var(--danger)" : "var(--positive)"}">
            ${log.result}
          </span>
        </li>`
    )
    .join(" ");
}

function handleSafetyAlert() {
  const maxHits = Math.max(...state.players.map((p) => p.hits), 0);
  const shouldAlert = maxHits >= 3 && !state.nonAlcohol;
  selectors.safetyAlert.hidden = !shouldAlert;
  if (shouldAlert) {
    selectors.toggleNonAlcohol.classList.add("danger");
  } else {
    selectors.toggleNonAlcohol.classList.remove("danger");
  }
}

function finishGame() {
  if (!state.isGameActive) return;
  state.isGameActive = false;
  const ranking = [...state.players].sort((a, b) => b.hits - a.hits);
  state.results = {
    ranking,
    rounds: state.round - 1,
    duration: `${Math.floor(Math.random() * 20) + 20} 分`,
  };
  state.history.unshift({
    id: generateRoomId(),
    name: state.currentRoom.name,
    date: new Date().toLocaleDateString(),
    duration: state.results.duration,
    players: state.players.length,
    mvp: ranking[0]?.name,
  });
  renderHistory();
  renderResults();
  updateGameplayUI();
}

function renderResults() {
  if (!state.results) {
    selectors.resultContent.innerHTML = "<p>まだ結果はありません。</p>";
    selectors.rematch.disabled = true;
    selectors.shareResult.disabled = true;
    return;
  }
  const rows = state.results.ranking
    .map(
      (player, index) => `
        <div class="result-card">
          <strong>${index + 1}. ${player.name}</strong>
          <p>${player.hits} hits · ${player.drinks} drinks</p>
        </div>`
    )
    .join(" ");
  selectors.resultContent.innerHTML = `
    <p>${state.results.rounds} ラウンド · ${state.players.length} players</p>
    <div class="result-grid">${rows}</div>
  `;
  selectors.rematch.disabled = false;
  selectors.shareResult.disabled = false;
}

function renderHistory() {
  selectors.historyList.innerHTML = state.history
    .map(
      (hist) => `
        <li class="event-card">
          <p class="eyebrow">${hist.date} · ${hist.duration}</p>
          <h4>${hist.name}</h4>
          <p>${hist.players} players · MVP ${hist.mvp}</p>
          <button class="ghost" data-history="${hist.id}">詳細を見る</button>
        </li>`
    )
    .join(" ");

  selectors.historyList.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => showHistoryDetail(btn.dataset.history))
  );
}

function showHistoryDetail(historyId) {
  const hist = state.history.find((item) => item.id === historyId);
  if (!hist) return;
  alert(
    `${hist.name}\n${hist.date}\n${hist.players} players\nMVP: ${hist.mvp}\nログは近日追加予定！`
  );
}

function copyInviteLink() {
  if (!state.currentRoom?.link) return;
  navigator.clipboard
    ?.writeText(state.currentRoom.link)
    .then(() => alert("招待リンクをコピーしました！"))
    .catch(() => alert(state.currentRoom.link));
}

function toggleNonAlcoholMode() {
  state.nonAlcohol = !state.nonAlcohol;
  selectors.toggleNonAlcohol.textContent = state.nonAlcohol
    ? "🛡 非アルモード OFF"
    : "🛡 非アルモード ON";
  updateGameplayUI();
}

function rematch() {
  if (!state.currentRoom) return;
  startGame();
}

function shareResults() {
  if (!state.results) return;
  alert("シェア用の画像を生成しました！（ダミー）");
}

function openGuide() {
  selectors.guideModal.dataset.open = "true";
}

function closeGuide() {
  selectors.guideModal.dataset.open = "false";
}

init();
