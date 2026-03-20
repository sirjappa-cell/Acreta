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

const GROUPS = [
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

const state = {
  selectedGroup: "todos",
  filter: "all",
  posts: [],
  currentUser: null,
  currentProfile: null,
  votes: {},
  savedPosts: new Set()
};

const supabaseUrl = window.ACRETA_SUPABASE_URL || "";
const supabaseAnonKey = window.ACRETA_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes("COLE_AQUI") &&
  !supabaseAnonKey.includes("COLE_AQUI");

const supabaseClient = isSupabaseConfigured
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : null;

const authGateEl = document.querySelector("#auth-gate");
const appShellEl = document.querySelector("#app-shell");
const setupWarningEl = document.querySelector("#setup-warning");
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
const navButtons = Array.from(document.querySelectorAll(".nav-button"));
const modeChips = Array.from(document.querySelectorAll(".mode-chip"));
const composerToggleEl = document.querySelector("#composer-toggle");
const composerCancelEl = document.querySelector("#composer-cancel");
const postTypeInputEl = document.querySelector("#post-type");
const contentInputEl = document.querySelector("#content");
const imageUploadEl = document.querySelector("#image-upload");
const videoUploadEl = document.querySelector("#video-upload");
const mediaPreviewEl = document.querySelector("#media-preview");
const imagePreviewEl = document.querySelector("#image-preview");
const videoPreviewEl = document.querySelector("#video-preview");
const profileNameEl = document.querySelector("#profile-name");
const profileEmailEl = document.querySelector("#profile-email");
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
const autoRainEl = document.querySelector("#auto-rain");
const unknownUsersCountEl = document.querySelector("#unknown-users-count");
const newReportsCountEl = document.querySelector("#new-reports-count");
const lastActivityEl = document.querySelector("#last-activity");
const rightLastActivityEl = document.querySelector("#right-last-activity");
const systemWhisperEl = document.querySelector("#system-whisper");
const recommendedGroupsEl = document.querySelector("#recommended-groups");
const circleRulesEl = document.querySelector("#circle-rules");

let audioContext = null;
let rainNodes = null;
let thunderTimer = null;

const LAST_VISIT_KEY = "acreta-last-visit";
const AUTO_RAIN_KEY = "acreta-auto-rain";
const SAVED_POSTS_KEY = "acreta-saved-posts";
const SYSTEM_WHISPERS = [
  "Os relatórios estão começando a aparecer.",
  "Três arquivos foram movidos sem registro de acesso.",
  "Há nomes retornando aos círculos errados.",
  "A atividade aumenta quando a chuva quase some."
];
const CIRCLE_RULES = {
  todos: [
    "Leia como se alguém estivesse editando o arquivo enquanto você observa.",
    "Não mova um relato para outro círculo sem rever as tags."
  ],
  "terror-classico": [
    "Registros devem preservar atmosfera, presença e ruína lenta.",
    "Evite tecnologia central demais; deixe a casa respirar antes da entidade aparecer."
  ],
  "ficcao-sombria": [
    "Toda máquina deve sugerir intenção própria.",
    "Relatórios devem manter o desconforto técnico acima do espetáculo."
  ],
  "horror-psicologico": [
    "A dúvida deve sobreviver até a última linha.",
    "Sintomas, lapsos e contradições contam como evidência."
  ],
  "folk-horror": [
    "O lugar precisa parecer mais antigo do que a memória do narrador.",
    "Ritual sem consequência não entra no arquivo."
  ],
  investigacao: [
    "Fragmentos, áudios e rastros parciais são bem-vindos.",
    "Não feche o caso cedo demais."
  ],
  "sobrenatural-urbano": [
    "Cidade viva, concreta e ligeiramente hostil.",
    "Sinais banais podem ser mais perigosos do que aparições."
  ],
  creepypasta: [
    "Entrada direta, rápida e com imagem mental forte.",
    "O estranho deve começar cedo."
  ],
  cosmico: [
    "Escala acima da compreensão humana.",
    "O horror deve diminuir o narrador, não inflar o mundo."
  ],
  corpo: [
    "Transformação física precisa custar algo.",
    "Descreva o desconforto sem perder clareza."
  ],
  "pesadelos-reais": [
    "Plausibilidade primeiro, explicação depois.",
    "O comum deve ser o primeiro a falhar."
  ]
};

renderGroupControls();
bindAuthEvents();
bindAppEvents();
collapseComposer();
boot();

async function boot() {
  hydrateAmbientState();
  rotateSystemWhisper();

  if (!isSupabaseConfigured) {
    setupWarningEl.textContent = "Preencha supabase-config.js com a URL e a chave anon do seu projeto.";
    setupWarningEl.classList.remove("is-hidden");
    authFeedbackEl.textContent = "Supabase ainda não configurado.";
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  await applySession(data.session);

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    await applySession(session);
  });
}

