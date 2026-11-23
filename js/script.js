/* =========================================================
   LAR DOS GATINHOS - MOTOR COM GOOGLE SHEETS + MENU MOBILE + CARROSSEL RIFAS (LINHA A LINHA)
   ========================================================= */
const SPREADSHEET_ID = "1y139l0OucUYD2VncI02RvYTmkNOx_38tqFkRUt6SCxc";

const SHEETS_URLS = {
    GATOS: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Gatos`,
    RIFAS: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Rifas`,
    PARCEIROS: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Parceiros`,
    GERAL: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Geral`
};

const DADOS_FALLBACK = {
    geral: {
        whatsapp: "5515999999999",
        chavePix: "lardosgatinhos@pix.org.br",
        mesReferencia: "Novembro / 2026",
        arrecadado: "R$ 8.450,00",
        racao: "R$ 4.620,00",
        veterinario: "R$ 3.180,00",
        outros: "R$ 940,00"
    },
    parceiros: [
        { nome: "PetShop Sorocaba", categoria: "Ração & Suprimentos", logo: "https://placehold.co/200x80/6b4c9a/ffffff?text=PetShop+Sorocaba", link: "#" },
        { nome: "Clínica Vet Vida", categoria: "Apoio Veterinário", logo: "https://placehold.co/200x80/2a9d8f/ffffff?text=Clinica+Vet+Vida", link: "#" },
        { nome: "Ração & Cia", categoria: "Alimentação Animal", logo: "https://placehold.co/200x80/f4a261/2d2a32?text=Racao+e+Cia", link: "#" },
        { nome: "Gráfica Aparecidinha", categoria: "Comunicação Visual", logo: "https://placehold.co/200x80/e76f51/ffffff?text=Grafica+Local", link: "#" }
    ],
    rifas: [
        {
            titulo: "Super Rifa de Natal",
            premios: [
                "1º: TV Samsung 43\" + Fonte de água para pets",
                "2º: Air Fryer Britânia + Cama Nuvem",
                "3º: Aspirador de pó portátil sem fio + Comedouro elevado individual",
                "4º: Cafeteira Cadence + 2 xícaras + Kit café + Comedouro elevado duplo",
                "5º: Pix de R$ 500 + Chinelo personalizado + Bolsa de transporte pet"
            ],
            valorCota: "R$ 10,00",
            dataSorteio: "",
            destino: "Sorteio realizado após a venda de todas as cotas. Toda a renda custeia ração, areia e cuidados veterinários para os +100 gatos.",
            linkExterno: "https://rd.app/s/super-rifa-de-natal/9862339",
            imagens: [
                "https://cdn.rd.app/raffles/a3333bb0-ece5-4109-a3fe-90dcf522826c/62695f96-ca8f-4121-8545-a2e9169ea5c2.webp",
                "https://cdn.rd.app/raffles/a3333bb0-ece5-4109-a3fe-90dcf522826c/a7bf2897-52d5-4cfc-ad54-2cae3103cc26.webp",
                "https://cdn.rd.app/raffles/a3333bb0-ece5-4109-a3fe-90dcf522826c/5815d465-04b7-48a5-b6ba-927567f5234b.webp",
                "https://cdn.rd.app/raffles/a3333bb0-ece5-4109-a3fe-90dcf522826c/9d727c7d-be26-456b-ad0f-cc14560d7596.webp"
            ],
            status: "Ativa"
        }
    ],
    gatos: [
        { nome: "Frajola", idade: "Adulto", sexo: "Macho", saude: "Castrado • Vacinado • Negativo", perfil: "Negativo", destaque: true, bio: "Muito dócil, adora colo e se dá bem com outros gatos.", foto: "https://placehold.co/400x350/6b4c9a/ffffff?text=Frajola" },
        { nome: "Amora", idade: "Filhote", sexo: "Fêmea", saude: "1ª Dose Vacina • Negativo", perfil: "Negativo", destaque: true, bio: "Brincalhona e curiosa, resgatada de uma caixa na chuva.", foto: "https://placehold.co/400x350/f4a261/2d2a32?text=Amora" }
    ]
};

let dadosAtuais = JSON.parse(JSON.stringify(DADOS_FALLBACK));
let listaGatosFiltrada = [];
let paginaAtual = 1;
const GATOS_POR_PAGINA = 12;
const indicesCarrosselRifas = {};

