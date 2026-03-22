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
  searchTerm: "",
  posts: [],
  currentUser: null,
  currentProfile: null,
  votes: {},
  savedPosts: new Set(),
  comments: {},
  commentsBackendReady: true
};

const supabaseUrl = window.ACRETA_SUPABASE_URL || "";
const supabaseAnonKey = window.ACRETA_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes("COLE_AQUI") &&
  !supabaseAnonKey.includes("COLE_AQUI");
const MEDIA_BUCKET = "acreta-media";
const AVATAR_BUCKET = "acreta-avatars";

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
const sidebarToggleEl = document.querySelector("#sidebar-toggle");
const sidebarOverlayEl = document.querySelector("#sidebar-overlay");
const leftSidebarEl = document.querySelector(".sidebar--left");
const searchInputEl = document.querySelector("#search-input");
const postTypeInputEl = document.querySelector("#post-type");
const contentInputEl = document.querySelector("#content");
const imageUploadEl = document.querySelector("#image-upload");
const videoUploadEl = document.querySelector("#video-upload");
const imageDropzoneEl = document.querySelector("#image-dropzone");
const videoDropzoneEl = document.querySelector("#video-dropzone");
const mediaPreviewEl = document.querySelector("#media-preview");
const imagePreviewEl = document.querySelector("#image-preview");
const videoPreviewEl = document.querySelector("#video-preview");
const imagePreviewCardEl = document.querySelector("#image-preview-card");
const videoPreviewCardEl = document.querySelector("#video-preview-card");
const imagePreviewNameEl = document.querySelector("#image-preview-name");
const imagePreviewInfoEl = document.querySelector("#image-preview-info");
const videoPreviewNameEl = document.querySelector("#video-preview-name");
const videoPreviewInfoEl = document.querySelector("#video-preview-info");
const removeImageEl = document.querySelector("#remove-image");
const removeVideoEl = document.querySelector("#remove-video");
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
const topTagEl = document.querySelector("#top-tag");
const unclassifiedCountEl = document.querySelector("#unclassified-count");
const latestEntryEl = document.querySelector("#latest-entry");
const savedCountEl = document.querySelector("#saved-count");
const postModalEl = document.querySelector("#post-modal");
const modalTitleEl = document.querySelector("#modal-title");
const modalPostEl = document.querySelector("#modal-post");
const modalCloseEl = document.querySelector("#modal-close");
const commentFormEl = document.querySelector("#comment-form");
const commentInputEl = document.querySelector("#comment-input");
const commentFeedbackEl = document.querySelector("#comment-feedback");
const commentsListEl = document.querySelector("#comments-list");
const relatedPostsEl = document.querySelector("#related-posts");

let audioContext = null;
let rainNodes = null;
let thunderTimer = null;
let activePostId = null;