function bindAuthEvents() {
  showLoginEl.addEventListener("click", () => {
    withDelay(showLoginEl, () => {
      showLoginEl.classList.add("is-active");
      showRegisterEl.classList.remove("is-active");
      loginFormEl.classList.remove("is-hidden");
      registerFormEl.classList.add("is-hidden");
      authFeedbackEl.textContent = "";
    });
  });

  showRegisterEl.addEventListener("click", () => {
    withDelay(showRegisterEl, () => {
      showRegisterEl.classList.add("is-active");
      showLoginEl.classList.remove("is-active");
      registerFormEl.classList.remove("is-hidden");
      loginFormEl.classList.add("is-hidden");
      authFeedbackEl.textContent = "";
    });
  });

  loginFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      return;
    }

    const formData = new FormData(loginFormEl);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      authFeedbackEl.textContent = error.message;
      return;
    }

    loginFormEl.reset();
    authFeedbackEl.textContent = "";
  });

  registerFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      return;
    }

    const formData = new FormData(registerFormEl);
    const username = normalizeUsername(formData.get("username"));
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();
    const confirmPassword = String(formData.get("confirmPassword")).trim();

    if (username.length < 3) {
      authFeedbackEl.textContent = "O ID visível precisa ter pelo menos 3 caracteres.";
      return;
    }

    if (password.length < 6) {
      authFeedbackEl.textContent = "A senha precisa ter pelo menos 6 caracteres.";
      return;
    }

    if (password !== confirmPassword) {
      authFeedbackEl.textContent = "As senhas não coincidem.";
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username
        }
      }
    });

    if (error) {
      authFeedbackEl.textContent = error.message;
      return;
    }

    registerFormEl.reset();
    if (!data.session) {
      authFeedbackEl.textContent = "Conta criada. Se o Supabase exigir confirmação de e-mail, confirme antes de entrar.";
      return;
    }

    authFeedbackEl.textContent = "";
  });

  logoutButtonEl.addEventListener("click", async () => {
    if (!supabaseClient) {
      return;
    }
    await supabaseClient.auth.signOut();
  });
}

