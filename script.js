// API do YGOPRODeck (v7). Documentação: https://ygoprodeck.com/api-guide/
// Buscar TODAS as cartas retorna milhares de registros, então filtramos por arquétipo
// e limitamos a quantidade. Troque os parâmetros para exibir outras cartas.
const API_URL =
  "https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Blue-Eyes&language=pt&num=24&offset=0";

const cardsContainer = document.getElementById("cards-container");
const statusMessage = document.getElementById("status");
const searchInput = document.getElementById("card-search");
const modal = document.getElementById("card-modal");
const modalContent = document.getElementById("modal-content");
let loadedCards = [];
let lastFocused = null;

// Corta a descricao para exibir apenas um trecho no card.
function excerpt(text, max = 90) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "Sem descrição disponível.";
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

// Monta a lista de status disponíveis (cartas de magia/armadilha não têm ATK/DEF).
function getStats(card) {
  const stats = [];
  if (card.attribute) stats.push(["Atributo", card.attribute]);
  if (card.level !== undefined) stats.push(["Nível", card.level]);
  if (card.race) stats.push(["Tipo/Raça", card.race]);
  if (card.atk !== undefined) stats.push(["ATK", card.atk]);
  if (card.def !== undefined) stats.push(["DEF", card.def]);
  return stats;
}

// Cria a tela de detalhes (status + descrição completa) via DOM.
function openModal(card) {
  lastFocused = document.activeElement;
  modalContent.replaceChildren();

  const close = document.createElement("button");
  close.className = "modal-close";
  close.type = "button";
  close.setAttribute("aria-label", "Fechar");
  close.textContent = "✕";
  close.addEventListener("click", closeModal);

  const images = card.card_images && card.card_images[0];
  const imageUrl = images && (images.image_url || images.image_url_small);
  modalContent.appendChild(close);
  if (imageUrl) {
    const img = document.createElement("img");
    img.className = "modal-image";
    img.src = imageUrl;
    img.alt = `Imagem da carta ${card.name || "sem nome"}`;
    modalContent.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "modal-body";

  const label = document.createElement("p");
  label.className = "card-label";
  label.textContent = card.type || "Carta";
  const title = document.createElement("h3");
  title.textContent = card.name || "Carta sem nome";
  body.append(label, title);

  const stats = getStats(card);
  if (stats.length) {
    const grid = document.createElement("div");
    grid.className = "modal-stats";
    stats.forEach(([name, value]) => {
      const box = document.createElement("div");
      box.className = "modal-stat";
      const n = document.createElement("span");
      n.textContent = name;
      const v = document.createElement("b");
      v.textContent = value;
      box.append(n, v);
      grid.appendChild(box);
    });
    body.appendChild(grid);
  }

  const descTitle = document.createElement("p");
  descTitle.className = "modal-desc-title";
  descTitle.textContent = "DESCRIÇÃO";
  const desc = document.createElement("p");
  desc.className = "modal-desc";
  desc.textContent = card.desc || "Sem descrição disponível.";
  body.append(descTitle, desc);

  modalContent.appendChild(body);
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  close.focus();
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// Cria cada card dinamicamente usando createElement e appendChild.
function createCard(card) {
  const article = document.createElement("article");
  article.classList.add("card");

  const imageWrap = document.createElement("div");
  imageWrap.classList.add("card-image-wrap");

  const showFallback = () => {
    const fallback = document.createElement("span");
    fallback.className = "image-placeholder";
    fallback.textContent = "✧";
    imageWrap.appendChild(fallback);
  };

  // As imagens ficam dentro do array card_images. Usamos a versão pequena.
  const images = card.card_images && card.card_images[0];
  const imageUrl = images && (images.image_url_small || images.image_url);

  if (imageUrl) {
    const image = document.createElement("img");
    image.classList.add("card-image");
    image.src = imageUrl;
    image.alt = `Imagem da carta ${card.name || "sem nome"}`;
    image.loading = "lazy";
    image.onerror = () => {
      image.remove();
      showFallback();
    };
    imageWrap.appendChild(image);
  } else {
    showFallback();
  }

  const info = document.createElement("div");
  info.className = "card-info";
  const label = document.createElement("p");
  label.className = "card-label";
  label.textContent = card.type || "Carta";
  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = card.name || `Carta ${card.id ?? ""}`.trim();

  info.appendChild(label);
  info.appendChild(title);

  // Status resumido (ATK/DEF) quando a carta for um monstro.
  if (card.atk !== undefined || card.def !== undefined) {
    const stats = document.createElement("p");
    stats.className = "card-stats";
    stats.textContent = `ATK ${card.atk ?? "—"} / DEF ${card.def ?? "—"}`;
    info.appendChild(stats);
  }

  // Trecho de card.desc
  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = excerpt(card.desc);
  info.appendChild(desc);

  const more = document.createElement("p");
  more.className = "card-more";
  more.textContent = "VER DETALHES ▶";
  info.appendChild(more);

  article.appendChild(imageWrap);
  article.appendChild(info);

  // Clique/Enter abre a tela com status e descrição completa.
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `Ver detalhes de ${card.name || "carta"}`);
  article.addEventListener("click", () => openModal(card));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(card);
    }
  });
  return article;
}

function renderCards(cards) {
  cardsContainer.replaceChildren();

  if (cards.length === 0) {
    statusMessage.textContent = "Nenhuma carta corresponde à sua pesquisa.";
    cardsContainer.innerHTML = '<p class="empty-state">Tente outro nome para encontrar uma carta.</p>';
    return;
  }

  cards.forEach((card) => cardsContainer.appendChild(createCard(card)));
  statusMessage.textContent = `${cards.length} carta(s) encontrada(s).`;
}

function filterCards() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const filteredCards = loadedCards.filter((card) =>
    (card.name || "").toLocaleLowerCase("pt-BR").includes(query)
  );
  renderCards(filteredCards);
}

async function loadCards() {
  statusMessage.textContent = "Carregando cartas...";
  statusMessage.classList.remove("error");
  cardsContainer.replaceChildren();

  try {
    const response = await fetch(API_URL);

    // Em caso de erro, a API responde 400 com { "error": "mensagem" }.
    if (!response.ok) {
      let detail = "";
      try {
        detail = (await response.json()).error || "";
      } catch (_) {}
      throw new Error(`Erro HTTP ${response.status} ${detail}`.trim());
    }

    const data = await response.json();
    loadedCards = Array.isArray(data.data) ? data.data : [];

    if (loadedCards.length === 0) {
      statusMessage.textContent = "Nenhuma carta foi encontrada na API.";
      cardsContainer.innerHTML = '<p class="empty-state">A coleção está vazia no momento.</p>';
      return;
    }

    filterCards();
  } catch (error) {
    console.error("Erro ao carregar cartas:", error);
    statusMessage.textContent = "Não foi possível carregar as cartas. Tente novamente mais tarde.";
    statusMessage.classList.add("error");
    cardsContainer.innerHTML = '<p class="empty-state">A API pode estar temporariamente indisponível. Tente recarregar a página mais tarde.</p>';
  }
}

searchInput.addEventListener("input", filterCards);
loadCards();