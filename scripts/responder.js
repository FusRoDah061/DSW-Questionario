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

        let letras = ['a', 'b', 'c', 'd'];
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
                <li class="pergunta" data-num-pergunta="${i + 1}">
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

        this.atualizaIndicador(this.perguntaAtual);
    },

    perguntaAnterior: function () {
        if (this.perguntaAtual > 1) {
            this.perguntaAtual--;
            this.definePerguntaAtual(this.perguntaAtual);
        }

        $('#js-proxima-pergunta').html('Próxima');

        this.atualizaIndicador(this.perguntaAtual);
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
        }
    },

    salvarTentativa: function () {
        let somadorNota = function (acumulador, pergunta) {
            if (pergunta.resposta == pergunta['alternativa-correta'])
                acumulador += 1;

            return acumulador;
        };

        let tentativas = JSON.parse(storage.get('tentativas'));

        if (!tentativas)
            tentativas = [];

        tentativas.push({
            id: (tentativas[tentativas.length - 1]) ? tentativas[tentativas.length - 1].id + 1 : tentativas.length,
            data: new Date().toLocaleString('en-GB').split(',').join(''),
            perguntas: this.perguntasSorteadas,
            nota: this.perguntasSorteadas.reduce(somadorNota, 0)
        });

        storage.set('tentativas', JSON.stringify(tentativas));

        location.href = 'index.html';
    }
};

$(document).ready(function () {

    verificaTentativas();
    //TODO: verificar se não foi carregada uma tentativa
    obterPerguntas();
    inicializarEventos();

});

function verificaTentativas() {
    let tentativas = storage.get('tentativas');

    if (tentativas)
        if (JSON.parse(tentativas).length >= 3)
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

            $('.form-check-input').change(function () {
                if (this.checked) {
                    let perguntaId = $(this).attr('data-pergunta');
                    let resposta = $(this).val();
                    app.marcaPerguntaRespondida(parseInt(perguntaId), parseInt(resposta));
                }
            });

            $('.pergunta').click(function () {
                if ($('#js-toggle-quadro').prop("checked")) {
                    let pergunta = $(this).attr('data-num-pergunta');
                    $('#js-toggle-quadro').prop("checked", false);
                    app.definePerguntaAtual(parseInt(pergunta));
                }
            });
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