function bindAppEvents() {
  composerToggleEl.addEventListener("click", () => {
    withDelay(composerToggleEl, () => {
      formEl.classList.remove("is-collapsed");
      contentInputEl.focus();
    });
  });

  composerCancelEl.addEventListener("click", () => {
    withDelay(composerCancelEl, () => collapseComposer());
  });

  modeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      withDelay(chip, () => setPostType(chip.dataset.postType || "text"));
    });
  });

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      withDelay(button, () => applyNav(button.dataset.nav || "all"));
    });
  });

  imageUploadEl.addEventListener("change", async () => {
    videoUploadEl.value = "";
    const validation = validateMediaFile(imageUploadEl.files?.[0], "image");
    if (validation) {
      feedbackEl.textContent = validation;
      imageUploadEl.value = "";
      updateMediaPreview();
      return;
    }
    feedbackEl.textContent = "";
    await updateMediaPreview();
  });

  videoUploadEl.addEventListener("change", async () => {
    imageUploadEl.value = "";
    const validation = validateMediaFile(videoUploadEl.files?.[0], "video");
    if (validation) {
      feedbackEl.textContent = validation;
      videoUploadEl.value = "";
      updateMediaPreview();
      return;
    }
    feedbackEl.textContent = "";
    await updateMediaPreview();
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient || !state.currentUser || !state.currentProfile) {
      return;
    }

    const formData = new FormData(formEl);
    const title = String(formData.get("title")).trim();
    const groupId = String(formData.get("group")).trim();
    const content = String(formData.get("content")).trim();
    const postType = String(formData.get("postType")).trim() || "text";
    const tags = String(formData.get("tags"))
      .trim()
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

    const imageFile = imageUploadEl.files?.[0] || null;
    const videoFile = videoUploadEl.files?.[0] || null;
    const validationMessage = validateComposer(title, content, postType, imageFile, videoFile);
    if (validationMessage) {
      feedbackEl.textContent = validationMessage;
      return;
    }

    const imageUrl = imageFile ? await readFileAsDataUrl(imageFile) : "";
    const videoUrl = videoFile ? await readFileAsDataUrl(videoFile) : "";

    const payload = {
      user_id: state.currentUser.id,
      group_id: groupId,
      title,
      content,
      post_type: normalizePostType(postType, imageUrl, videoUrl),
      media_image_url: imageUrl,
      media_video_url: videoUrl,
      tags,
      author_display: state.currentProfile.display_name,
      author_username: state.currentProfile.username,
      author_text_color: state.currentProfile.text_color,
      author_avatar_url: state.currentProfile.avatar_url || ""
    };

    const { error } = await supabaseClient.from("posts").insert(payload);
    if (error) {
      if (error.message.includes("post_type") || error.message.includes("media_image_url") || error.message.includes("media_video_url")) {
        feedbackEl.textContent = "O banco ainda não recebeu os campos de mídia. Rode o SQL atualizado no Supabase antes de publicar imagens e vídeos.";
      } else {
        feedbackEl.textContent = error.message;
      }
      return;
    }

    formEl.reset();
    collapseComposer();
    authorInputEl.value = state.currentProfile.display_name;
    feedbackEl.textContent = "Registro anexado ao arquivo.";
    state.selectedGroup = groupId;
    syncActiveGroup();
    await refreshData();
  });

  profileFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient || !state.currentUser || !state.currentProfile) {
      return;
    }

    const displayName = String(displayNameInputEl.value).trim() || state.currentProfile.display_name;
    const textColor = normalizeColor(textColorInputEl.value);
    const file = avatarFileInputEl.files?.[0];

    let avatarUrl = state.currentProfile.avatar_url || "";
    if (file) {
      avatarUrl = await readFileAsDataUrl(file);
    }

    const updates = {
      display_name: displayName,
      text_color: textColor,
      avatar_url: avatarUrl
    };

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update(updates)
      .eq("id", state.currentUser.id);

    if (profileError) {
      profileFeedbackEl.textContent = profileError.message;
      return;
    }

    const { error: postsError } = await supabaseClient
      .from("posts")
      .update({
        author_display: displayName,
        author_text_color: textColor,
        author_avatar_url: avatarUrl
      })
      .eq("user_id", state.currentUser.id);

    if (postsError) {
      profileFeedbackEl.textContent = postsError.message;
      return;
    }

    avatarFileInputEl.value = "";
    profileFeedbackEl.textContent = "Identidade recalibrada.";
    await refreshData();
  });

  resetAvatarEl.addEventListener("click", async () => {
    if (!supabaseClient || !state.currentUser) {
      return;
    }

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({ avatar_url: "" })
      .eq("id", state.currentUser.id);

    if (profileError) {
      profileFeedbackEl.textContent = profileError.message;
      return;
    }

    const { error: postsError } = await supabaseClient
      .from("posts")
      .update({ author_avatar_url: "" })
      .eq("user_id", state.currentUser.id);

    if (postsError) {
      profileFeedbackEl.textContent = postsError.message;
      return;
    }

    profileFeedbackEl.textContent = "Imagem de rastro removida.";
    await refreshData();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      withDelay(button, () => {
        state.filter = button.dataset.filter || "all";
        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        syncActiveNav(state.filter === "all" ? "all" : state.filter);
        renderPosts();
      });
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
      await withDelay(rainToggleEl, () => fadeRainOut());
      return;
    }
    await withDelay(rainToggleEl, () => fadeRainIn(getRainTargetGain()));
  });

  rainVolumeEl.addEventListener("input", () => {
    if (!rainNodes || !audioContext) {
      return;
    }
    if (rainNodes.enabled) {
      rainNodes.master.gain.linearRampToValueAtTime(getRainTargetGain(), audioContext.currentTime + 0.2);
    }
  });

  autoRainEl.addEventListener("change", () => {
    window.localStorage.setItem(AUTO_RAIN_KEY, String(autoRainEl.checked));
  });
}

