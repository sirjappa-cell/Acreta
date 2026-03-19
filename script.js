const STORAGE_KEY = "acreta-posts-v1";
const DB_NAME = "acreta-db";
const DB_VERSION = 1;
const POSTS_STORE = "posts";

const groups = [
  {
    id: "todos",
    nome: "Todos",
    descricao: "Visão geral com tudo o que foi publicado."
  },
  {
    id: "terror-classico",
    nome: "Terror Clássico",
    descricao: "Casarões, vultos, maldições e atmosfera gótica."
  },
  {
    id: "ficcao-sombria",
    nome: "Ficção Sombria",
    descricao: "Sci-fi macabra, tecnologia hostil e futuros doentes."
  },
  {
    id: "horror-psicologico",
    nome: "Horror Psicológico",
    descricao: "Paranoia, memória falha e terror interno."
  },
  {
    id: "folk-horror",
    nome: "Folk Horror",
    descricao: "Vilarejos isolados, ritos antigos e natureza ameaçadora."
  },
  {
    id: "investigacao",
    nome: "Investigação Maldita",
    descricao: "Diários, fitas, fóruns apagados e pistas proibidas."
  },
  {
    id: "sobrenatural-urbano",
    nome: "Sobrenatural Urbano",
    descricao: "Metrôs, prédios, becos e horrores da cidade."
  },
  {
    id: "creepypasta",
    nome: "Creepypasta",
    descricao: "Relatos curtos, virais e perturbadores."
  },
  {
    id: "cosmico",
    nome: "Horror Cósmico",
    descricao: "Entidades imensas, insignificância e ruína mental."
  },
  {
    id: "corpo",
    nome: "Body Horror",
    descricao: "Transformações grotescas e carne fora de controle."
  },
  {
    id: "pesadelos-reais",
    nome: "Pesadelos Reais",
    descricao: "Relatos plausíveis, crimes estranhos e medo do cotidiano."
  }
];

const defaultPosts = [
  {
    id: crypto.randomUUID(),
    group: "horror-psicologico",
    title: "Meu reflexo piscou antes de mim",
    author: "NoiteFixa",
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
    content: "Todo mundo no vagão fingiu não ver. As portas abriram numa plataforma coberta de azulejos vermelhos e anúncios sem rosto. Um menino entrou, sentou na minha frente e perguntou por que eu ainda tinha sombra.",
    tags: ["metrô", "cidade", "fantasma"],
    votes: 203,
    createdAt: "2026-03-13T07:25:00"
  }
];

const state = {
  selectedGroup: "todos",
  filter: "all",
  posts: []
};

const groupListEl = document.querySelector("#group-list");
const groupSelectEl = document.querySelector("#group");
const postFeedEl = document.querySelector("#post-feed");
const postTemplate = document.querySelector("#post-template");
const feedTitleEl = document.querySelector("#feed-title");
const formEl = document.querySelector("#post-form");
const feedbackEl = document.querySelector("#form-feedback");
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));

renderGroupControls();
bindEvents();
void initApp();

function bindEvents() {
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(formEl);
    const title = String(formData.get("title") || "").trim();
    const group = String(formData.get("group") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const tagsRaw = String(formData.get("tags") || "").trim();

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

    const post = {
      id: crypto.randomUUID(),
      title,
      group,
      author,
      content,
      tags,
      votes: randomVoteCount(),
      createdAt: new Date().toISOString()
    };

    feedbackEl.textContent = "Salvando relato...";

    try {
      state.posts.unshift(post);
      await savePosts(state.posts);
      state.selectedGroup = group;
      syncActiveGroup();
      renderPosts();
      formEl.reset();
      feedbackEl.textContent = "Relato publicado no Acreta e salvo neste navegador.";
      window.scrollTo({ top: document.querySelector(".feed-header").offsetTop - 24, behavior: "smooth" });
    } catch (error) {
      state.posts = state.posts.filter((item) => item.id !== post.id);
      feedbackEl.textContent = "Não foi possível salvar esse relato longo neste navegador.";
      console.error(error);
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderPosts();
    });
  });
}