/* Controle do Botão Hambúrguer (3 traços) */
function inicializarMenuMobile() {
    const btnMenu = document.getElementById("btn-menu-mobile");
    const listaMenu = document.getElementById("lista-menu-mobile");

    if (btnMenu && listaMenu) {
        btnMenu.addEventListener("click", () => {
            btnMenu.classList.toggle("aberto");
            listaMenu.classList.toggle("ativo");
        });

        document.addEventListener("click", (e) => {
            if (!btnMenu.contains(e.target) && !listaMenu.contains(e.target)) {
                btnMenu.classList.remove("aberto");
                listaMenu.classList.remove("ativo");
            }
        });
    }
}

function formatarUrlImagem(url) {
    if (!url) return "";
    url = url.trim();
    if (!url) return "";
    const matchDrive = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (url.includes("drive.google.com") && matchDrive && matchDrive[1]) {
        return `https://lh3.googleusercontent.com/d/${matchDrive[1]}`;
    }
    return url;
}

function parseCSV(textoCSV) {
    const linhas = [];
    let linhaAtual = [];
    let campoAtual = "";
    let dentroAspas = false;

    for (let i = 0; i < textoCSV.length; i++) {
        const char = textoCSV[i];
        const prox = textoCSV[i + 1];

        if (char === '"' && dentroAspas && prox === '"') {
            campoAtual += '"';
            i++;
        } else if (char === '"') {
            dentroAspas = !dentroAspas;
        } else if (char === ',' && !dentroAspas) {
            linhaAtual.push(campoAtual.trim());
            campoAtual = "";
        } else if ((char === '\r' || char === '\n') && !dentroAspas) {
            if (char === '\r' && prox === '\n') i++;
            linhaAtual.push(campoAtual.trim());
            if (linhaAtual.some(c => c !== "")) linhas.push(linhaAtual);
            linhaAtual = [];
            campoAtual = "";
        } else {
            campoAtual += char;
        }
    }
    if (campoAtual !== "" || linhaAtual.length > 0) {
        linhaAtual.push(campoAtual.trim());
        if (linhaAtual.some(c => c !== "")) linhas.push(linhaAtual);
    }
    return linhas;
}

