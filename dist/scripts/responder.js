Array.prototype.amostra = function (qtd) {
    let amostra = [];

    if (this.length < qtd) throw new RangeError("O tamanho do vetor é menor do que o tamanho da amostra");

    while (amostra.length < qtd) {
        let indice = Math.round(Math.random() * (this.length - 1));

        if (!amostra.includes(this[indice]))
            amostra.push(this[indice]);
    }

    return amostra;
}

String.prototype.encodeHtml = function () {
    return this.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
}

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
                <li class="pergunta">
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
        }
    },

    proximaPergunta: function () {

        if (this.perguntaAtual == 10) {
            //TODO: finalizar questionário
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

    marcaPerguntaRespondida: function (id) {
        let pergunta = this.perguntasSorteadas.find((i) => i.id == id);

        if (pergunta)
            pergunta.respondida = true;
    }
};

$(document).ready(function () {

    app.getListaPerguntas(
        function (perguntas) {
            app.perguntas = perguntas;
            app.perguntasSorteadas = app.perguntas.amostra(10);

            app.apresentaPerguntas(app.perguntasSorteadas);
            app.definePerguntaAtual(app.perguntaAtual);
            app.atualizaIndicador(app.perguntaAtual);

            $('.form-check-input').click(function () {
                let perguntaId = $(this).attr('data-pergunta');
                app.marcaPerguntaRespondida(parseInt(perguntaId));
            });
        },
        function (jqXHR, textStatus, errorThrown) {
            //TODO: exibir mensagem de erro.
        }
    );

    $('#js-proxima-pergunta').click(function () {
        app.proximaPergunta();
    });

    $('#js-anterior-pergunta').click(function () {
        app.perguntaAnterior();
    });

    $('.indicador').click(function () {
        app.definePerguntaAtual(parseInt(this.innerHTML));
        app.atualizaIndicador(parseInt(this.innerHTML));
    });

});
