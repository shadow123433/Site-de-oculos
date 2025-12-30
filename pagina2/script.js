/* =========================
   ESTADO GLOBAL
========================= */
let carrinho = [];
let total = 0;

/* =========================
   ELEMENTOS FIXOS
========================= */
const carrinhoTexto = document.querySelector(".carrinho p");
const totalTexto = document.querySelector(".total");
const finalizarBtn = document.querySelector(".finalizar");
const botoesMarca = document.querySelectorAll(".marca-card button");
const containerMarcas = document.querySelector(".marcas-grid");

/* =========================
   TOAST PROFISSIONAL
========================= */
const toast = document.createElement("div");
toast.className = "toast";
toast.style.position = "fixed";
toast.style.top = "20px";
toast.style.right = "20px";
toast.style.backgroundColor = "#000";
toast.style.color = "#fff";
toast.style.padding = "12px 18px";
toast.style.borderRadius = "12px";
toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";
toast.style.zIndex = "99999";
toast.style.fontWeight = "bold";
toast.style.display = "none";
document.body.appendChild(toast);

let toastTimeout;
function showToast(msg){
    toast.textContent = msg;
    toast.style.display = "block";

    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

/* =========================
   PRODUTOS POR MARCA
========================= */
const produtosPorMarca = {
    RAYBAN:[
        {nome:"", preco:349.9, cores:["Preto","Marrom","Dourado","Rosa","Amarelo"], imagem:"../IMAGEM-OCULOS/imagem1.jpg"}, 
    ],
};


/* =========================
   LIGHTBOX
========================= */
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
lightbox.className = "lightbox-overlay";
lightbox.innerHTML = `<img src="" alt="Óculos em tela cheia">`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");
lightbox.onclick = e => { if(e.target !== lightboxImg){ lightbox.style.display="none"; lightboxImg.src=""; } };

/* =========================
   FUNÇÃO PARA MOSTRAR PRODUTOS
========================= */
let produtosAtivos = null;

function toggleProdutos(btn, marca){
    if(produtosAtivos){
        produtosAtivos.remove();
        if(produtosAtivos === btn) { produtosAtivos = null; return; }
        produtosAtivos = null;
    }

    const produtos = produtosPorMarca[marca];
    if(!produtos) return showToast("Produtos não encontrados");

    const containerProdutos = document.createElement("div");
    containerProdutos.className = "produtos-container";
    containerProdutos.style.marginTop = "40px";

    const grid = document.createElement("div");
    grid.className = "produtos-grid";

    produtos.forEach(produto=>{
        const card = document.createElement("div");
        card.className = "produto-card";
        card.innerHTML = `
            <img src="${produto.imagem}" class="produto-img">
            <strong>${produto.nome}</strong>
            <select>
                <option value="">Selecione a cor</option>
                ${produto.cores.map(c=>`<option value="${c}">${c}</option>`).join("")}
            </select>
            <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
            <button class="botao-primario">Adicionar</button>
        `;

        card.querySelector(".produto-img").onclick = () => {
            lightboxImg.src = produto.imagem;
            lightbox.style.display = "flex";
        };

        card.querySelector("button").onclick = () => {
            const cor = card.querySelector("select").value;
            if(!cor) return showToast("Selecione a cor");
            addCarrinho(`${produto.nome} - Cor: ${cor}`, produto.preco);
        };

        grid.appendChild(card);
    });

    const botaoVoltar = document.createElement("button");
    botaoVoltar.className = "botao-voltar";
    botaoVoltar.textContent = "← Voltar";
    botaoVoltar.style.marginTop = "20px";
    botaoVoltar.onclick = () => containerProdutos.remove();

    containerProdutos.appendChild(grid);
    containerProdutos.appendChild(botaoVoltar);

    containerMarcas.insertAdjacentElement("afterend", containerProdutos);
    produtosAtivos = containerProdutos;
}

/* =========================
   EVENTOS MARCAS
========================= */
botoesMarca.forEach(btn => {
    btn.onclick = () => toggleProdutos(btn, btn.dataset.marca);
});

/* =========================
   CARRINHO
========================= */
function addCarrinho(nome, preco){
    carrinho.push({nome, preco});
    total += preco;
    atualizarCarrinho();
    showToast("Item adicionado ao carrinho");
}

function atualizarCarrinho(){
    if(carrinho.length){
        carrinhoTexto.innerHTML = carrinho.map((i, idx) => `• ${i.nome} <button onclick="removerItem(${idx})">❌</button>`).join("<br>");
    } else {
        carrinhoTexto.innerHTML = "Nenhum item adicionado.";
        showToast("Nenhum item adicionado");
    }
    totalTexto.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
}

function removerItem(idx){
    total -= carrinho[idx].preco;
    carrinho.splice(idx,1);
    atualizarCarrinho();
}

/* =========================
   MODAL FINALIZAR PEDIDO
========================= */
const modal = document.createElement("div");
modal.className = "modal-overlay";
modal.style.display = "none";
modal.innerHTML = `
    <div class="modal">
        <h2>Confirmação de entrega</h2>
        <input id="nome" placeholder="Nome completo">
        <input id="whats" placeholder="WhatsApp">
        <input id="endereco" placeholder="Rua / Avenida">
        <input id="numero" placeholder="Número da casa">
        <input id="referencia" placeholder="Ponto de referência">
        <div>
            <button id="cancelar">Cancelar</button>
            <button id="confirmar">Confirmar pedido</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

finalizarBtn.onclick = () => {
    if(!carrinho.length) return showToast("Carrinho vazio! Adicione ao menos um item.");
    modal.style.display = "flex";
};

modal.querySelector("#cancelar").onclick = () => modal.style.display = "none";

modal.querySelector("#confirmar").onclick = () => {
    const nome = modal.querySelector("#nome").value.trim();
    const whats = modal.querySelector("#whats").value.trim();
    const endereco = modal.querySelector("#endereco").value.trim();
    const numero = modal.querySelector("#numero").value.trim();
    const referencia = modal.querySelector("#referencia").value.trim();

    if(!nome || !whats || !endereco || !numero) return showToast("Preencha os campos obrigatórios");

    const itens = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join("\n");
    const mensagem = `
*NOVO PEDIDO DE ÓCULOS*
Nome: ${nome}
WhatsApp: ${whats}
Endereço: ${endereco}, Nº ${numero}
${referencia ? "📌 Ref: " + referencia : ""}
Itens:
${itens}
Total: R$ ${total.toFixed(2)}
    `.trim();

    window.open(`https://wa.me/27997913970?text=${encodeURIComponent(mensagem)}`, "_blank");
    carrinho = []; total = 0; atualizarCarrinho();
    modal.style.display="none";
};