async function applySession(session) {
  state.currentUser = session?.user || null;

  if (!state.currentUser) {
    state.currentProfile = null;
    state.posts = [];
    state.votes = {};
    syncAuthView();
    return;
  }

  await refreshData();
  syncAuthView();
}

async function refreshData() {
  if (!supabaseClient || !state.currentUser) {
    return;
  }

  const [profileResult, postsResult, votesResult] = await Promise.all([
    supabaseClient.from("profiles").select("*").eq("id", state.currentUser.id).single(),
    supabaseClient.from("posts").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("post_votes").select("post_id, value").eq("user_id", state.currentUser.id)
  ]);

  if (profileResult.error) {
    authFeedbackEl.textContent = profileResult.error.message;
    return;
  }

  if (postsResult.error) {
    feedbackEl.textContent = postsResult.error.message;
    return;
  }

  if (votesResult.error) {
    feedbackEl.textContent = votesResult.error.message;
    return;
  }

  state.currentProfile = normalizeProfile(profileResult.data, state.currentUser.email || "");
  state.posts = Array.isArray(postsResult.data) ? postsResult.data : [];
  state.votes = Object.fromEntries((votesResult.data || []).map((vote) => [vote.post_id, vote.value]));
  updateAtmosphericSignals();
  syncAuthView();
}

function syncAuthView() {
  const loggedIn = Boolean(state.currentUser);
  authGateEl.classList.toggle("is-hidden", loggedIn);
  appShellEl.classList.toggle("is-locked", !loggedIn);
  appShellEl.setAttribute("aria-hidden", String(!loggedIn));

  if (!loggedIn || !state.currentProfile) {
    feedbackEl.textContent = "";
    return;
  }

  authorInputEl.value = state.currentProfile.display_name;
  displayNameInputEl.value = state.currentProfile.display_name;
  textColorInputEl.value = normalizeColor(state.currentProfile.text_color);
  profilePreviewAvatarEl.src = state.currentProfile.avatar_url || DEFAULT_AVATAR;
  sessionAvatarEl.src = state.currentProfile.avatar_url || DEFAULT_AVATAR;
  sessionIndicatorEl.textContent = `Presença reconhecida: u/${state.currentProfile.display_name}`;
  sessionIndicatorEl.style.color = state.currentProfile.text_color;
  profileNameEl.textContent = `u/${state.currentProfile.display_name}`;
  profileNameEl.style.color = state.currentProfile.text_color;
  profileEmailEl.textContent = state.currentUser.email || "";
  profilePostCountEl.textContent = String(state.posts.filter((post) => post.user_id === state.currentUser.id).length);
  updateAtmosphericSignals();
  maybeAutostartRain();
  renderRecommendedGroups();
  renderCircleRules();
  renderPosts();
}

function renderGroupControls() {
  groupListEl.innerHTML = "";
  groupSelectEl.innerHTML = "";

  GROUPS.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `c/${group.nome}`;
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
      withDelay(button, () => {
        state.selectedGroup = group.id;
        state.filter = "all";
        filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
        syncActiveGroup();
        syncActiveNav("circles");
        renderPosts();
      });
    });
    groupListEl.appendChild(button);
  });

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "group-button is-active";
  allButton.dataset.group = "todos";
  allButton.innerHTML = "<strong>c/Todos</strong><small>Mostra registros de todos os círculos.</small>";
  allButton.addEventListener("click", () => {
    withDelay(allButton, () => {
      state.selectedGroup = "todos";
      state.filter = "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
      syncActiveGroup();
      syncActiveNav("circles");
      renderPosts();
    });
  });
  groupListEl.prepend(allButton);
}