async function carregarPlanilhaGoogle() {
    try {
        const [resGatos, resRifas, resParceiros, resGeral] = await Promise.all([
            fetch(SHEETS_URLS.GATOS),
            fetch(SHEETS_URLS.RIFAS),
            fetch(SHEETS_URLS.PARCEIROS),
            fetch(SHEETS_URLS.GERAL)
        ]);

        if (!resGatos.ok) throw new Error("Planilha não publicada.");

        const csvGatos = parseCSV(await resGatos.text());
        const csvRifas = parseCSV(await resRifas.text());
        const csvParceiros = parseCSV(await resParceiros.text());
        const csvGeral = parseCSV(await resGeral.text());

        if (csvGeral.length >= 2) {
            const g = csvGeral[1];
            dadosAtuais.geral = {
                whatsapp: g[0] || dadosAtuais.geral.whatsapp,
                chavePix: g[1] || dadosAtuais.geral.chavePix,
                mesReferencia: g[2] || dadosAtuais.geral.mesReferencia,
                arrecadado: g[3] || dadosAtuais.geral.arrecadado,
                racao: g[4] || dadosAtuais.geral.racao,
                veterinario: g[5] || dadosAtuais.geral.veterinario,
                outros: g[6] || dadosAtuais.geral.outros
            };
        }

        if (csvGatos.length >= 2) {
            dadosAtuais.gatos = csvGatos.slice(1).map(row => ({
                nome: row[0] || "Gatinho",
                idade: row[1] || "Adulto",
                sexo: row[2] || "Macho",
                saude: row[3] || "Castrado e Vacinado",
                perfil: row[4] || "Negativo",
                destaque: (row[5] || "").toUpperCase() === "SIM",
                bio: row[6] || "Esperando um lar cheio de amor.",
                foto: formatarUrlImagem(row[7]) || "https://placehold.co/400x350/6b4c9a/ffffff?text=Lar+dos+Gatinhos"
            }));
        }

        if (csvRifas.length >= 2) {
            const rifasAgrupadas = [];
            let rifaAtual = null;

            csvRifas.slice(1).forEach(row => {
                const titulo = (row[0] || "").trim();
                const premioCelula = (row[1] || "").trim();
                const imagemCelula = (row[6] || "").trim();

                const novasImagens = imagemCelula
                    ? imagemCelula.split(",").map(u => formatarUrlImagem(u)).filter(u => u !== "")
                    : [];

                if (titulo !== "") {
                    const premiosIniciais = premioCelula
                        ? premioCelula.split("|").map(p => p.trim()).filter(p => p !== "")
                        : [];

                    rifaAtual = {
                        titulo: titulo,
                        premios: premiosIniciais,
                        valorCota: (row[2] || "R$ 10,00").trim(),
                        dataSorteio: (row[3] || "").trim(),
                        destino: (row[4] || "").trim(),
                        linkExterno: (row[5] || "#").trim(),
                        imagens: novasImagens,
                        status: (row[7] || "Ativa").trim()
                    };
                    rifasAgrupadas.push(rifaAtual);
                } else if (rifaAtual) {
                    if (premioCelula !== "") {
                        premioCelula.split("|").forEach(p => {
                            if (p.trim() !== "") rifaAtual.premios.push(p.trim());
                        });
                    }
                    if (novasImagens.length > 0) {
                        rifaAtual.imagens.push(...novasImagens);
                    }
                }
            });

            rifasAgrupadas.forEach(r => {
                if (!r.imagens || r.imagens.length === 0) {
                    r.imagens = ["https://placehold.co/600x400/e76f51/ffffff?text=Rifa+Solidaria"];
                }
            });

            if (rifasAgrupadas.length > 0) {
                dadosAtuais.rifas = rifasAgrupadas;
            }
        }

        if (csvParceiros.length >= 2) {
            dadosAtuais.parceiros = csvParceiros.slice(1).map(row => ({
                nome: row[0] || "Empresa Parceira",
                categoria: row[1] || "Apoiador Oficial",
                logo: formatarUrlImagem(row[2]) || "https://placehold.co/200x80/6b4c9a/ffffff?text=Parceiro",
                link: row[3] || "#"
            }));
        }
    } catch (erro) {
        console.warn("Usando dados locais de demonstração.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    inicializarMenuMobile();
    await carregarPlanilhaGoogle();

    listaGatosFiltrada = [...dadosAtuais.gatos];
    preencherDadosGerais(dadosAtuais.geral);
    renderizarParceiros();
    renderizarRifas();
    aplicarFiltros();
});

function preencherDadosGerais(geral) {
    const elMes = document.getElementById("mes-referencia");
    if (elMes) elMes.textContent = geral.mesReferencia;

    const elArrec = document.getElementById("valor-arrecadado");
    if (elArrec) elArrec.textContent = geral.arrecadado;

    const elRacao = document.getElementById("gasto-racao");
    if (elRacao) elRacao.textContent = geral.racao;

    const elVet = document.getElementById("gasto-vet");
    if (elVet) elVet.textContent = geral.veterinario;

    const elOutros = document.getElementById("gasto-outros");
    if (elOutros) elOutros.textContent = geral.outros;

    const elPix = document.getElementById("chave-pix");
    if (elPix) elPix.textContent = geral.chavePix;

    const elWp = document.getElementById("link-whatsapp-parceiro");
    if (elWp) {
        elWp.href = `https://wa.me/${geral.whatsapp}?text=Olá! Gostaria de cadastrar minha empresa como parceira do Lar dos Gatinhos.`;
    }
}

function renderizarParceiros() {
    const containerHome = document.getElementById("grid-parceiros-home");
    const containerPagina = document.getElementById("grid-parceiros-pagina");
    const htmlParceiros = dadosAtuais.parceiros.map(p => `
        <a href="${p.link !== '#' ? p.link : 'javascript:void(0)'}" ${p.link !== '#' ? 'target="_blank" rel="noopener"' : ''} class="card-parceiro">
            <img src="${p.logo}" alt="${p.nome}" loading="lazy">
            <span>${p.nome}</span>
            <small>${p.categoria}</small>
        </a>
    `).join("");

    if (containerHome) containerHome.innerHTML = htmlParceiros;
    if (containerPagina) containerPagina.innerHTML = htmlParceiros;
}

function criarCardGatoHTML(gato) {
    const msgZap = encodeURIComponent(`Olá! Vi o(a) gatinho(a) *${gato.nome}* (${gato.idade} - ${gato.sexo}) no site do Lar dos Gatinhos e gostaria de saber mais sobre a adoção!`);
    const linkZap = `https://wa.me/${dadosAtuais.geral.whatsapp}?text=${msgZap}`;

    return `
        <article class="card-gato">
            <div class="card-gato-img">
                <img src="${gato.foto}" alt="${gato.nome}" loading="lazy">
                <span class="badge-categoria">${gato.idade}</span>
                <span class="badge-sexo">${gato.sexo}</span>
            </div>
            <div class="card-gato-info">
                <h3>${gato.nome}</h3>
                <div class="tags-saude">
                    <span class="tag">${gato.saude}</span>
                </div>
                <p>${gato.bio}</p>
                <a href="${linkZap}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%;">
                    Quero Adotar ${gato.nome}
                </a>
            </div>
        </article>
    `;
}

function aplicarFiltros() {
    const container = document.getElementById("grid-adocao-completa");
    if (!container) return;

    const termo = (document.getElementById("filtro-busca")?.value || "").toLowerCase();
    const idade = document.getElementById("filtro-idade")?.value || "Todos";
    const sexo = document.getElementById("filtro-sexo")?.value || "Todos";
    const especial = document.getElementById("filtro-especial")?.value || "Todos";

    listaGatosFiltrada = dadosAtuais.gatos.filter(gato => {
        const bateNome = gato.nome.toLowerCase().includes(termo) || gato.bio.toLowerCase().includes(termo);
        const bateIdade = idade === "Todos" || gato.idade === idade;
        const bateSexo = sexo === "Todos" || gato.sexo === sexo;
        const batePerfil = especial === "Todos" || gato.perfil === especial;
        return bateNome && bateIdade && bateSexo && batePerfil;
    });

    paginaAtual = 1;
    renderizarPaginaAdocao();
}

function renderizarPaginaAdocao() {
    const container = document.getElementById("grid-adocao-completa");
    const contador = document.getElementById("contador-gatos");
    const paginacao = document.getElementById("controles-paginacao");
    if (!container) return;

    const total = listaGatosFiltrada.length;
    if (contador) contador.textContent = `Exibindo ${total} gatinho(s) encontrado(s)`;

    if (total === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum gatinho encontrado com esses filtros.</p>`;
        if (paginacao) paginacao.innerHTML = "";
        return;
    }

    const totalPaginas = Math.ceil(total / GATOS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * GATOS_POR_PAGINA;
    const fim = inicio + GATOS_POR_PAGINA;
    const fatia = listaGatosFiltrada.slice(inicio, fim);

    container.innerHTML = fatia.map(criarCardGatoHTML).join("");

    if (paginacao) {
        if (totalPaginas <= 1) {
            paginacao.innerHTML = "";
        } else {
            paginacao.innerHTML = `
                <button class="btn btn-roxo" ${paginaAtual === 1 ? "disabled style='opacity:0.5'" : ""} onclick="mudarPagina(-1)">← Anterior</button>
                <span>Página <strong>${paginaAtual}</strong> de <strong>${totalPaginas}</strong></span>
                <button class="btn btn-roxo" ${paginaAtual === totalPaginas ? "disabled style='opacity:0.5'" : ""} onclick="mudarPagina(1)">Próxima →</button>
            `;
        }
    }
}

function mudarPagina(direcao) {
    paginaAtual += direcao;
    renderizarPaginaAdocao();
    window.scrollTo({ top: 180, behavior: "smooth" });
}

function criarCardRifaHTML(rifa, index) {
    const ativa = rifa.status.toLowerCase() === "ativa";
    const imgs = rifa.imagens && rifa.imagens.length > 0 ? rifa.imagens : ["https://placehold.co/600x400/e76f51/ffffff?text=Rifa+Solidaria"];
    indicesCarrosselRifas[index] = 0;

    const temMultiplasFotos = imgs.length > 1;
    const listaPremios = Array.isArray(rifa.premios) && rifa.premios.length > 0
        ? rifa.premios
        : (rifa.premio ? rifa.premio.split("|").map(p => p.trim()).filter(Boolean) : []);

    return `
        <article class="card-rifa ${ativa ? "" : "encerrada"}">
            <div style="position: relative; width: 100%; background: #111; overflow: hidden;">
                <img id="rifa-img-${index}" src="${imgs[0]}" alt="${rifa.titulo}" loading="lazy"
                    style="width: 100%; height: auto; max-height: 440px; object-fit: contain; display: block;">

                ${temMultiplasFotos ? `
                    <button type="button" onclick="mudarSlideRifa(${index}, -1)" aria-label="Anterior"
                        style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,0.92); color: #111; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 2;">
                        &lt;
                    </button>
                    <button type="button" onclick="mudarSlideRifa(${index}, 1)" aria-label="Próxima"
                        style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,0.92); color: #111; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 2;">
                        &gt;
                    </button>
                    <span id="rifa-badge-${index}"
                        style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.78); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                        1/${imgs.length}
                    </span>
                ` : ""}
            </div>

            <div class="card-rifa-corpo">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <span class="status-rifa ${ativa ? "status-ativa" : "status-encerrada"}" style="margin: 0;">
                        ${ativa ? "● Rifa Ativa" : "Rifa Encerrada"}
                    </span>
                    <span style="background: #198754; color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: bold;">
                        ${rifa.valorCota} / cota
                    </span>
                </div>

                <h3 style="color: var(--cor-primaria); margin-bottom: 8px;">${rifa.titulo}</h3>

                ${listaPremios.length > 0 ? `
                    <div style="margin: 12px 0;">
                        <strong style="display: block; margin-bottom: 8px; color: var(--cor-primaria);">🎁 Prêmios:</strong>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${listaPremios.map(item => `
                                <div style="padding: 8px 12px; border-radius: 8px; background: #faf8fc; border: 1px solid #ede7f6; font-size: 0.9rem;">
                                    ${item}
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="detalhes-rifa">
                    <p><strong>Valor da Cota:</strong> ${rifa.valorCota}</p>
                    ${rifa.dataSorteio ? `<p><strong>Sorteio:</strong> ${rifa.dataSorteio}</p>` : ""}
                    ${rifa.destino ? `<p style="margin-top: 6px; color: var(--cor-texto-suave);">${rifa.destino}</p>` : ""}
                </div>
                ${ativa
                    ? `<a href="${rifa.linkExterno}" target="_blank" rel="noopener" class="btn btn-primario" style="width: 100%;">
                        Comprar Cotas no Site Oficial ↗
                       </a>`
                    : `<button class="btn" disabled style="width: 100%; background: #ddd; color: #666; cursor: not-allowed;">
                        Sorteio Encerrado
                       </button>`
                }
            </div>
        </article>
    `;
}

function mudarSlideRifa(indexRifa, direcao) {
    const rifa = window._rifasRenderizadas?.[indexRifa];
    if (!rifa || !rifa.imagens || rifa.imagens.length <= 1) return;

    const total = rifa.imagens.length;
    indicesCarrosselRifas[indexRifa] = (indicesCarrosselRifas[indexRifa] + direcao + total) % total;

    const imgEl = document.getElementById(`rifa-img-${indexRifa}`);
    const badgeEl = document.getElementById(`rifa-badge-${indexRifa}`);

    if (imgEl) imgEl.src = rifa.imagens[indicesCarrosselRifas[indexRifa]];
    if (badgeEl) badgeEl.textContent = `${indicesCarrosselRifas[indexRifa] + 1}/${total}`;
}

function renderizarRifas() {
    const containerAba = document.getElementById("grid-todas-rifas");
    if (containerAba) {
        const rifasOrdenadas = [...dadosAtuais.rifas].sort((a, b) => (a.status.toLowerCase() === "ativa" ? -1 : 1));
        window._rifasRenderizadas = rifasOrdenadas;
        containerAba.innerHTML = rifasOrdenadas.map((rifa, idx) => criarCardRifaHTML(rifa, idx)).join("");
    }
}

function copiarPix() {
    const chave = document.getElementById("chave-pix")?.textContent || dadosAtuais.geral.chavePix;
    navigator.clipboard.writeText(chave).then(() => {
        const msg = document.getElementById("msg-pix-copiado");
        if (msg) {
            msg.style.display = "block";
            setTimeout(() => { msg.style.display = "none"; }, 4000);
        }
    });
}
