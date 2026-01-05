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
      nome: "Óculos Romeo 2 Full Metal - PRETO",
      preco: 170,
      cores: ["Preto"],
      imagem: "../IMAGEM-OCULOS/imagem1.png"
    },
  
    {
      nome: "Óculos Romeo 2 Full Metal - PRATA",
      preco: 170,
      cores: ["Prata"],
      imagem: "../IMAGEM-OCULOS/imagem2.png"
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


      <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
      <button type="button">Adicionar ao carrinho</button>
    `;

    card.querySelector("img").onclick = () => {
      lightboxImg.src = produto.imagem;
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
      resetLightbox();
    };

  card.querySelector("button").onclick = () => {
  adicionarAoCarrinho(produto.nome, produto.cor, produto.preco);
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
  showToast("Este item foi adicionado ao carrinho");
}

function atualizarCarrinho() {
  carrinhoContainer.innerHTML = "";

  carrinho.forEach(item => {
    Object.entries(item.cores).forEach(([cor, qtd]) => {
      const linha = document.createElement("div");
      linha.className = "linha-carrinho";

      linha.innerHTML = `
        <span>• ${item.produto} (${cor} × ${qtd})</span>
        <button 
          class="btn-remover" 
          data-produto="${item.produto}" 
          data-cor="${cor}"
        >✖</button>
      `;

      carrinhoContainer.appendChild(linha);
    });
  });

  document.querySelectorAll(".btn-remover").forEach(btn => {
    btn.onclick = e => {
      removerItem(
        e.target.dataset.produto,
        e.target.dataset.cor
      );
    };
  });

  totalValor.textContent = total.toFixed(2);
}



function removerItem(produto, cor) {
  const itemIndex = carrinho.findIndex(i => i.produto === produto);
  if (itemIndex === -1) return;

  const item = carrinho[itemIndex];

  if (!item.cores[cor]) return;

  item.cores[cor]--;
  total -= item.precoUnitario;

  if (item.cores[cor] === 0) {
    delete item.cores[cor];
  }

  if (Object.keys(item.cores).length === 0) {
    carrinho.splice(itemIndex, 1);
  }

  atualizarCarrinho();
  showToast("Este item foi removido do carrinho");
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
    <input id="endereco" placeholder="Rua / avenida">
    <input id="numero" placeholder="Número da casa">
    <input id="referencia" placeholder="Referência">
    <div>
      <button id="cancelar">Cancelar</button>
      <button id="confirmar">Confirmar pedido</button>
    </div>
  </div>
`;

document.body.appendChild(modal);
const inputNumero = modal.querySelector("#numero");

inputNumero.addEventListener("input", () => {
  inputNumero.value = inputNumero.value.replace(/\D/g, "");
});


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
  const endereco = modal.querySelector("#endereco").value;
  const numero = modal.querySelector("#numero").value.trim();
  const referencia = modal.querySelector("#referencia").value;

  if (!nome || !endereco || !numero)
    return showToast("Preencha os campos obrigatórios");

  const pedidoID = gerarPedidoID();

  const itens = carrinho.map(item => {
    const cores = Object.entries(item.cores)
      .map(([cor, qtd]) => `${cor} × ${qtd}`)
      .join(" | ");
    return `- ${item.produto} (${cores})`;
  }).join("\n");

  const mensagem = `
*NOVO PEDIDO DE OCULOS*
Pedido: ${pedidoID}

Nome: ${nome}

Endereço: ${endereco}

Número da casa: ${numero}

${referencia ? "Referência: " + referencia : ""}

Itens:
${itens}

⚠️ Valor será confirmado pela loja
`.trim();

  window.open(
    `https://wa.me/27997913970?text=${encodeURIComponent(mensagem)}`,
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




let startDistance = 0;

lightboxImg.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    startDistance = getDistance(e.touches[0], e.touches[1]);
  }
}, { passive: false });

lightboxImg.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();

    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const zoomFactor = newDistance / startDistance;

    scale *= zoomFactor;
    scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

    lightboxImg.style.transform = `scale(${scale})`;
    startDistance = newDistance;
  }
}, { passive: false });

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

