var app = {

    tentativas: [],

    carregarTentativas: function () {
        this.tentativas = window.tentativas.list();

        if(this.tentativas.length > 0){

            $('#js-tentativas-passadas').html('');
            for(let i = 0; i < this.tentativas.length; i++) {
                $('#js-tentativas-passadas').append(`
                <li>
                    <button class="lista-btn-rm" data-tentativa="${this.tentativas[i].id}"><i class="icon ion-md-trash"></i></button>
                    <div>
                        <p>Tentativa #${this.tentativas[i].id}</p>
                        <p class="nota">Nota: ${this.tentativas[i].nota}</p>
                        <p class="data">${this.tentativas[i].data}</p>
                    </div>
                </li>
                `);
            }

            $('.lista-btn-rm').click(this, function (event){
                let idTentativa = parseInt($(this).attr('data-tentativa'));
                let caller = event.data;

                Swal.fire({
                    title: 'Remover tentativa?',
                    text: 'Tem certeza de que deseja remover a tentativa? Essa ação não pode ser revertida.',
                    type: 'question',
                    customClass: {
                        confirmButton: 'btn btn-block btn-success',
                        cancelButton: 'btn btn-block btn-danger'
                    },
                    buttonsStyling: false,
                    showCancelButton: true,
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Não, cancelar',
                    reverseButtons: true
                })
                .then((result) => {
                    if (result.value) {
                        window.tentativas.remove(idTentativa);
                        caller.carregarTentativas();
                    }
                })
            });

            $('#js-tentativas').show(100);
            $('#js-avaliacao').show(100);
        }
        else{
            $('#js-tentativas').hide(100);
            $('#js-avaliacao').hide(100);
        }
    },

    avaliar: function (metodo) {

        if(!this.tentativas) return;

        let notaFinal = 0;

        switch(metodo) {
            case 'maior':
                notaFinal = this.tentativas[0].nota;

                this.tentativas.forEach(element => {
                    if(element.nota > notaFinal)
                        notaFinal = element.nota;
                });
            break;

            case 'media':
                notaFinal = this.tentativas.reduce((acc, item) => {
                    return acc + item.nota;
                }, 0) / this.tentativas.length;
            break;

            case 'ultima':
                notaFinal = this.tentativas[this.tentativas.length - 1].nota;
            break;
        }

        Swal.fire({
            title: 'Resultado final',
            html: `
                <p>A sua nota final é:</p>

                <p class="nota">${notaFinal.toFixed(2)}</p>
            `,
            type: 'success',
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        })
        .then(this.limparTentativas.bind(this));

    },

    limparTentativas: function (){
        this.tentativas = [];
        window.tentativas.clear();

        $('#js-tentativas').hide(100);
        $('#js-avaliacao').hide(100);
    }
}

$(document).ready(function () {
    app.carregarTentativas();

    inicializaEventos ();
});

function inicializaEventos (){
    $('#js-btn-inicia').click(app, function (event) {
        if(event.data.tentativas.length >= 3) {
            Swal.fire({
                title: 'Limite de tentativas alcançado',
                text: 'Você atigiu o limite máximo de 3 tentativas. Finalize o questionário para liberar esse limite.',
                type: 'error',
                customClass: {
                    confirmButton: 'btn btn-primary'
                },
                buttonsStyling: false
            })
        }
        else{
            location.href = "responder.html";
        }
    });

    $('#js-avaliar-maior-nota').click(function () {
        avaliar('maior');
    });

    $('#js-avaliar-media-notas').click(function () {
        avaliar('media');
    });

    $('#js-avaliar-ultima-nota').click(function () {
        avaliar('ultima');
    });
}

function avaliar(metodo) {
    Swal.fire({
        title: 'Finalizar questionário?',
        text: 'Finalizar e avaliar questionário? Suas tentativas serão apagadas após a avaliação.',
        type: 'question',
        customClass: {
            confirmButton: 'btn btn-block btn-success',
            cancelButton: 'btn btn-block btn-danger'
        },
        buttonsStyling: false,
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não, cancelar',
        reverseButtons: true
    })
    .then((result) => {
        if (result.value) {
            app.avaliar(metodo);
        }
    })
}