const LAST_VISIT_KEY = "acreta-last-visit";
const AUTO_RAIN_KEY = "acreta-auto-rain";
const SAVED_POSTS_KEY = "acreta-saved-posts";
const COMMENTS_KEY = "acreta-comments";
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
      await removeStorageFile(imageUrl, MEDIA_BUCKET);
      await removeStorageFile(videoUrl, MEDIA_BUCKET);
      await removeStorageFile(imageUrl, MEDIA_BUCKET);
      await removeStorageFile(videoUrl, MEDIA_BUCKET);
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
  sidebarToggleEl.addEventListener("click", () => toggleMobileSidebar(true));
  sidebarOverlayEl.addEventListener("click", () => toggleMobileSidebar(false));

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

  searchInputEl.addEventListener("input", () => {
    state.searchTerm = searchInputEl.value.trim().toLowerCase();
    renderPosts();
  });

  setupDropzone(imageDropzoneEl, imageUploadEl, "image");
  setupDropzone(videoDropzoneEl, videoUploadEl, "video");

  removeImageEl.addEventListener("click", () => {
    imageUploadEl.value = "";
    updateMediaPreview();
    feedbackEl.textContent = "Anexo de imagem removido.";
  });

  removeVideoEl.addEventListener("click", () => {
    videoUploadEl.value = "";
    updateMediaPreview();
    feedbackEl.textContent = "Anexo de vídeo removido.";
  });

  imageUploadEl.addEventListener("change", async () => {
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

    feedbackEl.textContent = "Arquivando ocorrência...";
    let imageUrl = "";
    let videoUrl = "";

    try {
      imageUrl = imageFile ? await uploadFileToStorage(imageFile, MEDIA_BUCKET, state.currentUser.id, "posts") : "";
      videoUrl = videoFile ? await uploadFileToStorage(videoFile, MEDIA_BUCKET, state.currentUser.id, "posts") : "";
    } catch (error) {
      feedbackEl.textContent = error instanceof Error ? error.message : "Falha ao enviar anexos para o Storage.";
      return;
    }

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
    feedbackEl.textContent = "Ocorrência arquivada com sucesso.";
    state.selectedGroup = groupId;
    syncActiveGroup();
    await refreshData();
    const newest = state.posts[0];
    if (newest) {
      document.querySelector(`#post-${newest.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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
    try {
      if (file) {
        avatarUrl = await uploadFileToStorage(file, AVATAR_BUCKET, state.currentUser.id, "avatar");
      }
    } catch (error) {
      profileFeedbackEl.textContent = error instanceof Error ? error.message : "Falha ao enviar avatar para o Storage.";
      return;
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

    if (file && state.currentProfile.avatar_url && state.currentProfile.avatar_url !== avatarUrl) {
      await removeStorageFile(state.currentProfile.avatar_url, AVATAR_BUCKET);
    }

    avatarFileInputEl.value = "";
    profileFeedbackEl.textContent = "Identidade recalibrada.";
    await refreshData();
  });

  resetAvatarEl.addEventListener("click", async () => {
    if (!supabaseClient || !state.currentUser) {
      return;
    }

    await removeStorageFile(state.currentProfile?.avatar_url || "", AVATAR_BUCKET);

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

  modalCloseEl.addEventListener("click", () => closePostModal());
  postModalEl.addEventListener("click", (event) => {
    if (event.target === postModalEl) {
      closePostModal();
    }
  });

  commentFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    saveComment();
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

  const [profileResult, postsResult, votesResult, commentsResult] = await Promise.all([
    supabaseClient.from("profiles").select("*").eq("id", state.currentUser.id).single(),
    supabaseClient.from("posts").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("post_votes").select("post_id, value").eq("user_id", state.currentUser.id),
    supabaseClient.from("post_comments").select("*").order("created_at", { ascending: true })
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
  if (commentsResult.error) {
    state.commentsBackendReady = false;
    state.comments = normalizeLegacyCommentState(JSON.parse(window.localStorage.getItem(COMMENTS_KEY) || "{}"));
  } else {
    state.commentsBackendReady = true;
    state.comments = groupCommentsByPost(commentsResult.data || []);
  }
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
    toggleMobileSidebar(false);
    document.querySelector(".card--groups")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (nav === "identity") {
    syncActiveNav(nav);
    toggleMobileSidebar(false);
    document.querySelector(".card--profile-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  state.filter = nav === "all" ? "all" : nav;
  state.selectedGroup = "todos";
  filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === state.filter));
  syncActiveGroup();
  syncActiveNav(nav);
  toggleMobileSidebar(false);
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
    emptyState.innerHTML = getEmptyStateMarkup();
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

  if (state.searchTerm) {
    posts = posts.filter((post) => {
      const haystack = [
        post.title,
        post.content,
        post.author_display,
        post.author_username,
        GROUPS.find((group) => group.id === post.group_id)?.nome || "",
        ...(post.tags || [])
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(state.searchTerm);
    });
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

function getEmptyStateMarkup() {
  if (state.searchTerm) {
    return `
      <h4>Nenhum registro encontrado</h4>
      <p>Nada corresponde a "${escapeHtml(state.searchTerm)}". Revise a busca ou tente outro círculo.</p>
    `;
  }
  if (state.filter === "saved") {
    return `
      <h4>Nenhum item salvo</h4>
      <p>Salve um registro para reencontrá-lo mais tarde.</p>
    `;
  }
  if (state.filter === "recent") {
    return `
      <h4>Nenhuma atividade recente</h4>
      <p>Este arquivo ainda não recebeu novos sinais nesta janela.</p>
    `;
  }
  return `
    <h4>Nenhum registro detectado</h4>
    <p>Troque o círculo, ajuste o filtro ou anexe a primeira entrada deste arquivo.</p>
  `;
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
  const openButton = node.querySelector(".post-action--open");

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
    withDelay(commentButton, () => openPostModal(post.id));
  });

  openButton.addEventListener("click", () => {
    withDelay(openButton, () => openPostModal(post.id));
  });
}

function toggleSavedPost(postId) {
  if (state.savedPosts.has(postId)) {
    state.savedPosts.delete(postId);
  } else {
    state.savedPosts.add(postId);
  }
  window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify([...state.savedPosts]));
  updateAtmosphericSignals();
  renderPosts();
}

function updateAtmosphericSignals() {
  const previousVisit = Number(window.localStorage.getItem(LAST_VISIT_KEY) || 0);
  const newReports = state.posts.filter((post) => new Date(post.created_at).getTime() > previousVisit).length;
  const activeUnknown = 4 + Math.min(19, state.posts.length + Math.floor(Math.random() * 4));
  const latestPost = state.posts[0];
  const tagCounts = new Map();
  let unclassified = 0;

  state.posts.forEach((post) => {
    if (!post.tags?.length) {
      unclassified += 1;
    }
    (post.tags || []).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "sem-tag";

  unknownUsersCountEl.textContent = String(activeUnknown);
  newReportsCountEl.textContent = String(newReports);
  topTagEl.textContent = `#${topTag}`;
  unclassifiedCountEl.textContent = String(unclassified);
  savedCountEl.textContent = state.savedPosts.size ? `${state.savedPosts.size} relato(s) salvo(s).` : "Nenhum item salvo.";
  if (latestPost) {
    const activityText = `Última atividade detectada: ${formatDate(latestPost.created_at)} em c/${GROUPS.find((group) => group.id === latestPost.group_id)?.nome || "Círculo"}.`;
    lastActivityEl.textContent = activityText;
    rightLastActivityEl.textContent = activityText;
    latestEntryEl.textContent = `Último registro arquivado: ${latestPost.title}.`;
  } else {
    lastActivityEl.textContent = "Última atividade detectada: nenhum rastro confirmado.";
    rightLastActivityEl.textContent = "Última atividade detectada: nenhum rastro confirmado.";
    latestEntryEl.textContent = "Último registro arquivado: nenhum.";
  }

  window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
}

function rotateSystemWhisper() {
  systemWhisperEl.textContent = SYSTEM_WHISPERS[Math.floor(Math.random() * SYSTEM_WHISPERS.length)];
}

function hydrateAmbientState() {
  autoRainEl.checked = window.localStorage.getItem(AUTO_RAIN_KEY) === "true";
  state.savedPosts = new Set(JSON.parse(window.localStorage.getItem(SAVED_POSTS_KEY) || "[]"));
  state.comments = JSON.parse(window.localStorage.getItem(COMMENTS_KEY) || "{}");
}

function setPostType(type) {
  postTypeInputEl.value = type;
  modeChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.postType === type);
  });
  formEl.classList.remove("is-collapsed");
  const wantsText = type === "text" || type === "mixed";
  const wantsImage = type === "image" || type === "mixed";
  const wantsVideo = type === "video" || type === "mixed";
  contentInputEl.parentElement.classList.toggle("is-hidden", !wantsText);
  imageUploadEl.closest(".media-field").classList.toggle("is-hidden", !wantsImage);
  videoUploadEl.closest(".media-field").classList.toggle("is-hidden", !wantsVideo);
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
  imagePreviewCardEl.classList.add("is-hidden");
  videoPreviewCardEl.classList.add("is-hidden");
  imagePreviewNameEl.textContent = "";
  imagePreviewInfoEl.textContent = "";
  videoPreviewNameEl.textContent = "";
  videoPreviewInfoEl.textContent = "";
  mediaPreviewEl.classList.add("is-hidden");
}

