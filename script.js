const USERS_KEY = "acreta-users-v2";
const SESSION_KEY = "acreta-session-v1";
const POSTS_KEY = "acreta-posts-v4";
const VOTES_KEY = "acreta-votes-v1";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#53218f"/>
          <stop offset="100%" stop-color="#dd1b34"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)"/>
      <circle cx="60" cy="44" r="22" fill="#f5eef8" opacity="0.9"/>
      <path d="M24 102c6-18 22-28 36-28s30 10 36 28" fill="#f5eef8" opacity="0.9"/>
    </svg>
  `);

const groups = [
  { id: "todos", nome: "Todos", descricao: "Visão geral com tudo o que foi publicado." },
  { id: "terror-classico", nome: "Terror Clássico", descricao: "Casarões, vultos, maldições e atmosfera gótica." },
  { id: "ficcao-sombria", nome: "Ficção Sombria", descricao: "Sci-fi macabra, tecnologia hostil e futuros doentes." },
  { id: "horror-psicologico", nome: "Horror Psicológico", descricao: "Paranoia, memória falha e terror interno." },
  { id: "folk-horror", nome: "Folk Horror", descricao: "Vilarejos isolados, ritos antigos e natureza ameaçadora." },
  { id: "investigacao", nome: "Investigação Maldita", descricao: "Diários, fitas, fóruns apagados e pistas proibidas." },
  { id: "sobrenatural-urbano", nome: "Sobrenatural Urbano", descricao: "Metrôs, prédios, becos e horrores da cidade." },
  { id: "creepypasta", nome: "Creepypasta", descricao: "Relatos curtos, virais e perturbadores." },
  { id: "cosmico", nome: "Horror Cósmico", descricao: "Entidades imensas, insignificância e ruína mental." },
  { id: "corpo", nome: "Body Horror", descricao: "Transformações grotescas e carne fora de controle." },
  { id: "pesadelos-reais", nome: "Pesadelos Reais", descricao: "Relatos plausíveis, crimes estranhos e medo do cotidiano." }
];

const defaultPosts = [
  {
    id: crypto.randomUUID(),
    group: "creepypasta",
    title: "Borrasca",
    author: "ArquivoNeblina",
    owner: "ArquivoNeblina",
    content: "Uma indicação essencial para quem gosta de creepypasta longa e sufocante. Borrasca gira em torno de uma cidade cheia de segredos, desaparecimentos e uma sensação constante de que toda lembrança de infância esconde algo podre. Este post funciona como destaque e sinopse curta do conto, não como reprodução integral.",
    tags: ["creepypasta", "mistério", "cidade pequena"],
    votes: 402,
    createdAt: "2026-03-18T00:20:00"
  },
  {
    id: crypto.randomUUID(),
    group: "horror-psicologico",
    title: "Meu reflexo piscou antes de mim",
    author: "NoiteFixa",
    owner: "NoiteFixa",
    content: "Fiquei sem energia por três horas. Quando acendi a lanterna do celular no banheiro, o espelho já mostrava meu rosto. O problema é que eu ainda estava no corredor.",
    tags: ["espelho", "apartamento", "paranoia"],
    votes: 187,
    createdAt: "2026-03-16T23:48:00"
  },
  {
    id: crypto.randomUUID(),
    group: "ficcao-sombria",
    title: "O elevador do laboratório desceu para um andar negativo que não existia",
    author: "DrVeludo",
    owner: "DrVeludo",
    content: "O painel marcava -9. Nenhum de nós apertou esse botão. Quando a porta abriu, vimos uma ala inteira com nossas mesas, nossas fotos e os nossos corpos sentados, como se nunca tivéssemos saído dali.",
    tags: ["laboratório", "sci-fi", "duplicatas"],
    votes: 231,
    createdAt: "2026-03-15T19:10:00"
  },
  {
    id: crypto.randomUUID(),
    group: "folk-horror",
    title: "Na festa do milho ninguém pode olhar para o espantalho ao meio-dia",
    author: "SertaoFrio",
    owner: "SertaoFrio",
    content: "A regra parecia idiota até meu tio desobedecer. Quando o sino tocou, o espantalho estava usando a camisa dele. Meu tio continuou ao meu lado, mas já não lembrava o próprio nome.",
    tags: ["vilarejo", "ritual", "campo"],
    votes: 154,
    createdAt: "2026-03-14T11:42:00"
  },
  {
    id: crypto.randomUUID(),
    group: "sobrenatural-urbano",
    title: "A estação fechada apareceu no meio do trajeto",
    author: "MetroVazio",
    owner: "MetroVazio",
    content: "Todo mundo no vagão fingiu não ver. As portas abriram numa plataforma coberta de azulejos vermelhos e anúncios sem rosto. Um menino entrou, sentou na minha frente e perguntou por que eu ainda tinha sombra.",
    tags: ["metrô", "cidade", "fantasma"],
    votes: 203,
    createdAt: "2026-03-13T07:25:00"
  }
];

const state = {
  selectedGroup: "todos",
  filter: "all",
  posts: loadPosts(),
  users: loadUsers(),
  votes: loadVotes(),
  currentUser: loadSession()
};

const authGateEl = document.querySelector("#auth-gate");
const appShellEl = document.querySelector("#app-shell");
const showLoginEl = document.querySelector("#show-login");
const showRegisterEl = document.querySelector("#show-register");
const loginFormEl = document.querySelector("#login-form");
const registerFormEl = document.querySelector("#register-form");
const authFeedbackEl = document.querySelector("#auth-feedback");
const logoutButtonEl = document.querySelector("#logout-button");

const groupListEl = document.querySelector("#group-list");
const groupSelectEl = document.querySelector("#group");
const postFeedEl = document.querySelector("#post-feed");
const postTemplate = document.querySelector("#post-template");
const feedTitleEl = document.querySelector("#feed-title");
const formEl = document.querySelector("#post-form");
const authorInputEl = document.querySelector("#author");
const feedbackEl = document.querySelector("#form-feedback");
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
const profileNameEl = document.querySelector("#profile-name");
const profilePostCountEl = document.querySelector("#profile-post-count");
const profilePreviewAvatarEl = document.querySelector("#profile-preview-avatar");
const sessionIndicatorEl = document.querySelector("#session-indicator");
const sessionAvatarEl = document.querySelector("#session-avatar");
const profileFormEl = document.querySelector("#profile-form");
const displayNameInputEl = document.querySelector("#display-name");
const textColorInputEl = document.querySelector("#text-color");
const avatarFileInputEl = document.querySelector("#avatar-file");
const profileFeedbackEl = document.querySelector("#profile-feedback");
const resetAvatarEl = document.querySelector("#reset-avatar");

const rainToggleEl = document.querySelector("#rain-toggle");
const rainVolumeEl = document.querySelector("#rain-volume");
const audioStatusEl = document.querySelector("#audio-status");

let audioContext = null;
let rainNodes = null;

renderGroupControls();
bindAuthEvents();
bindAppEvents();
syncAuthView();

function bindAuthEvents() {
  showLoginEl.addEventListener("click", () => {
    showLoginEl.classList.add("is-active");
    showRegisterEl.classList.remove("is-active");
    loginFormEl.classList.remove("is-hidden");
    registerFormEl.classList.add("is-hidden");
    authFeedbackEl.textContent = "";
  });

  showRegisterEl.addEventListener("click", () => {
    showRegisterEl.classList.add("is-active");
    showLoginEl.classList.remove("is-active");
    registerFormEl.classList.remove("is-hidden");
    loginFormEl.classList.add("is-hidden");
    authFeedbackEl.textContent = "";
  });

  loginFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginFormEl);
    const username = normalizeUsername(formData.get("username"));
    const password = String(formData.get("password")).trim();
    const user = state.users.find((item) => item.username === username && item.password === password);

    if (!user) {
      authFeedbackEl.textContent = "Usuário ou senha inválidos.";
      return;
    }

    state.currentUser = username;
    saveSession(username);
    authFeedbackEl.textContent = "";
    loginFormEl.reset();
    syncAuthView();
  });

  registerFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerFormEl);
    const username = normalizeUsername(formData.get("username"));
    const password = String(formData.get("password")).trim();
    const confirmPassword = String(formData.get("confirmPassword")).trim();

    if (username.length < 3) {
      authFeedbackEl.textContent = "O usuário precisa ter pelo menos 3 caracteres.";
      return;
    }

    if (password.length < 4) {
      authFeedbackEl.textContent = "A senha precisa ter pelo menos 4 caracteres.";
      return;
    }

    if (password !== confirmPassword) {
      authFeedbackEl.textContent = "As senhas não coincidem.";
      return;
    }

    if (state.users.some((item) => item.username === username)) {
      authFeedbackEl.textContent = "Este usuário já existe.";
      return;
    }

    state.users.push(createUser(username, password));
    saveUsers(state.users);
    state.currentUser = username;
    saveSession(username);
    registerFormEl.reset();
    authFeedbackEl.textContent = "";
    syncAuthView();
  });

  logoutButtonEl.addEventListener("click", () => {
    state.currentUser = null;
    clearSession();
    syncAuthView();
  });
}

function bindAppEvents() {
  formEl.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.currentUser) {
      return;
    }

    const formData = new FormData(formEl);
    const title = String(formData.get("title")).trim();
    const group = String(formData.get("group")).trim();
    const content = String(formData.get("content")).trim();
    const tagsRaw = String(formData.get("tags")).trim();
    const currentProfile = getCurrentUserProfile();

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

    const post = {
      id: crypto.randomUUID(),
      title,
      group,
      author: currentProfile.displayName,
      owner: state.currentUser,
      content,
      tags,
      votes: randomVoteCount(),
      createdAt: new Date().toISOString()
    };

    state.posts.unshift(post);
    savePosts(state.posts);
    state.selectedGroup = group;
    syncActiveGroup();
    renderPosts();
    updateProfile();

    formEl.reset();
    authorInputEl.value = currentProfile.displayName;
    feedbackEl.textContent = "Relato publicado e salvo no seu perfil.";
    window.scrollTo({ top: document.querySelector(".feed-header").offsetTop - 24, behavior: "smooth" });
  });

  profileFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.currentUser) {
      return;
    }

    const user = getCurrentUserObject();
    const displayName = String(displayNameInputEl.value).trim() || state.currentUser;
    const textColor = String(textColorInputEl.value).trim() || "#f5eef8";
    const file = avatarFileInputEl.files?.[0];

    user.profile.displayName = displayName;
    user.profile.textColor = textColor;

    if (file) {
      user.profile.avatar = await readFileAsDataUrl(file);
      avatarFileInputEl.value = "";
    }

    updatePostsAuthorDisplay(state.currentUser, displayName);
    saveUsers(state.users);
    savePosts(state.posts);
    profileFeedbackEl.textContent = "Perfil atualizado.";
    syncAuthView();
  });

  resetAvatarEl.addEventListener("click", () => {
    const user = getCurrentUserObject();
    if (!user) {
      return;
    }

    user.profile.avatar = DEFAULT_AVATAR;
    saveUsers(state.users);
    profileFeedbackEl.textContent = "Foto removida.";
    syncAuthView();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderPosts();
    });
  });

  rainToggleEl.addEventListener("click", async () => {
    if (!audioContext) {
      setupRainAudio();
    }

    if (!audioContext || !rainNodes) {
      return;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (rainNodes.enabled) {
      rainNodes.master.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      rainNodes.enabled = false;
      rainToggleEl.textContent = "Ativar chuva";
      audioStatusEl.textContent = "Áudio desligado.";
      return;
    }

    const volume = Number(rainVolumeEl.value) / 100;
    rainNodes.master.gain.linearRampToValueAtTime(volume * 0.38, audioContext.currentTime + 0.4);
    rainNodes.enabled = true;
    rainToggleEl.textContent = "Pausar chuva";
    audioStatusEl.textContent = "Chuva ambiente ativa.";
  });

  rainVolumeEl.addEventListener("input", () => {
    if (!rainNodes || !audioContext) {
      return;
    }

    const volume = Number(rainVolumeEl.value) / 100;
    if (rainNodes.enabled) {
      rainNodes.master.gain.linearRampToValueAtTime(volume * 0.38, audioContext.currentTime + 0.2);
    }
  });
}

function syncAuthView() {
  const loggedIn = Boolean(state.currentUser);
  authGateEl.classList.toggle("is-hidden", loggedIn);
  appShellEl.classList.toggle("is-locked", !loggedIn);
  appShellEl.setAttribute("aria-hidden", String(!loggedIn));

  if (!loggedIn) {
    feedbackEl.textContent = "";
    return;
  }

  const profile = getCurrentUserProfile();
  authorInputEl.value = profile.displayName;
  displayNameInputEl.value = profile.displayName;
  textColorInputEl.value = normalizeColor(profile.textColor);
  profilePreviewAvatarEl.src = profile.avatar;
  sessionAvatarEl.src = profile.avatar;
  sessionIndicatorEl.textContent = `Logado como u/${profile.displayName}`;
  sessionIndicatorEl.style.color = profile.textColor;
  updateProfile();
  renderPosts();
}

function updateProfile() {
  const profile = getCurrentUserProfile();
  profileNameEl.textContent = `u/${profile.displayName}`;
  profileNameEl.style.color = profile.textColor;
  profilePreviewAvatarEl.src = profile.avatar;
  sessionAvatarEl.src = profile.avatar;
  profilePostCountEl.textContent = String(state.posts.filter((post) => post.owner === state.currentUser).length);
}

function renderGroupControls() {
  groupListEl.innerHTML = "";
  groupSelectEl.innerHTML = "";

  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `c/${group.nome}`;
    if (group.id === "terror-classico") {
      option.selected = true;
    }
    groupSelectEl.appendChild(option);

    if (group.id === "todos") {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "group-button";
    button.dataset.group = group.id;
    button.innerHTML = `<strong>c/${group.nome}</strong><small>${group.descricao}</small>`;
    button.addEventListener("click", () => {
      state.selectedGroup = group.id;
      syncActiveGroup();
      renderPosts();
    });

    groupListEl.appendChild(button);
  });

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "group-button is-active";
  allButton.dataset.group = "todos";
  allButton.innerHTML = "<strong>c/Todos</strong><small>Mostra publicações de todos os grupos.</small>";
  allButton.addEventListener("click", () => {
    state.selectedGroup = "todos";
    syncActiveGroup();
    renderPosts();
  });

  groupListEl.prepend(allButton);
}

function syncActiveGroup() {
  const buttons = Array.from(document.querySelectorAll(".group-button"));
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.group === state.selectedGroup);
  });
}

function renderPosts() {
  const visiblePosts = getVisiblePosts();
  const currentGroup = groups.find((group) => group.id === state.selectedGroup);
  feedTitleEl.textContent = state.selectedGroup === "todos" ? "Todos os relatos" : `c/${currentGroup?.nome || "Grupo"}`;

  postFeedEl.innerHTML = "";

  if (!visiblePosts.length) {
    const emptyState = document.createElement("article");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <h4>Nenhum relato encontrado</h4>
      <p>Troque o grupo, ajuste o filtro ou publique a primeira história desse espaço.</p>
    `;
    postFeedEl.appendChild(emptyState);
    return;
  }

  visiblePosts.forEach((post) => {
    const node = postTemplate.content.firstElementChild.cloneNode(true);
    const group = groups.find((item) => item.id === post.group);
    const authorProfile = getUserProfile(post.owner);
    const voteState = getVoteState(post.id);

    node.querySelector(".vote-score").textContent = post.votes;
    node.querySelector(".post-group").textContent = `c/${group?.nome || "Grupo"}`;
    node.querySelector(".post-author").textContent = `por u/${post.author}`;
    node.querySelector(".post-author").style.color = authorProfile.textColor;
    node.querySelector(".post-date").textContent = formatDate(post.createdAt);
    node.querySelector(".post-owner").textContent = `ID do autor: ${post.owner}`;
    node.querySelector(".post-title").textContent = post.title;
    node.querySelector(".post-text").textContent = post.content;
    node.querySelector(".post-avatar").src = authorProfile.avatar;

    const upButton = node.querySelector(".vote-button--up");
    const downButton = node.querySelector(".vote-button--down");
    upButton.classList.toggle("is-active", voteState === 1);
    downButton.classList.toggle("is-active", voteState === -1);
    upButton.addEventListener("click", () => handleVote(post.id, 1));
    downButton.addEventListener("click", () => handleVote(post.id, -1));

    const tagsEl = node.querySelector(".post-tags");
    post.tags.forEach((tag) => {
      const badge = document.createElement("span");
      badge.className = "tag";
      badge.textContent = `#${tag}`;
      tagsEl.appendChild(badge);
    });

    postFeedEl.appendChild(node);
  });
}

