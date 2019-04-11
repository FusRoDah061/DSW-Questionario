var app = {

    tentativas: [],

    carregarTentativas: function () {
        let tentativas = storage.get('tentativas');

        if(tentativas){
            this.tentativas = JSON.parse(tentativas);

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
        }
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
}