async function updateMediaPreview() {
  const imageFile = imageUploadEl.files?.[0];
  const videoFile = videoUploadEl.files?.[0];
  imagePreviewCardEl.classList.add("is-hidden");
  videoPreviewCardEl.classList.add("is-hidden");
  mediaPreviewEl.classList.toggle("is-hidden", !imageFile && !videoFile);

  if (imageFile) {
    imagePreviewEl.src = await readFileAsDataUrl(imageFile);
    imagePreviewNameEl.textContent = imageFile.name;
    imagePreviewInfoEl.textContent = await getImageInfo(imagePreviewEl.src, imageFile);
    imagePreviewCardEl.classList.remove("is-hidden");
  }

  if (videoFile) {
    videoPreviewEl.src = await readFileAsDataUrl(videoFile);
    videoPreviewNameEl.textContent = videoFile.name;
    videoPreviewInfoEl.textContent = await getVideoInfo(videoPreviewEl, videoFile);
    videoPreviewCardEl.classList.remove("is-hidden");
  }

  if (!imageFile && !videoFile) {
    feedbackEl.textContent = "Nenhum anexo foi carregado.";
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

function setupDropzone(dropzone, input, type) {
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const [file] = [...(event.dataTransfer?.files || [])];
    if (!file) {
      return;
    }
    const message = validateMediaFile(file, type);
    if (message) {
      feedbackEl.textContent = message;
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("change"));
  });

  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
}

