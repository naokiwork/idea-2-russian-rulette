import { shouldHit } from './src/gameMath.js';

const STORAGE_KEY = 'rr-shot-state';
const LOCALE_STORAGE_KEY = 'rr-shot-locale';

const locale = {
  current: 'ja',
  data: {},
};

const state = {
  events: [
    {
      id: 'evt-001',
      title: 'サークル飲み',
      time: '21:00',
      date: '2025/11/14',
      players: 6,
      preset: {
        name: 'Circle Night',
        maxPlayers: 6,
        shotCount: 1,
        chambers: 6,
        bullets: 2,
        penalty: 'shot',
        rounds: 8,
        privacy: 'private',
        nonAlcohol: false,
      },
    },
    {
      id: 'evt-002',
      title: 'ゼミ飲み',
      time: '22:30',
      date: '2025/11/15',
      players: 5,
      preset: {
        name: 'Lab Party',
        maxPlayers: 5,
        shotCount: 1,
        chambers: 6,
        bullets: 1,
        penalty: 'dare',
        rounds: 6,
        privacy: 'private',
        nonAlcohol: false,
      },
    },
    {
      id: 'evt-003',
      title: 'クリスマス前夜',
      time: '20:00',
      date: '2025/12/20',
      players: 8,
      preset: {
        name: 'Holiday Blast',
        maxPlayers: 8,
        shotCount: 1,
        chambers: 8,
        bullets: 2,
        penalty: 'water',
        rounds: 10,
        privacy: 'public',
        nonAlcohol: true,
      },
    },
  ],
  history: [
    {
      id: 'hist-001',
      name: 'Friday Russian',
      date: '2025/11/10',
      duration: '32m',
      players: 4,
      mvp: 'Naoki',
    },
    {
      id: 'hist-002',
      name: 'Lab Party',
      date: '2025/11/03',
      duration: '27m',
      players: 5,
      mvp: 'Ken',
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
  quickGameForm: document.getElementById('quickGameForm'),
  eventList: document.getElementById('eventList'),
  roomMeta: document.getElementById('roomMeta'),
  qrPlaceholder: document.getElementById('qrPlaceholder'),
  copyInvite: document.getElementById('copyInvite'),
  playerList: document.getElementById('playerList'),
  toggleReady: document.getElementById('toggleReady'),
  startGame: document.getElementById('startGame'),
  roundLabel: document.getElementById('roundLabel'),
  turnLabel: document.getElementById('turnLabel'),
  turnInfo: document.getElementById('turnInfo'),
  pullTrigger: document.getElementById('pullTrigger'),
  endGame: document.getElementById('endGame'),
  toggleNonAlcohol: document.getElementById('toggleNonAlcohol'),
  roundHistory: document.getElementById('roundHistory'),
  safetyAlert: document.getElementById('safetyAlert'),
  resultContent: document.getElementById('resultContent'),
  rematch: document.getElementById('rematch'),
  shareResult: document.getElementById('shareResult'),
  historyList: document.getElementById('historyList'),
  safetyGuide: document.getElementById('safetyGuide'),
  guideModal: document.getElementById('guideModal'),
  closeGuide: document.getElementById('closeGuide'),
  headerQuickStart: document.getElementById('headerQuickStart'),
  heroQuickStart: document.getElementById('heroQuickStart'),
  heroEventStart: document.getElementById('heroEventStart'),
  heroJoinEvent: document.getElementById('heroJoinEvent'),
  toastRegion: document.getElementById('toastRegion'),
  modalToggleNonAlcohol: document.getElementById('modalToggleNonAlcohol'),
  localeSelect: document.getElementById('localeSelect'),
};

async function init() {
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'ja';
  await loadLocale(savedLocale, { skipRefresh: true });
  renderEvents();
  renderHistory();
  hydrateState();
  selectors.quickGameForm.addEventListener('submit', handleQuickGameSubmit);
  selectors.copyInvite.addEventListener('click', copyInviteLink);
  selectors.toggleReady.addEventListener('click', () =>
    togglePlayerReady('Naoki')
  );
  selectors.startGame.addEventListener('click', startGame);
  selectors.pullTrigger.addEventListener('click', pullTrigger);
  selectors.endGame.addEventListener('click', finishGame);
  selectors.toggleNonAlcohol.addEventListener('click', toggleNonAlcoholMode);
  selectors.rematch.addEventListener('click', rematch);
  selectors.shareResult.addEventListener('click', shareResults);
  selectors.safetyGuide.addEventListener('click', openGuide);
  selectors.closeGuide.addEventListener('click', closeGuide);
  selectors.guideModal.addEventListener('click', (e) => {
    if (e.target === selectors.guideModal) closeGuide();
  });

  const quickButtons = [
    selectors.headerQuickStart,
    selectors.heroQuickStart,
  ].filter(Boolean);
  quickButtons.forEach((btn) =>
    btn.addEventListener('click', () =>
      document
        .getElementById('quick-game')
        .scrollIntoView({ behavior: 'smooth' })
    )
  );
  selectors.heroEventStart?.addEventListener('click', () =>
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' })
  );
  selectors.heroJoinEvent?.addEventListener('click', () =>
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' })
  );
  selectors.modalToggleNonAlcohol?.addEventListener('click', () => {
    toggleNonAlcoholMode(true);
    closeGuide();
    showToast(
      t('toast.nonAlcohol.on', {}, '非アルモードをONにしました'),
      'success'
    );
  });
  selectors.localeSelect?.addEventListener('change', (event) =>
    loadLocale(event.target.value)
  );
  if (selectors.localeSelect) {
    selectors.localeSelect.value = savedLocale;
  }
}

function handleQuickGameSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const config = Object.fromEntries(formData.entries());
  config.maxPlayers = Number(config.maxPlayers);
  config.shotCount = Number(config.shotCount);
  config.chambers = Number(config.chambers);
  config.bullets = Number(config.bullets);
  config.rounds =
    config.rounds === 'unlimited' ? Infinity : Number(config.rounds);
  config.nonAlcohol = formData.get('nonAlcohol') === 'on';
  createRoom(config);
}

function createRoom(config) {
  state.currentRoom = {
    id: generateRoomId(),
    ...config,
    link: `https://roulette.party/room/${crypto.randomUUID?.() || Date.now()}`,
  };
  const roster = ['Naoki', 'Taro', 'Yuko', 'Ken', 'Mika', 'Leo', 'Aya', 'Ren'];
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
  persistState();
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
          <p>${t(
            'events.cardMeta',
            { players: event.players, rounds: event.preset.rounds || '∞' },
            `${event.players} players · プリセット ${event.preset.rounds || '∞'} rounds`
          )}</p>
        </div>
        <button class="secondary" data-event="${event.id}">
          ${t('buttons.startFromEvent', {}, 'このイベントで開始')}
        </button>
      </li>`
    )
    .join(' ');

  selectors.eventList
    .querySelectorAll('button')
    .forEach((btn) =>
      btn.addEventListener('click', () => startFromEvent(btn.dataset.event))
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
    selectors.roomMeta.textContent = t('lobby.metaEmpty', {}, 'ルーム未作成');
    selectors.qrPlaceholder.textContent = t(
      'lobby.qrPlaceholder',
      {},
      'QRコード生成中…'
    );
    selectors.copyInvite.disabled = true;
    selectors.playerList.innerHTML = '';
    selectors.startGame.disabled = true;
    return;
  }
  selectors.roomMeta.textContent = `${state.currentRoom.name} · Room ${state.currentRoom.id}`;
  const qrJoin = t('lobby.qrJoin', {}, 'Scan to join');
  selectors.qrPlaceholder.textContent = `#${state.currentRoom.id}\n${qrJoin}`;
  selectors.copyInvite.disabled = false;
  const readyLabel = t('status.ready', {}, 'Ready');
  const waitingLabel = t('status.waiting', {}, '待機中');
  selectors.playerList.innerHTML = state.players
    .map(
      (player) => `
        <li class="player-item ${player.ready ? 'ready' : ''}">
          <span>${player.isHost ? '👑 ' : ''}${player.name}</span>
          <span>${player.ready ? `✅ ${readyLabel}` : `… ${waitingLabel}`}</span>
        </li>`
    )
    .join(' ');
  selectors.toggleReady.textContent = state.players[0]?.ready
    ? t('buttons.cancelReady', {}, 'Ready解除')
    : t('buttons.readySelf', {}, '自分をReady');
  selectors.startGame.disabled = !state.players.every((p) => p.ready);
}

function togglePlayerReady(name) {
  const player = state.players.find((p) => p.name === name);
  if (!player) return;
  player.ready = !player.ready;
  updateLobbyUI();
  const status = player.ready
    ? t('status.ready', {}, 'Ready')
    : t('status.waiting', {}, '待機中');
  showToast(
    t(
      'toast.readyStatus',
      { name: player.name, status },
      `${player.name} を${status}に設定しました`
    ),
    'info'
  );
  persistState();
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
  persistState();
}

function updateGameplayUI() {
  if (!state.isGameActive) {
    selectors.roundLabel.textContent = 'Round —';
    selectors.turnLabel.textContent = t(
      'gameplay.turnWaiting',
      {},
      'ロビー待機中…'
    );
    selectors.turnInfo.textContent = t(
      'gameplay.waitInfo',
      {},
      'プレイヤーが揃うと開始できます。'
    );
    selectors.pullTrigger.disabled = true;
    selectors.endGame.disabled = true;
    selectors.toggleNonAlcohol.disabled = true;
    selectors.roundHistory.innerHTML = '';
  } else {
    selectors.roundLabel.textContent = `Round ${state.round}`;
    const currentPlayer = state.players[state.turnIndex];
    selectors.turnLabel.textContent = t(
      'gameplay.turnLabel',
      { name: currentPlayer.name },
      `${currentPlayer.name} のターン`
    );
    selectors.turnInfo.textContent = state.nonAlcohol
      ? t(
          'gameplay.infoNonAlcohol',
          {},
          '非アルモード中：ペナルティはウォーター/ジョーク'
        )
      : t('gameplay.infoAlcohol', {}, '⚠ 飲み過ぎ注意：ヒットしたらショット');
    selectors.pullTrigger.disabled = false;
    selectors.endGame.disabled = false;
    selectors.toggleNonAlcohol.disabled = false;
  }
  selectors.toggleNonAlcohol.textContent = state.nonAlcohol
    ? t('buttons.nonAlcoholOff', {}, '🛡 非アルモード OFF')
    : t('buttons.nonAlcoholOn', {}, '🛡 非アルモード ON');
  renderRoundHistory();
  handleSafetyAlert();
}

function pullTrigger() {
  const player = state.players[state.turnIndex];
  const isHit = shouldHit(
    state.currentRoom.bullets,
    state.currentRoom.chambers
  );
  const entry = {
    round: state.round,
    player: player.name,
    result: isHit ? 'HIT' : 'SAFE',
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
    if (
      state.currentRoom.rounds !== Infinity &&
      state.round > state.currentRoom.rounds
    ) {
      finishGame();
      return;
    }
  } else {
    state.turnIndex = (state.turnIndex + 1) % state.players.length;
  }
  updateGameplayUI();
  persistState();
}

function renderRoundHistory() {
  selectors.roundHistory.innerHTML = state.roundLogs
    .map(
      (log) => `
        <li>
          <strong>R${log.round}</strong> · ${log.player}
          <span style="color:${log.result === 'HIT' ? 'var(--danger)' : 'var(--positive)'}">
            ${log.result}
          </span>
        </li>`
    )
    .join(' ');
}

function handleSafetyAlert() {
  const maxHits = Math.max(...state.players.map((p) => p.hits), 0);
  const shouldAlert = maxHits >= 3 && !state.nonAlcohol;
  selectors.safetyAlert.hidden = !shouldAlert;
  if (shouldAlert) {
    selectors.toggleNonAlcohol.classList.add('danger');
  } else {
    selectors.toggleNonAlcohol.classList.remove('danger');
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
  persistState();
}

function renderResults() {
  if (!state.results) {
    selectors.resultContent.innerHTML = '<p>まだ結果はありません。</p>';
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
    .join(' ');
  const summary = t(
    'results.summary',
    { rounds: state.results.rounds, players: state.players.length },
    `${state.results.rounds} ラウンド · ${state.players.length} players`
  );
  selectors.resultContent.innerHTML = `
    <p>${summary}</p>
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
          <p>${t(
            'history.cardMeta',
            { players: hist.players, mvp: hist.mvp },
            `${hist.players} players · MVP ${hist.mvp}`
          )}</p>
          <button class="ghost" data-history="${hist.id}">
            ${t('buttons.viewDetail', {}, '詳細を見る')}
          </button>
        </li>`
    )
    .join(' ');

  selectors.historyList
    .querySelectorAll('button')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        showHistoryDetail(btn.dataset.history)
      )
    );
}

