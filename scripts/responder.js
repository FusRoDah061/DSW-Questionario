var app = {

    btnProximaPergunta: document.getElementById('js-proxima-pergunta'),
    btnPerguntaAnterior: document.getElementById('js-anterior-pergunta'),
    btnExibeQuadro: document.getElementById('js-toggle-quadro'),
    indicadoresPergunta: Array.from(document.getElementsByClassName('indicador')),
    listaPerguntas: document.getElementById('js-perguntas'),

    perguntas: [],
    perguntasSorteadas: [],
    perguntaAtual: 1,

    getListaPerguntas: function () {
        $.ajax({
            url: 'assets/perguntas.xml',
            method: 'GET',
            dataType: 'xml',
            success: this.OnAjaxSuccess.bind(this),
            fail: this.OnAjaxFail.bind(this),
            error: this.OnAjaxFail.bind(this)
        });
    },

    mapeiaPerguntas: function(perguntasXml) {
        let perguntas = perguntasXml.getElementsByTagName('pergunta');
        let perguntasJson = [];

        for(let pergunta of perguntas) {
            perguntasJson.push({
                id: parseInt(pergunta.getAttribute('id')),
                enunciado: pergunta.getElementsByTagName('enunciado')[0].textContent,
                alternativaCorreta: pergunta.getAttribute('alternativa-correta'),
                alternativas: Array.from(pergunta.getElementsByTagName('alternativa')).map(item => {
                    return item.textContent
                })
            });
        }

        this.perguntas = perguntasJson;
    },

    apresentaPerguntas: function (perguntas) {

        let letras = ['a', 'b', 'c', 'd', 'e'];
        let html = '';

        for (let i = 0; i < perguntas.length; i++) {
            let alternativas = '';

            for (let j = 0; j < perguntas[i].alternativas.length; j++) {

                alternativas += `
                    <li class="checkbox">
                        <input class="alternativa" type="radio" name="alternativas-${i}" data-pergunta="${perguntas[i].id}" id="opcao-${i}-${j}" value="${j}">
                        <label for="opcao-${i}-${j}">
                            <span>${letras[j].toUpperCase()}.</span> ${perguntas[i].alternativas[j].encodeHtml().trim()}
                        </label>
                    </li>
                `;
            }

            html += `
                <li id="pergunta-${perguntas[i].id}" class="pergunta" data-num-pergunta="${i + 1}">
                    <p class="enunciado">
                        <span>${i + 1}.</span> ${perguntas[i].enunciado.encodeHtml().trim()}
                    </p>

                    <ul class="alternativas">
                        ${alternativas}
                    </ul>
                </li>
            `;
        }

        this.listaPerguntas.innerHTML = html;

        this.listaPerguntas.addEventListener('click', this.OnPerguntaClick.bind(this));

        Array.from(document.getElementsByClassName('alternativa')).forEach((item) => {
            item.addEventListener('change', this.OnAlternativaCheckedChange.bind(this));
        });

        this.definePerguntaAtual(1);
    },

    definePerguntaAtual: function (numero) {
        let pergunta = this.listaPerguntas.children[numero - 1];
        let classesToRemove = ['pergunta--ativa', 'pergunta-esq', 'pergunta-dir', 'pergunta-dir--esconde', 'pergunta-esq--esconde'];

        let proxima = pergunta.nextElementSibling;
        let anterior = pergunta.previousElementSibling;

        pergunta.classList.remove(...classesToRemove);
        pergunta.classList.add('pergunta--ativa');

        if(anterior){
            anterior.classList.remove(...classesToRemove);
            anterior.classList.add('pergunta-esq');

            let elementosAnteriores = anterior.previousSiblings();

            elementosAnteriores.forEach(function(elemento) {
                if(elemento) {
                    elemento.classList.remove(...classesToRemove);
                    elemento.classList.add('pergunta-esq--esconde');
                }
            });
        }

        if(proxima) {
            proxima.classList.remove(...classesToRemove);
            proxima.classList.add('pergunta-dir');

            let elementosProximos = proxima.nextSiblings();

            elementosProximos.forEach(function(elemento) {
                if(elemento) {
                    elemento.classList.remove(...classesToRemove);
                    elemento.classList.add('pergunta-dir--esconde');
                }
            });
        }
        if (numero < 10) {
            this.btnProximaPergunta.innerHTML = 'Próxima';
        } else if (numero >= 10) {
            this.btnProximaPergunta.innerHTML = 'Finalizar';
        }

        this.perguntaAtual = numero;
        this.atualizaIndicador(this.perguntaAtual);
    },

    proximaPergunta: function () {

        if (this.perguntaAtual == 10) {
            this.salvarTentativa();
        } else {
            this.perguntaAtual++;
            this.definePerguntaAtual(this.perguntaAtual);
        }

        if (app.perguntaAtual > 9)
            this.btnProximaPergunta.innerHTML = 'Finalizar';
        else
            this.btnProximaPergunta.innerHTML = 'Próxima';
    },

    perguntaAnterior: function () {
        if (this.perguntaAtual > 1) {
            this.perguntaAtual--;
            this.definePerguntaAtual(this.perguntaAtual);
        }

        this.btnProximaPergunta.innerHTML = 'Próxima';
    },

    atualizaIndicador: function (numeroAtual) {
        for (let i = 0; i < this.perguntasSorteadas.length; i++) {
            let e = document.getElementById('js-indicador-perguntas').children[i];

            e.classList.remove('indicador--atual');
            e.classList.remove('indicador--marcado');

            if (this.perguntasSorteadas[i].respondida) {
                e.classList.add('indicador--marcado');
            }

            if (numeroAtual - 1 == i) {
                e.classList.add('indicador--atual');
            }
        }

    },

    marcaPerguntaRespondida: function (id, resposta) {
        let pergunta = this.perguntasSorteadas.find((i) => i.id == id);

        if (pergunta) {
            pergunta.respondida = true;
            pergunta.resposta = resposta;

            document.getElementById(`pergunta-${pergunta.id}`).classList.add('pergunta--respondida');
        }
    },

    salvarTentativa: function () {

        Swal.fire({
            title: 'Resultado do questionário',
            html: `
            <p>Perguntas em <span style="color: #2f9e41">VERDE</span> estão corretas.</p>
            <p>Perguntas em <span style="color: #cd191e">VERMELHO</span> estão incorretas</p>

            <ul class="resultado">
                ${this.perguntasSorteadas.map(function(pergunta, i) {
                    if (pergunta.resposta == pergunta.alternativaCorreta)
                        return `<li class="resultado--certa">${i + 1}</li>`;
                    else
                        return `<li>${i + 1}</li>`;
                }).join(' ')}
            </ul>
        `,
            type: 'info',
            customClass: {
                confirmButton: 'button display-block btn-green',
                cancelButton: 'button display-block btn-red'
            },
            buttonsStyling: false,
            showCancelButton: true,
            confirmButtonText: 'Concluir',
            cancelButtonText: 'Descartar tentativa'
        })
        .then((result) => {
            if (result.value) {
                let somadorNota = function (acumulador, pergunta) {
                    if (pergunta.resposta == pergunta.alternativaCorreta)
                        acumulador += 1;

                    return acumulador;
                };

                window.tentativas.push({
                    data: new Date().toLocaleString('en-GB').split(',').join(''),
                    perguntas: this.perguntasSorteadas,
                    nota: this.perguntasSorteadas.reduce(somadorNota, 0)
                });
            }

            location.href = 'index.html';
        });
    },

    OnAjaxSuccess: function (perguntasXml) {
        this.mapeiaPerguntas(perguntasXml);
        this.perguntasSorteadas = this.perguntas.randomSample(10);

        this.apresentaPerguntas(this.perguntasSorteadas);
        this.definePerguntaAtual(this.perguntaAtual);
    },

    OnAjaxFail: function (jqXHR, textStatus, errorThrown) {
        Swal.fire({
            title: 'Ops!',
            html: `
                <p class="erro">
                    Algo deu errado ao buscar as perguntas, e...
                    <strong>sem perguntas, sem questionário &#128553;</strong>
                </p>

                <div>
                    <div class="erro-description">
                        ${errorThrown}: ${jqXHR.responseText}
                    </div>
                </div>
            `,
            type: 'error',
            customClass: {
                confirmButton: 'button btn-blue'
            },
            buttonsStyling: false
        })
        .then(function () {
            location.href = 'index.html';
        });
    },

    OnPerguntaClick: function(event) {
        let target = event.target;

        if(!target) return;

        if (!target.classList.contains('pergunta') &&
            !target.classList.contains('perguntas')) {
            target = target.getParentByClass('pergunta');
        }

        if(target.classList.contains('pergunta')){

            if (target.classList.contains('pergunta-esq') &&
                !target.classList.contains('pergunta-esq--esconde')) {
                this.perguntaAnterior();
            }
            else if (target.classList.contains('pergunta-dir') &&
                    !target.classList.contains('pergunta-dir--esconde')) {
                this.proximaPergunta();
            }
            else if (this.btnExibeQuadro.checked){
                let pergunta = target.dataset.numPergunta;
                this.btnExibeQuadro.checked = false;
                this.definePerguntaAtual(parseInt(pergunta));
            }
        }
    },

    OnAlternativaCheckedChange: function(event) {
        let alternativa = event.target;

        if (alternativa.checked) {
            let perguntaId = alternativa.dataset.pergunta;
            let resposta = alternativa.value;
            this.marcaPerguntaRespondida(parseInt(perguntaId), parseInt(resposta));
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {

    if(verificaTentativas()){
        app.getListaPerguntas();
        inicializarEventos();
    }

});

function verificaTentativas() {
    let tentativas = window.tentativas.list();

    if (tentativas.length >= 3)
        Swal.fire({
            title: 'Limite de tentativas alcançado',
            text: 'Você atigiu o limite máximo de 3 tentativas. Finalize o questionário na página inicial para liberar esse limite.',
            type: 'error',
            customClass: {
                confirmButton: 'button display-block btn-blue'
            },
            buttonsStyling: false
        })
        .then(function () {
            location.href = 'index.html';
        });

    return tentativas.length < 3;
}

function inicializarEventos() {
    app.btnProximaPergunta.addEventListener('click', () => {
        app.proximaPergunta();
    });

    app.btnPerguntaAnterior.addEventListener('click', () => {
        app.perguntaAnterior();
    });

    app.indicadoresPergunta.forEach(function(element) {
        element.addEventListener('click', function() {
            app.definePerguntaAtual(parseInt(this.innerHTML));
        });
    });
}