function handleVote(postId, value) {
  if (!state.currentUser) {
    return;
  }

  const key = `${state.currentUser}:${postId}`;
  const previous = state.votes[key] || 0;
  const next = previous === value ? 0 : value;
  state.votes[key] = next;

  const post = state.posts.find((item) => item.id === postId);
  if (!post) {
    return;
  }

  post.votes += next - previous;
  saveVotes(state.votes);
  savePosts(state.posts);
  renderPosts();
}

function getVisiblePosts() {
  let posts = [...state.posts];

  if (state.selectedGroup !== "todos") {
    posts = posts.filter((post) => post.group === state.selectedGroup);
  }

  if (state.filter === "recent") {
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (state.filter === "long") {
    posts.sort((a, b) => b.content.length - a.content.length);
  } else if (state.filter === "mine") {
    posts = posts.filter((post) => post.owner === state.currentUser);
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return posts;
}

function loadUsers() {
  const saved = window.localStorage.getItem(USERS_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeUserRecord) : [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadVotes() {
  const saved = window.localStorage.getItem(VOTES_KEY);
  if (!saved) {
    return {};
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveVotes(votes) {
  window.localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

function loadSession() {
  return window.localStorage.getItem(SESSION_KEY);
}

function saveSession(username) {
  window.localStorage.setItem(SESSION_KEY, username);
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

function loadPosts() {
  const saved = window.localStorage.getItem(POSTS_KEY);

  if (!saved) {
    savePosts(defaultPosts);
    return [...defaultPosts];
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      savePosts(defaultPosts);
      return [...defaultPosts];
    }

    const merged = mergeSeedPosts(parsed, defaultPosts);
    savePosts(merged);
    return merged;
  } catch (error) {
    savePosts(defaultPosts);
    return [...defaultPosts];
  }
}

function mergeSeedPosts(existingPosts, seedPosts) {
  const titles = new Set(existingPosts.map((post) => post.title));
  const missingSeeds = seedPosts.filter((post) => !titles.has(post.title));
  return [...missingSeeds, ...existingPosts];
}

function savePosts(posts) {
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
}

function randomVoteCount() {
  return Math.floor(Math.random() * 220) + 12;
}

function normalizeUsername(value) {
  return String(value).trim().replace(/\s+/g, "_");
}

function createUser(username, password) {
  return {
    username,
    password,
    profile: {
      displayName: username,
      textColor: "#f5eef8",
      avatar: DEFAULT_AVATAR
    }
  };
}

function normalizeUserRecord(user) {
  return {
    username: user.username,
    password: user.password,
    profile: {
      displayName: user.profile?.displayName || user.username,
      textColor: normalizeColor(user.profile?.textColor || "#f5eef8"),
      avatar: user.profile?.avatar || DEFAULT_AVATAR
    }
  };
}

function getCurrentUserObject() {
  return state.users.find((user) => user.username === state.currentUser) || null;
}

function getCurrentUserProfile() {
  return getUserProfile(state.currentUser);
}

function getUserProfile(username) {
  const user = state.users.find((item) => item.username === username);
  if (!user) {
    return {
      displayName: username || "Anônimo",
      textColor: "#f5eef8",
      avatar: DEFAULT_AVATAR
    };
  }

  return normalizeUserRecord(user).profile;
}

function updatePostsAuthorDisplay(owner, displayName) {
  state.posts = state.posts.map((post) => (
    post.owner === owner
      ? { ...post, author: displayName }
      : post
  ));
}

function getVoteState(postId) {
  if (!state.currentUser) {
    return 0;
  }

  return state.votes[`${state.currentUser}:${postId}`] || 0;
}

function normalizeColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#f5eef8";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.readAsDataURL(file);
  });
}

function setupRainAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    audioStatusEl.textContent = "Seu navegador não suporta áudio ambiente gerado.";
    rainToggleEl.disabled = true;
    return;
  }

  audioContext = new AudioContextClass();

  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1800;

  const highpass = audioContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 320;

  const rumble = audioContext.createBiquadFilter();
  rumble.type = "lowpass";
  rumble.frequency.value = 540;

  const rumbleGain = audioContext.createGain();
  rumbleGain.gain.value = 0.16;

  const hissGain = audioContext.createGain();
  hissGain.gain.value = 0.22;

  const master = audioContext.createGain();
  master.gain.value = 0;

  noiseSource.connect(lowpass);
  lowpass.connect(hissGain);
  hissGain.connect(master);

  noiseSource.connect(highpass);
  highpass.connect(rumble);
  rumble.connect(rumbleGain);
  rumbleGain.connect(master);

  master.connect(audioContext.destination);
  noiseSource.start();

  rainNodes = {
    master,
    enabled: false
  };
}