function toggleMobileSidebar(visible) {
  if (window.innerWidth > 720) {
    return;
  }
  leftSidebarEl.classList.toggle("is-open", visible);
  sidebarOverlayEl.classList.toggle("is-hidden", !visible);
  sidebarOverlayEl.classList.toggle("is-visible", visible);
}

async function getImageInfo(src, file) {
  const dimensions = await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(`${image.naturalWidth}x${image.naturalHeight}px`);
    image.onerror = () => resolve("dimensões indisponíveis");
    image.src = src;
  });
  return `${dimensions} • ${formatBytes(file.size)}`;
}

async function getVideoInfo(videoEl, file) {
  return new Promise((resolve) => {
    const handle = () => {
      videoEl.removeEventListener("loadedmetadata", handle);
      resolve(`${formatDuration(videoEl.duration)} • ${formatBytes(file.size)}`);
    };
    videoEl.addEventListener("loadedmetadata", handle);
  });
}

function formatBytes(bytes) {
  if (!bytes) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "duração indisponível";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function openPostModal(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) {
    return;
  }
  activePostId = postId;
  commentFeedbackEl.textContent = "";
  commentInputEl.value = "";
  const group = GROUPS.find((item) => item.id === post.group_id);
  modalTitleEl.textContent = post.title;
  modalPostEl.innerHTML = `
    <div class="post-modal__body">
      <div class="post-meta">
        <span class="post-group">c/${group?.nome || "Círculo"}</span>
        <span class="post-author" style="color:${post.author_text_color || "#f5eef8"}">por u/${post.author_display}</span>
        <span class="post-date">${formatDate(post.created_at)}</span>
      </div>
      <p class="post-owner">rastro do autor: ${post.author_username}</p>
      ${renderModalMedia(post)}
      ${post.content ? `<p class="post-text">${escapeHtml(post.content)}</p>` : ""}
      <div class="post-actions">
        <button class="post-action post-action--save ${state.savedPosts.has(post.id) ? "is-active" : ""}" type="button" data-modal-save="${post.id}">${state.savedPosts.has(post.id) ? "Salvo" : "Salvar"}</button>
        <button class="post-action post-action--share" type="button" data-modal-share="${post.id}">Compartilhar</button>
      </div>
    </div>
  `;
  modalPostEl.querySelector("[data-modal-save]")?.addEventListener("click", () => toggleSavedPost(post.id));
  modalPostEl.querySelector("[data-modal-share]")?.addEventListener("click", async () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    await navigator.clipboard?.writeText(url);
    commentFeedbackEl.textContent = "Link do registro copiado.";
  });
  renderComments(post.id);
  renderRelatedPosts(post);
  if (typeof postModalEl.showModal === "function") {
    postModalEl.showModal();
  }
}

function closePostModal() {
  activePostId = null;
  if (postModalEl.open) {
    postModalEl.close();
  }
}

function renderModalMedia(post) {
  const parts = [];
  if (post.media_image_url) {
    parts.push(`<div class="post-media"><img src="${post.media_image_url}" alt="Anexo visual do relato ${escapeHtml(post.title)}"></div>`);
  }
  if (post.media_video_url) {
    parts.push(`<div class="post-media"><video src="${post.media_video_url}" controls preload="metadata"></video></div>`);
  }
  return parts.join("");
}

function renderComments(postId) {
  const comments = state.comments[postId] || [];
  commentsListEl.innerHTML = "";
  if (!comments.length) {
    commentsListEl.innerHTML = `<article class="comment-card"><div class="comment-card__meta">Nenhum comentário ainda.</div><p>Se você ficou até aqui, deixe um rastro.</p></article>`;
    return;
  }
  comments.forEach((comment) => {
    const article = document.createElement("article");
    article.className = `comment-card${comment.authorId === state.currentUser?.id ? " comment-card--author" : ""}`;
    article.innerHTML = `
      <div class="comment-card__meta">u/${comment.authorDisplay} • ${formatDate(comment.createdAt)}${comment.authorId === state.currentUser?.id ? " • autor atual" : ""}</div>
      <p>${escapeHtml(comment.content)}</p>
    `;
    commentsListEl.appendChild(article);
  });
}