function syncActiveGroup() {
  const buttons = Array.from(document.querySelectorAll(".group-button"));
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.group === state.selectedGroup);
  });
  renderRecommendedGroups();
  renderCircleRules();
}

function syncActiveNav(activeNav) {
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.nav === activeNav);
  });
}

function applyNav(nav) {
  if (nav === "circles") {
    syncActiveNav(nav);
    document.querySelector(".card--groups")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (nav === "identity") {
    syncActiveNav(nav);
    document.querySelector(".card--profile-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  state.filter = nav === "all" ? "all" : nav;
  state.selectedGroup = "todos";
  filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === state.filter));
  syncActiveGroup();
  syncActiveNav(nav);
  renderPosts();
}

function renderPosts() {
  const visiblePosts = getVisiblePosts();
  const currentGroup = GROUPS.find((group) => group.id === state.selectedGroup);
  feedTitleEl.textContent = getFeedTitle(currentGroup);

  postFeedEl.innerHTML = "";
  if (!visiblePosts.length) {
    const emptyState = document.createElement("article");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <h4>Nenhum registro detectado</h4>
      <p>Troque o círculo, ajuste o filtro ou anexe a primeira entrada deste arquivo.</p>
    `;
    postFeedEl.appendChild(emptyState);
    return;
  }

  visiblePosts.forEach((post) => {
    const node = postTemplate.content.firstElementChild.cloneNode(true);
    node.id = `post-${post.id}`;
    const group = GROUPS.find((item) => item.id === post.group_id);
    const voteState = state.votes[post.id] || 0;

    node.querySelector(".vote-score").textContent = post.votes_count;
    node.querySelector(".post-group").textContent = `c/${group?.nome || "Círculo"}`;
    node.querySelector(".post-author").textContent = `por u/${post.author_display}`;
    node.querySelector(".post-author").style.color = post.author_text_color || "#f5eef8";
    node.querySelector(".post-date").textContent = formatDate(post.created_at);
    node.querySelector(".post-owner").textContent = `rastro do autor: ${post.author_username}`;
    node.querySelector(".post-title").textContent = post.title;
    const postTextEl = node.querySelector(".post-text");
    postTextEl.textContent = post.content || "";
    postTextEl.classList.toggle("is-empty", !post.content);
    node.querySelector(".post-avatar").src = post.author_avatar_url || DEFAULT_AVATAR;
    renderPostMedia(node.querySelector(".post-media"), post);

    const upButton = node.querySelector(".vote-button--up");
    const downButton = node.querySelector(".vote-button--down");
    upButton.classList.toggle("is-active", voteState === 1);
    downButton.classList.toggle("is-active", voteState === -1);
    upButton.addEventListener("click", () => handleVote(post.id, 1));
    downButton.addEventListener("click", () => handleVote(post.id, -1));

    const tagsEl = node.querySelector(".post-tags");
    (post.tags || []).forEach((tag) => {
      const badge = document.createElement("span");
      badge.className = "tag";
      badge.textContent = `#${tag}`;
      tagsEl.appendChild(badge);
    });

    bindPostActions(node, post);

    postFeedEl.appendChild(node);
  });
}

