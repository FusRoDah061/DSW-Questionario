var app = {

    perguntas: [],
    perguntasSorteadas: [],
    perguntaAtual: 1,

    getListaPerguntas: function (successCallback, failCallback) {
        $.ajax({
            url: 'assets/perguntas.json',
            method: 'GET',
            dataType: 'json',
            success: successCallback.bind(this),
            fail: failCallback.bind(this),
            error: failCallback.bind(this)
        });
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

        $('#js-perguntas').html(html);

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
        let pergunta = $('#js-perguntas').children().eq(numero - 1);

        for (let elem of $('.pergunta--ativa, .pergunta--esq, .pergunta--dir')) {
            $(elem).removeClass('pergunta--ativa');
            $(elem).removeClass('pergunta--esq');
            $(elem).removeClass('pergunta--dir');
        }

        pergunta.addClass('pergunta--ativa');

        if (numero > 1) {
            let perguntaAnterior = $('#js-perguntas').children().eq(numero - 2);
            perguntaAnterior.addClass('pergunta--esq');

            perguntaAnterior.click(this, function (event) {
                if ($(this).hasClass('pergunta--esq'))
                    event.data.perguntaAnterior();
            });
        }

        if (numero < 10) {
            let proximaPergunta = $('#js-perguntas').children().eq(numero);
            proximaPergunta.addClass('pergunta--dir');

            proximaPergunta.click(this, function (event) {
                if ($(this).hasClass('pergunta--dir'))
                    event.data.proximaPergunta();
            });

            $('#js-proxima-pergunta').html('Próxima');
        }
        else if(numero >= 10) {
            $('#js-proxima-pergunta').html('Finalizar');
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
            $('#js-proxima-pergunta').html('Finalizar');
        else
            $('#js-proxima-pergunta').html('Próxima');
    },

    perguntaAnterior: function () {
        if (this.perguntaAtual > 1) {
            this.perguntaAtual--;
            this.definePerguntaAtual(this.perguntaAtual);
        }

        $('#js-proxima-pergunta').html('Próxima');
    },

    atualizaIndicador: function (numeroAtual) {
        for (let i = 0; i < this.perguntasSorteadas.length; i++) {
            let e = $('#js-indicador-perguntas').children().eq(i);
            e.removeClass('indicador--atual');
            e.removeClass('indicador--marcado');

            if (this.perguntasSorteadas[i].respondida) {
                e.addClass('indicador--marcado');
            }

            if (numeroAtual - 1 == i) {
                e.addClass('indicador--atual');
            }
        }

    },

    marcaPerguntaRespondida: function (id, resposta) {
        let pergunta = this.perguntasSorteadas.find((i) => i.id == id);

        if (pergunta) {
            pergunta.respondida = true;
            pergunta.resposta = resposta;

            $(`#pergunta-${pergunta.id}`).addClass('pergunta--respondida');
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
                        if (pergunta.resposta == pergunta['alternativa-correta'])
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
                    if (pergunta.resposta == pergunta['alternativa-correta'])
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
        function (perguntas) {
            app.perguntas = perguntas;
            app.perguntasSorteadas = app.perguntas.amostra(10);

            app.apresentaPerguntas(app.perguntasSorteadas);
            app.definePerguntaAtual(app.perguntaAtual);
        },
        function (jqXHR, textStatus, errorThrown) {
            //TODO: exibir mensagem de erro.
        }
    );
}

function inicializarEventos() {
    $('#js-proxima-pergunta').click(function () {
        app.proximaPergunta();
    });

    $('#js-anterior-pergunta').click(function () {
        app.perguntaAnterior();
    });

    $('.indicador').click(function () {
        app.definePerguntaAtual(parseInt(this.innerHTML));
    });
}