function showHistoryDetail(historyId) {
  const hist = state.history.find((item) => item.id === historyId);
  if (!hist) return;
  showToast(`${hist.name} · MVP ${hist.mvp} · 詳細は近日追加予定`, 'info');
}

function copyInviteLink() {
  if (!state.currentRoom?.link) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(state.currentRoom.link)
      .then(() =>
        showToast(
          t('toast.copy.success', {}, '招待リンクをコピーしました'),
          'success'
        )
      )
      .catch(() =>
        showToast(
          t('toast.copy.fail', {}, 'クリップボードにアクセスできませんでした'),
          'warning'
        )
      );
  } else {
    showToast(
      t(
        'toast.copy.fallback',
        { link: state.currentRoom.link },
        `リンク: ${state.currentRoom.link}`
      ),
      'warning',
      6000
    );
  }
}

function toggleNonAlcoholMode(forceValue) {
  state.nonAlcohol =
    typeof forceValue === 'boolean' ? forceValue : !state.nonAlcohol;
  selectors.toggleNonAlcohol.textContent = state.nonAlcohol
    ? '🛡 非アルモード OFF'
    : '🛡 非アルモード ON';
  updateGameplayUI();
  showToast(
    state.nonAlcohol
      ? t('toast.nonAlcohol.on', {}, '非アルモードをONにしました')
      : t('toast.nonAlcohol.off', {}, '非アルモードをOFFにしました'),
    state.nonAlcohol ? 'success' : 'info'
  );
  persistState();
}