async function handleVote(postId, value) {
  if (!supabaseClient || !state.currentUser) {
    return;
  }

  const previous = state.votes[postId] || 0;
  if (previous === value) {
    const { error } = await supabaseClient
      .from("post_votes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", state.currentUser.id);
    if (error) {
      feedbackEl.textContent = error.message;
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from("post_votes")
      .upsert({ post_id: postId, user_id: state.currentUser.id, value }, { onConflict: "post_id,user_id" });
    if (error) {
      feedbackEl.textContent = error.message;
      return;
    }
  }

  await refreshData();
}

function getVisiblePosts() {
  let posts = [...state.posts];

  if (state.selectedGroup !== "todos") {
    posts = posts.filter((post) => post.group_id === state.selectedGroup);
  }

  if (state.filter === "recent") {
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (state.filter === "long") {
    posts.sort((a, b) => b.content.length - a.content.length);
  } else if (state.filter === "mine") {
    posts = posts.filter((post) => post.user_id === state.currentUser?.id);
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (state.filter === "saved") {
    posts = posts.filter((post) => state.savedPosts.has(post.id));
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (state.filter === "trending") {
    posts.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
  }

  return posts;
}

function getFeedTitle(currentGroup) {
  if (state.selectedGroup !== "todos") {
    return `c/${currentGroup?.nome || "Círculo"}`;
  }
  if (state.filter === "saved") {
    return "Relatos salvos";
  }
  if (state.filter === "trending") {
    return "Registros em tendência";
  }
  if (state.filter === "mine") {
    return "Meu rastro";
  }
  if (state.filter === "recent") {
    return "Sinais recentes";
  }
  if (state.filter === "long") {
    return "Registros longos";
  }
  return "Todos os registros";
}

function renderPostMedia(container, post) {
  container.innerHTML = "";
  const imageUrl = post.media_image_url || "";
  const videoUrl = post.media_video_url || "";
  container.classList.toggle("is-empty", !imageUrl && !videoUrl);

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `Anexo visual do relato ${post.title}`;
    container.appendChild(image);
  }

  if (videoUrl) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.controls = true;
    video.preload = "metadata";
    container.appendChild(video);
  }
}

function bindPostActions(node, post) {
  const saveButton = node.querySelector(".post-action--save");
  const shareButton = node.querySelector(".post-action--share");
  const commentButton = node.querySelector(".post-action--comment");

  saveButton.classList.toggle("is-active", state.savedPosts.has(post.id));
  saveButton.textContent = state.savedPosts.has(post.id) ? "Salvo" : "Salvar";
  saveButton.addEventListener("click", () => {
    withDelay(saveButton, () => toggleSavedPost(post.id));
  });

  shareButton.addEventListener("click", async () => {
    await withDelay(shareButton, async () => {
      const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        feedbackEl.textContent = "Link do relato copiado para a área de transferência.";
      } else {
        feedbackEl.textContent = "Não foi possível copiar o link deste relato.";
      }
    });
  });

  commentButton.addEventListener("click", () => {
    withDelay(commentButton, () => {
      feedbackEl.textContent = "Comentários ainda não foram abertos neste círculo.";
    });
  });
}

function toggleSavedPost(postId) {
  if (state.savedPosts.has(postId)) {
    state.savedPosts.delete(postId);
  } else {
    state.savedPosts.add(postId);
  }
  window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify([...state.savedPosts]));
  renderPosts();
}

function updateAtmosphericSignals() {
  const previousVisit = Number(window.localStorage.getItem(LAST_VISIT_KEY) || 0);
  const newReports = state.posts.filter((post) => new Date(post.created_at).getTime() > previousVisit).length;
  const activeUnknown = 4 + Math.min(19, state.posts.length + Math.floor(Math.random() * 4));
  const latestPost = state.posts[0];

  unknownUsersCountEl.textContent = String(activeUnknown);
  newReportsCountEl.textContent = String(newReports);
  if (latestPost) {
    const activityText = `Última atividade detectada: ${formatDate(latestPost.created_at)} em c/${GROUPS.find((group) => group.id === latestPost.group_id)?.nome || "Círculo"}.`;
    lastActivityEl.textContent = activityText;
    rightLastActivityEl.textContent = activityText;
  } else {
    lastActivityEl.textContent = "Última atividade detectada: nenhum rastro confirmado.";
    rightLastActivityEl.textContent = "Última atividade detectada: nenhum rastro confirmado.";
  }

  window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
}

function rotateSystemWhisper() {
  systemWhisperEl.textContent = SYSTEM_WHISPERS[Math.floor(Math.random() * SYSTEM_WHISPERS.length)];
}

function hydrateAmbientState() {
  autoRainEl.checked = window.localStorage.getItem(AUTO_RAIN_KEY) === "true";
  state.savedPosts = new Set(JSON.parse(window.localStorage.getItem(SAVED_POSTS_KEY) || "[]"));
}

