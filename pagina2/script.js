/* =========================
   ESTADO GLOBAL
========================= */
let carrinho = [];
let total = 0;

function gerarPedidoID() {
  return "PED-" + Date.now().toString().slice(-6);
}

/* =========================
   ELEMENTOS DO DOM
========================= */
const container = document.querySelector(".container");
const secaoMarcas = document.querySelector(".marcas");
const botoesMarca = document.querySelectorAll(".marca-card button");

const produtosSec = document.querySelector(".produtos");
const produtosGrid = produtosSec.querySelector(".produtos-grid");
const fecharProdutosBtn = document.getElementById("fecharProdutos");

const carrinhoContainer = document.querySelector(".itens-carrinho");
const totalValor = document.getElementById("valorTotal");
const finalizarBtn = document.querySelector(".finalizar");

/* =========================
   TOAST
========================= */
const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   PRODUTOS POR MARCA
========================= */
const produtosPorMarca = {
  ROMEO: [
    {
      nome: "Óculos Romeo 2 Full Metal",
      preco: 349.9,
      cores: ["Preto", "Prata"],
      imagem: "../IMAGEM-OCULOS/imagem1.jpg"
    }
  ]
};

/* =========================
   LIGHTBOX
========================= */
const lightbox = document.createElement("div");
lightbox.className = "lightbox-overlay";
lightbox.innerHTML = `<span class="fechar-lightbox">✖</span><img src="">`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector("img");
const fecharLightbox = lightbox.querySelector(".fechar-lightbox");

/* =========================
   MOSTRAR PRODUTOS
========================= */
function mostrarProdutos(marca) {
  produtosGrid.innerHTML = "";

  const produtos = produtosPorMarca[marca];
  if (!produtos) return showToast("Marca inválida");

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <img src="${produto.imagem}" class="produto-img">
      <strong>${produto.nome}</strong>

      <select>
        <option value="">Selecione a cor</option>
        ${produto.cores.map(c => `<option value="${c}">${c}</option>`).join("")}
      </select>

      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
      <button type="button">Adicionar</button>
    `;

    card.querySelector("img").onclick = () => {
      lightboxImg.src = produto.imagem;
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
      resetLightbox();
    };

    card.querySelector("button").onclick = () => {
      const cor = card.querySelector("select").value;
      if (!cor) return showToast("Selecione uma cor");
      adicionarAoCarrinho(produto.nome, cor, produto.preco);
    };

    produtosGrid.appendChild(card);
  });

  secaoMarcas.style.display = "none";
  produtosSec.hidden = false;
  produtosSec.scrollIntoView({ behavior: "smooth" });
}

/* =========================
   CARRINHO
========================= */
function adicionarAoCarrinho(produto, cor, preco) {
  let item = carrinho.find(i => i.produto === produto);

  if (!item) {
    item = { produto, cores: {}, precoUnitario: preco };
    carrinho.push(item);
  }

  item.cores[cor] = (item.cores[cor] || 0) + 1;
  total += preco;

  atualizarCarrinho();
  showToast("Item adicionado");
}

function atualizarCarrinho() {
  carrinhoContainer.innerHTML = "";

  if (!carrinho.length) {
    carrinhoContainer.innerHTML = `<p class="carrinho-vazio">Nenhum item adicionado.</p>`;
    totalValor.textContent = "0,00";
    return;
  }

  carrinho.forEach(item => {
    const cores = Object.entries(item.cores)
      .map(([cor, qtd]) => `${cor} × ${qtd}`)
      .join(" | ");

    const linha = document.createElement("div");
    linha.style.display = "flex";
    linha.style.justifyContent = "space-between";
    linha.style.marginBottom = "6px";

    linha.innerHTML = `
      <span>• ${item.produto} (${cores})</span>
      <span style="cursor:pointer; color:red; font-weight:bold;">✖</span>
    `;

    linha.querySelector("span:last-child").onclick = () => removerItem(item.produto);
    carrinhoContainer.appendChild(linha);
  });

  totalValor.textContent = total.toFixed(2);
}

function removerItem(produto) {
  const index = carrinho.findIndex(i => i.produto === produto);
  if (index === -1) return;

  const item = carrinho[index];
  const qtd = Object.values(item.cores).reduce((a, b) => a + b, 0);

  total -= qtd * item.precoUnitario;
  carrinho.splice(index, 1);

  atualizarCarrinho();
  showToast("Item removido");
}

/* =========================
   MODAL DE CONFIRMAÇÃO
========================= */
const modal = document.createElement("div");
modal.className = "modal-overlay";
modal.style.display = "none";

modal.innerHTML = `
  <div class="modal">
    <h2>Confirmação do pedido</h2>
    <input id="nome" placeholder="Nome completo">
    <input id="whats" placeholder="WhatsApp">
    <input id="endereco" placeholder="Rua / Avenida">
    <input id="numero" placeholder="Número">
    <input id="referencia" placeholder="Referência">
    <div>
      <button id="cancelar">Cancelar</button>
      <button id="confirmar">Confirmar pedido</button>
    </div>
  </div>
`;

document.body.appendChild(modal);

/* =========================
   EVENTOS
========================= */
botoesMarca.forEach(btn => {
  btn.onclick = () => mostrarProdutos(btn.dataset.marca);
});

fecharProdutosBtn.onclick = () => {
  produtosSec.hidden = true;
  secaoMarcas.style.display = "block";
};

finalizarBtn.onclick = () => {
  if (!carrinho.length) return showToast("Carrinho vazio");
  modal.style.display = "flex";
};

modal.querySelector("#cancelar").onclick = () => {
  modal.style.display = "none";
};

modal.querySelector("#confirmar").onclick = () => {
  const nome = modal.querySelector("#nome").value;
  const whats = modal.querySelector("#whats").value;
  const endereco = modal.querySelector("#endereco").value;
  const numero = modal.querySelector("#numero").value;
  const referencia = modal.querySelector("#referencia").value;

  if (!nome || !whats || !endereco || !numero)
    return showToast("Preencha os campos obrigatórios");

  const pedidoID = gerarPedidoID();

  const itens = carrinho.map(item => {
    const cores = Object.entries(item.cores)
      .map(([cor, qtd]) => `${cor} × ${qtd}`)
      .join(" | ");
    return `- ${item.produto} (${cores})`;
  }).join("\n");

  const mensagem = `
*NOVO PEDIDO*
Pedido: ${pedidoID}

Nome: ${nome}
WhatsApp: ${whats}

Endereço:
${endereco}, Nº ${numero}
${referencia ? "Ref: " + referencia : ""}

Itens:
${itens}

⚠️ Valor confirmado pela loja
`.trim();

  window.open(
    `https://wa.me/27998040952?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );

  carrinho = [];
  total = 0;
  atualizarCarrinho();
  modal.style.display = "none";
};

/* =========================
   LIGHTBOX CONTROLES
========================= */
fecharLightbox.onclick = () => {
  lightbox.style.display = "none";
  document.body.style.overflow = "auto";
  resetLightbox();
};

/* =========================
   ZOOM
========================= */
let scale = 1;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function resetLightbox() {
  scale = 1;
  lightboxImg.style.transformOrigin = "center center";
  lightboxImg.style.transform = "scale(1)";
}

lightboxImg.addEventListener("wheel", e => {
  e.preventDefault();
  scale += e.deltaY * -0.004;
  scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);
  lightboxImg.style.transform = `scale(${scale})`;
}, { passive: false });