async function initApp() {
  try {
    state.posts = await loadPosts();
    feedbackEl.textContent = "Textos longos agora usam armazenamento ampliado no navegador.";
  } catch (error) {
    state.posts = [...defaultPosts];
    feedbackEl.textContent = "Falha ao carregar o armazenamento local. Usando relatos de exemplo.";
    console.error(error);
  }

  renderPosts();
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

    node.querySelector(".vote-score").textContent = post.votes;
    node.querySelector(".post-group").textContent = `c/${group?.nome || "Grupo"}`;
    node.querySelector(".post-author").textContent = `por u/${post.author}`;
    node.querySelector(".post-date").textContent = formatDate(post.createdAt);
    node.querySelector(".post-title").textContent = post.title;
    node.querySelector(".post-text").textContent = post.content;

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

function getVisiblePosts() {
  let posts = [...state.posts];

  if (state.selectedGroup !== "todos") {
    posts = posts.filter((post) => post.group === state.selectedGroup);
  }

  if (state.filter === "recent") {
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (state.filter === "long") {
    posts.sort((a, b) => b.content.length - a.content.length);
  }

  return posts;
}

async function loadPosts() {
  const postsFromDb = await getPostsFromIndexedDb();
  if (postsFromDb.length) {
    return postsFromDb;
  }

  const legacyPosts = loadPostsFromLocalStorage();
  if (legacyPosts.length) {
    await savePostsToIndexedDb(legacyPosts);
    return legacyPosts;
  }

  await savePosts(defaultPosts);
  return [...defaultPosts];
}

async function savePosts(posts) {
  await savePostsToIndexedDb(posts);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, 20)));
  } catch (error) {
    console.warn("Resumo dos posts não coube no localStorage.", error);
  }
}

function loadPostsFromLocalStorage() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Falha ao ler posts legados do localStorage.", error);
    return [];
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(POSTS_STORE)) {
        database.createObjectStore(POSTS_STORE, { keyPath: "id" });
      }
    });

    request.addEventListener("success", () => {
      resolve(request.result);
    });

    request.addEventListener("error", () => {
      reject(request.error || new Error("Falha ao abrir IndexedDB."));
    });
  });
}

async function getPostsFromIndexedDb() {
  if (!("indexedDB" in window)) {
    return [];
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(POSTS_STORE, "readonly");
    const store = transaction.objectStore(POSTS_STORE);
    const request = store.getAll();

    request.addEventListener("success", () => {
      const posts = Array.isArray(request.result) ? request.result : [];
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(posts);
    });

    request.addEventListener("error", () => {
      reject(request.error || new Error("Falha ao carregar posts do IndexedDB."));
    });

    transaction.addEventListener("complete", () => db.close());
    transaction.addEventListener("error", () => db.close());
    transaction.addEventListener("abort", () => db.close());
  });
}

async function savePostsToIndexedDb(posts) {
  if (!("indexedDB" in window)) {
    throw new Error("IndexedDB indisponível neste navegador.");
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(POSTS_STORE, "readwrite");
    const store = transaction.objectStore(POSTS_STORE);
    const clearRequest = store.clear();

    clearRequest.addEventListener("error", () => {
      reject(clearRequest.error || new Error("Falha ao limpar posts no IndexedDB."));
    });

    clearRequest.addEventListener("success", () => {
      posts.forEach((post) => {
        store.put(post);
      });
    });

    transaction.addEventListener("complete", () => {
      db.close();
      resolve();
    });

    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error || new Error("Falha ao salvar posts no IndexedDB."));
    });

    transaction.addEventListener("abort", () => {
      db.close();
      reject(transaction.error || new Error("Gravação abortada no IndexedDB."));
    });
  });
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
