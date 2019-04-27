var app = {

    btnProximaPergunta: document.getElementById('js-proxima-pergunta'),
    btnPerguntaAnterior: document.getElementById('js-anterior-pergunta'),
    indicadoresPergunta: Array.from(document.getElementsByClassName('indicador')),
    listaPerguntas: document.getElementById('js-perguntas'),

    perguntas: [],
    perguntasSorteadas: [],
    perguntaAtual: 1,

    getListaPerguntas: function (successCallback, failCallback) {
        $.ajax({
            url: 'assets/perguntas.xml',
            method: 'GET',
            dataType: 'xml',
            success: successCallback.bind(this),
            fail: failCallback.bind(this),
            error: failCallback.bind(this)
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
                    <li class="form-check">
                        <input class="form-check-input" type="radio" name="alternativas-${i}" data-pergunta="${perguntas[i].id}" id="opcao-${i}-${j}" value="${j}">
                        <label class="form-check-label" for="opcao-${i}-${j}">
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

        $('.form-check-input').change(this, function (ev) {
            if (this.checked) {
                let perguntaId = $(this).attr('data-pergunta');
                let resposta = $(this).val();
                ev.data.marcaPerguntaRespondida(parseInt(perguntaId), parseInt(resposta));
            }
        });

        $('.pergunta').click(this, function (ev) {
            if ($('#js-toggle-quadro').prop("checked")) {
                let pergunta = $(this).attr('data-num-pergunta');
                $('#js-toggle-quadro').prop("checked", false);
                ev.data.definePerguntaAtual(parseInt(pergunta));
            }
        });

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

        if (numero > 1) {
            anterior.click(this, function (event) {
                if (this.classList.contains('pergunta-esq'))
                    event.data.perguntaAnterior();
            });
        }

        if (numero < 10) {
            proxima.click(this, function (event) {
                if (this.classList.contains('pergunta-dir'))
                    event.data.proximaPergunta();
            });

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
                confirmButton: 'btn btn-block btn-success',
                cancelButton: 'btn btn-block btn-danger'
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
};

$(document).ready(function () {

    verificaTentativas();
    obterPerguntas();
    inicializarEventos();

});

function verificaTentativas() {
    let tentativas = window.tentativas.list();

    if (tentativas.length >= 3)
        Swal.fire({
            title: 'Limite de tentativas alcançado',
            text: 'Você atigiu o limite máximo de 3 tentativas. Finalize o questionário na página inicial para liberar esse limite.',
            type: 'error',
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        })
        .then(function () {
            location.href = 'index.html';
        });
}

function obterPerguntas() {
    app.getListaPerguntas(
        function (perguntasXml) {
            app.mapeiaPerguntas(perguntasXml);
            app.perguntasSorteadas = app.perguntas.amostra(10);

            app.apresentaPerguntas(app.perguntasSorteadas);
            app.definePerguntaAtual(app.perguntaAtual);
        },
        function (jqXHR, textStatus, errorThrown) {
            Swal.fire({
                title: 'Ops!',
                html: `
                    <p class="erro">
                        Algo deu errado ao buscar as perguntas, e...
                        <strong>sem perguntas, sem questionário &#128553;</strong>
                    </p>

                    <button class="btn btn-danger btn-block" type="button" data-toggle="collapse" data-target="#erro-detalhes" aria-expanded="false" aria-controls="erro-detalhes">
                        Mostrar detalhes
                    </button>

                    <div class="collapse" id="erro-detalhes">
                        <div class="card card-body">
                            ${errorThrown}: ${jqXHR.responseText}
                        </div>
                    </div>
                `,
                type: 'error',
                customClass: {
                    confirmButton: 'btn btn-primary'
                },
                buttonsStyling: false
            })
            .then(function () {
                location.href = 'index.html';
            });
        }
    );
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