function rematch() {
  if (!state.currentRoom) return;
  startGame();
  showToast(t('toast.rematch', {}, '再戦を開始しました'), 'info');
  persistState();
}

async function shareResults() {
  if (!state.results) {
    showToast(
      t('toast.share.missing', {}, 'シェアできる結果がまだありません'),
      'warning'
    );
    return;
  }
  try {
    const dataUrl = await generateShareImage();
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const fileName = `roulette-result-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });
    const shareText = t(
      'share.caption',
      {
        winner: state.results.ranking[0]?.name || 'N/A',
        rounds: state.results.rounds,
      },
      `勝者: ${state.results.ranking[0]?.name || 'N/A'} · ${state.results.rounds} ラウンド`
    );

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Russian Roulette Shot Game',
        text: shareText,
        files: [file],
      });
      showToast(
        t('toast.share.shared', {}, '結果をシェアしました！'),
        'success'
      );
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(
        t(
          'toast.share.download',
          {},
          '画像をダウンロードしました。SNSにアップしてください。'
        ),
        'info'
      );
    }
  } catch (error) {
    console.error(error);
    showToast(
      t('toast.share.error', {}, 'シェア画像の生成に失敗しました'),
      'danger'
    );
  }
}

function openGuide() {
  selectors.guideModal.dataset.open = 'true';
}

function closeGuide() {
  selectors.guideModal.dataset.open = 'false';
}

async function loadLocale(lang, options = {}) {
  try {
    const response = await fetch(`./locales/${lang}.json`);
    if (!response.ok) throw new Error(`Locale ${lang} not found`);
    locale.data = await response.json();
    locale.current = lang;
    localStorage.setItem(LOCALE_STORAGE_KEY, lang);
    applyTranslations();
    if (!options.skipRefresh) {
      renderEvents();
      renderHistory();
      updateLobbyUI();
      updateGameplayUI();
      renderResults();
    }
  } catch (error) {
    console.warn('Failed to load locale', lang, error);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    if (!node.dataset.i18nFallback) {
      node.dataset.i18nFallback =
        node.dataset.i18nType === 'html' ? node.innerHTML : node.textContent;
    }
    const fallback = node.dataset.i18nFallback || '';
    const text = t(node.dataset.i18n, {}, fallback);
    if (node.dataset.i18nType === 'html') {
      node.innerHTML = text;
    } else {
      node.textContent = text;
    }
  });
}

function t(key, vars = {}, fallback = '') {
  const template = locale.data[key] ?? fallback ?? key;
  return template.replace(/\{(\w+)\}/g, (_, token) => vars[token] ?? '');
}

function showToast(message, variant = 'info', duration = 4000) {
  if (!selectors.toastRegion) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.variant = variant;
  toast.textContent = message;
  selectors.toastRegion.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
      },
      { once: true }
    );
  }, duration);
}

async function generateShareImage() {
  const width = 1280;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#b347ff');
  gradient.addColorStop(0.5, '#ff5fa2');
  gradient.addColorStop(1, '#ff9a44');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0b0413';
  ctx.font = "bold 64px 'Space Grotesk', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(
    t('share.graphicTitle', {}, 'Russian Roulette Shot Game'),
    width / 2,
    150
  );

  ctx.font = "48px 'Space Grotesk', sans-serif";
  const winner = state.results?.ranking[0];
  ctx.fillText(
    t(
      'share.championLabel',
      { name: winner?.name || '未知のプレイヤー' },
      `Champion: ${winner?.name || '未知のプレイヤー'}`
    ),
    width / 2,
    260
  );

  ctx.font = "32px 'Space Grotesk', sans-serif";
  ctx.fillText(
    t(
      'share.summary',
      { rounds: state.results?.rounds || 0, players: state.players.length },
      `${state.results?.rounds || 0} Rounds · ${state.players.length} Players`
    ),
    width / 2,
    330
  );

  ctx.textAlign = 'left';
  ctx.font = "28px 'Space Grotesk', sans-serif";
  ctx.fillText(t('share.topPerformers', {}, 'Top Performers'), 120, 420);

  ctx.font = "26px 'Space Grotesk', sans-serif";
  state.results?.ranking.slice(0, 3).forEach((player, index) => {
    const y = 470 + index * 60;
    ctx.fillText(
      t(
        'share.listItem',
        { rank: index + 1, name: player.name, hits: player.hits },
        `${index + 1}. ${player.name} – ${player.hits} hits`
      ),
      140,
      y
    );
  });

  ctx.textAlign = 'center';
  ctx.font = "24px 'Space Grotesk', sans-serif";
  ctx.fillText(
    t('share.hashtag', {}, '#DrinkResponsibly'),
    width / 2,
    height - 80
  );

  return canvas.toDataURL('image/png');
}

function persistState() {
  try {
    const snapshot = {
      currentRoom: state.currentRoom,
      players: state.players,
      history: state.history,
      round: state.round,
      turnIndex: state.turnIndex,
      isGameActive: state.isGameActive,
      roundLogs: state.roundLogs,
      results: state.results,
      nonAlcohol: state.nonAlcohol,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to persist state', error);
  }
}

function hydrateState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    updateLobbyUI();
    updateGameplayUI();
    renderResults();
    renderHistory();
  } catch (error) {
    console.warn('Failed to hydrate state', error);
  }
}

init();