async function saveComment() {
  if (!activePostId || !state.currentUser || !state.currentProfile) {
    return;
  }
  const content = commentInputEl.value.trim();
  if (!content) {
    commentFeedbackEl.textContent = "Escreva algo antes de salvar o comentário.";
    return;
  }
  if (!state.commentsBackendReady) {
    commentFeedbackEl.textContent = "O banco ainda nao recebeu a tabela de comentarios. Rode o SQL atualizado do Supabase.";
    return;
  }
  const payload = {
    post_id: activePostId,
    user_id: state.currentUser.id,
    author_display: state.currentProfile.display_name,
    author_username: state.currentProfile.username,
    author_text_color: state.currentProfile.text_color,
    author_avatar_url: state.currentProfile.avatar_url || "",
    content
  };
  const { data, error } = await supabaseClient
    .from("post_comments")
    .insert(payload)
    .select("*")
    .single();
  if (error) {
    commentFeedbackEl.textContent = error.message.includes("post_comments")
      ? "O banco ainda nao recebeu a tabela de comentarios. Rode o SQL atualizado do Supabase."
      : error.message;
    return;
  }
  const entry = mapCommentRecord(data);
  state.comments[activePostId] = [...(state.comments[activePostId] || []), entry];
  commentInputEl.value = "";
  commentFeedbackEl.textContent = "Comentário salvo sob o registro.";
  renderComments(activePostId);
}

function groupCommentsByPost(comments) {
  return comments.reduce((grouped, comment) => {
    const mappedComment = mapCommentRecord(comment);
    if (!grouped[mappedComment.postId]) {
      grouped[mappedComment.postId] = [];
    }
    grouped[mappedComment.postId].push(mappedComment);
    return grouped;
  }, {});
}

function mapCommentRecord(comment) {
  return {
    id: comment.id,
    postId: comment.post_id,
    authorId: comment.user_id,
    authorDisplay: comment.author_display,
    content: comment.content,
    createdAt: comment.created_at
  };
}

function normalizeLegacyCommentState(commentsByPost) {
  return Object.fromEntries(
    Object.entries(commentsByPost).map(([postId, comments]) => [
      postId,
      (comments || []).map((comment) => ({
        id: comment.id,
        postId,
        authorId: comment.authorId || comment.user_id || "",
        authorDisplay: comment.authorDisplay || comment.author_display || "Anônimo",
        content: comment.content || "",
        createdAt: comment.createdAt || comment.created_at || new Date().toISOString()
      }))
    ])
  );
}

function renderRelatedPosts(post) {
  relatedPostsEl.innerHTML = "";
  const related = state.posts
    .filter((item) => item.id !== post.id && item.group_id === post.group_id)
    .slice(0, 3);
  if (!related.length) {
    relatedPostsEl.innerHTML = `<article class="related-post"><h4 class="related-post__title">Nenhum outro rastro neste círculo.</h4><p class="related-post__excerpt">Arquivos relacionados aparecerão quando mais registros forem anexados.</p></article>`;
    return;
  }
  related.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-post";
    button.innerHTML = `
      <h4 class="related-post__title">${escapeHtml(item.title)}</h4>
      <div class="related-post__meta">${formatDate(item.created_at)} • u/${item.author_display}</div>
      <p class="related-post__excerpt">${escapeHtml((item.content || "").slice(0, 140))}${item.content?.length > 140 ? "..." : ""}</p>
    `;
    button.addEventListener("click", () => openPostModal(item.id));
    relatedPostsEl.appendChild(button);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

async function uploadFileToStorage(file, bucket, userId, folder) {
  if (!supabaseClient) {
    throw new Error("Supabase indisponivel para upload.");
  }
  const extension = getFileExtension(file.name);
  const path = `${userId}/${folder}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) {
    throw new Error(mapStorageError(error));
  }
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function removeStorageFile(publicUrl, bucket) {
  if (!supabaseClient || !publicUrl || publicUrl.startsWith("data:")) {
    return;
  }
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) {
    return;
  }
  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  if (!path) {
    return;
  }
  await supabaseClient.storage.from(bucket).remove([path]);
}

function getFileExtension(filename) {
  const parts = String(filename || "").split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function mapStorageError(error) {
  const message = String(error?.message || "");
  if (message.includes("Bucket not found")) {
    return "O bucket do Storage ainda nao existe. Rode o SQL atualizado do Supabase.";
  }
  if (message.includes("row-level security") || message.includes("permission")) {
    return "As politicas do Storage ainda nao estao liberando upload. Rode o SQL atualizado do Supabase.";
  }
  return message || "Falha ao enviar arquivo para o Storage.";
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