function setPostType(type) {
  postTypeInputEl.value = type;
  modeChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.postType === type);
  });
  formEl.classList.remove("is-collapsed");
  const wantsText = type === "text" || type === "mixed";
  const wantsImage = type === "image" || type === "mixed";
  const wantsVideo = type === "video";
  contentInputEl.parentElement.classList.toggle("is-hidden", !wantsText);
  imageUploadEl.closest(".media-field").classList.toggle("is-hidden", !wantsImage && type !== "video");
  videoUploadEl.closest(".media-field").classList.toggle("is-hidden", !(wantsVideo || type === "mixed"));
  if (type === "image") {
    videoUploadEl.value = "";
  }
  if (type === "video") {
    imageUploadEl.value = "";
  }
  updateMediaPreview();
}

function collapseComposer() {
  formEl.classList.add("is-collapsed");
  formEl.reset();
  postTypeInputEl.value = "text";
  modeChips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.postType === "text"));
  contentInputEl.parentElement.classList.remove("is-hidden");
  imageUploadEl.closest(".media-field").classList.remove("is-hidden");
  videoUploadEl.closest(".media-field").classList.remove("is-hidden");
  imagePreviewEl.src = "";
  videoPreviewEl.src = "";
  imagePreviewEl.classList.add("is-hidden");
  videoPreviewEl.classList.add("is-hidden");
  mediaPreviewEl.classList.add("is-hidden");
}

async function updateMediaPreview() {
  const imageFile = imageUploadEl.files?.[0];
  const videoFile = videoUploadEl.files?.[0];
  imagePreviewEl.classList.add("is-hidden");
  videoPreviewEl.classList.add("is-hidden");
  mediaPreviewEl.classList.toggle("is-hidden", !imageFile && !videoFile);

  if (imageFile) {
    imagePreviewEl.src = await readFileAsDataUrl(imageFile);
    imagePreviewEl.classList.remove("is-hidden");
  }

  if (videoFile) {
    videoPreviewEl.src = await readFileAsDataUrl(videoFile);
    videoPreviewEl.classList.remove("is-hidden");
  }
}

function validateMediaFile(file, type) {
  if (!file) {
    return "";
  }
  const sizeLimit = type === "image" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > sizeLimit) {
    return type === "image" ? "Imagens devem ter no máximo 5 MB." : "Vídeos devem ter no máximo 20 MB.";
  }
  if (type === "image" && !file.type.startsWith("image/")) {
    return "O arquivo selecionado não é uma imagem válida.";
  }
  if (type === "video" && !file.type.startsWith("video/")) {
    return "O arquivo selecionado não é um vídeo válido.";
  }
  return "";
}

function validateComposer(title, content, postType, imageFile, videoFile) {
  if (!title) {
    return "Defina um título para o registro.";
  }
  if ((postType === "text" || postType === "mixed") && !content) {
    return "Escreva o relato antes de arquivar.";
  }
  if (postType === "image" && !imageFile) {
    return "Anexe uma imagem para este tipo de ocorrência.";
  }
  if (postType === "video" && !videoFile) {
    return "Anexe um vídeo para este tipo de ocorrência.";
  }
  if (postType === "mixed" && !content && !imageFile && !videoFile) {
    return "Relatos mistos precisam de texto e pelo menos um anexo.";
  }
  return validateMediaFile(imageFile, "image") || validateMediaFile(videoFile, "video");
}

function normalizePostType(postType, imageUrl, videoUrl) {
  if (videoUrl && imageUrl) {
    return "mixed";
  }
  if (videoUrl && postType !== "text") {
    return postType === "mixed" ? "mixed" : "video";
  }
  if (imageUrl && postType !== "text") {
    return postType === "mixed" ? "mixed" : "image";
  }
  return "text";
}

