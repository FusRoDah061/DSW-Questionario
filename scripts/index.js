var app = {

    tentativas: [],

    carregarTentativas: function () {
        let tentativas = storage.get('tentativas');
        this.tentativas = JSON.parse(tentativas);

        if(!this.tentativas)
            this.tentativas = [];

        if(this.tentativas.length > 0){

            $('#js-tentativas-passadas').html('');
            for(let i = 0; i < this.tentativas.length; i++) {
                console.log(this.tentativas[i]);

                $('#js-tentativas-passadas').append(`
                <li>
                    <button class="lista-btn-rm" data-tentativa="${i}"><i class="icon ion-md-trash"></i></button>
                    <div>
                        <a href="responder.html?t=${this.tentativas[i].id}">Tentativa #${this.tentativas[i].id + 1}</a>
                        <p class="nota">Nota: ${this.tentativas[i].nota}</p>
                        <p class="data">${this.tentativas[i].data}</p>
                    </div>
                </li>
                `);
            }

            $('.lista-btn-rm').click(this, function (event){
                let indiceTentativa = parseInt($(this).attr('data-tentativa'));
                let caller = event.data;

                Swal.fire({
                    title: 'Remover tentativa?',
                    text: 'tem certeza de que deseja remover a tentativa? Essa ação não pode ser revertida.',
                    type: 'error',
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
                        caller.tentativas.splice(indiceTentativa, 1);
                        storage.set('tentativas', JSON.stringify(caller.tentativas));
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

        console.log(notaFinal);
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
        .then(function () {

        });

    },

    limparTentativas: function (){
        
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
        app.avaliar('maior');
    });

    $('#js-avaliar-media-notas').click(function () {
        app.avaliar('media');
    });

    $('#js-avaliar-ultima-nota').click(function () {
        app.avaliar('ultima');
    });
}