function renderRecommendedGroups() {
  recommendedGroupsEl.innerHTML = "";
  GROUPS.filter((group) => group.id !== "todos" && group.id !== state.selectedGroup)
    .slice(0, 3)
    .forEach((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "group-button";
      button.innerHTML = `<strong>c/${group.nome}</strong><small>${group.descricao}</small>`;
      button.addEventListener("click", () => {
        withDelay(button, () => {
          state.selectedGroup = group.id;
          state.filter = "all";
          filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
          syncActiveGroup();
          syncActiveNav("circles");
          renderPosts();
        });
      });
      recommendedGroupsEl.appendChild(button);
    });
}

function renderCircleRules() {
  const rules = CIRCLE_RULES[state.selectedGroup] || CIRCLE_RULES.todos;
  circleRulesEl.innerHTML = `<p>Leituras atuais para ${state.selectedGroup === "todos" ? "o arquivo geral" : `c/${GROUPS.find((group) => group.id === state.selectedGroup)?.nome || "Círculo"}`}:</p>`;
  const list = document.createElement("ul");
  rules.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    list.appendChild(item);
  });
  circleRulesEl.appendChild(list);
}

async function maybeAutostartRain() {
  if (!autoRainEl.checked || rainNodes?.enabled || !state.currentUser) {
    return;
  }
  try {
    if (!audioContext) {
      setupRainAudio();
    }
    if (!audioContext || !rainNodes) {
      return;
    }
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    fadeRainIn(Math.min(0.06, getRainTargetGain()));
  } catch (_error) {
    audioStatusEl.textContent = "A escuta automática foi bloqueada pelo navegador.";
  }
}

function getRainTargetGain() {
  return (Number(rainVolumeEl.value) / 100) * 0.38;
}

function fadeRainIn(targetGain) {
  if (!audioContext || !rainNodes) {
    return;
  }
  rainNodes.master.gain.cancelScheduledValues(audioContext.currentTime);
  rainNodes.master.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + 1.6);
  rainNodes.enabled = true;
  rainToggleEl.textContent = "Silenciar escuta";
  audioStatusEl.textContent = "Chuva baixa em execução. Escute com cautela.";
  scheduleThunder();
}

function fadeRainOut() {
  if (!audioContext || !rainNodes) {
    return;
  }
  rainNodes.master.gain.cancelScheduledValues(audioContext.currentTime);
  rainNodes.master.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.2);
  rainNodes.enabled = false;
  rainToggleEl.textContent = "Iniciar escuta";
  audioStatusEl.textContent = "Escuta inativa.";
  if (thunderTimer) {
    window.clearTimeout(thunderTimer);
    thunderTimer = null;
  }
}

function scheduleThunder() {
  if (!rainNodes?.enabled) {
    return;
  }
  const nextDelay = 14000 + Math.random() * 26000;
  thunderTimer = window.setTimeout(() => {
    triggerThunder();
    scheduleThunder();
  }, nextDelay);
}

function triggerThunder() {
  if (!audioContext || !rainNodes?.enabled) {
    return;
  }

  const duration = 3.8;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    const falloff = 1 - index / channel.length;
    channel[index] = (Math.random() * 2 - 1) * Math.pow(falloff, 1.8);
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 220;

  const gain = audioContext.createGain();
  gain.gain.value = 0.0001;

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(audioContext.destination);

  const start = audioContext.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.028, start + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.start(start);
  source.stop(start + duration);

  audioStatusEl.textContent = "Algo distante respondeu na chuva.";
  window.setTimeout(() => {
    if (rainNodes?.enabled) {
      audioStatusEl.textContent = "Chuva baixa em execução. Escute com cautela.";
    }
  }, 4200);
}

function withDelay(element, callback) {
  const wait = 50 + Math.floor(Math.random() * 101);
  element.classList.add("is-delaying");
  return new Promise((resolve) => {
    window.setTimeout(async () => {
      element.classList.remove("is-delaying");
      const result = await callback();
      resolve(result);
    }, wait);
  });
}

function normalizeProfile(profile, email) {
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    text_color: normalizeColor(profile.text_color),
    avatar_url: profile.avatar_url || DEFAULT_AVATAR,
    email
  };
}

function normalizeUsername(value) {
  return String(value).trim().replace(/\s+/g, "_");
}

function normalizeColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#f5eef8";
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
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

  rainNodes = { master, enabled: false };
}
