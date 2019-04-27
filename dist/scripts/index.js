var app = {

    btnAvaliarMaiorNota: document.getElementById('js-avaliar-maior-nota'),
    btnAvaliarUltimaNota: document.getElementById('js-avaliar-ultima-nota'),
    btnAvaliarMediaNotas: document.getElementById('js-avaliar-media-notas'),
    containerTentativas: document.getElementById('js-tentativas'),
    containerAvaliacao: document.getElementById('js-avaliacao'),
    listaTentativas: document.getElementById('js-tentativas-passadas'),

    tentativas: [],

    carregarTentativas: function () {
        this.tentativas = window.tentativas.list();

        if(this.tentativas.length > 0){

            this.listaTentativas.innerHTML = '';

            for(let i = 0; i < this.tentativas.length; i++) {
                this.listaTentativas.innerHTML += `
                <li>
                    <button class="lista-btn-rm" data-tentativa="${this.tentativas[i].id}"><i class="icon ion-md-trash"></i></button>
                    <div>
                        <p>Tentativa #${this.tentativas[i].id}</p>
                        <p class="nota">Nota: ${this.tentativas[i].nota}</p>
                        <p class="data">${this.tentativas[i].data}</p>
                    </div>
                </li>`;
            }

            this.listaTentativas.addEventListener('click', (event) => {
                let target = event.target;

                if(!target) return;

                if(!target.classList.contains('lista-btn-rm')){
                    target = target.getParentByClass('lista-btn-rm');
                }

                let idTentativa = parseInt(target.dataset.tentativa);

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
                        this.carregarTentativas();
                    }
                })
            });

            this.containerTentativas.style.display = 'block';
            this.containerAvaliacao.style.display = 'block';
        }
        else{
            this.containerTentativas.style.display = 'none';
            this.containerAvaliacao.style.display = 'none';
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
                confirmButton: 'button btn-blue'
            },
            buttonsStyling: false
        })
        .then(this.limparTentativas.bind(this));

    },

    limparTentativas: function (){
        this.tentativas = [];
        window.tentativas.clear();

        this.containerTentativas.style.display = 'none';
        this.containerAvaliacao.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    app.carregarTentativas();

    inicializaEventos ();
});

function inicializaEventos (){
    document.getElementById('js-btn-inicia').addEventListener('click', function (event) {
        if(app.tentativas.length >= 3) {
            Swal.fire({
                title: 'Limite de tentativas alcançado',
                text: 'Você atigiu o limite máximo de 3 tentativas. Finalize o questionário para liberar esse limite.',
                type: 'error',
                customClass: {
                    confirmButton: 'button btn-blue'
                },
                buttonsStyling: false
            })
        }
        else{
            location.href = "responder.html";
        }
    });

    app.btnAvaliarMaiorNota.addEventListener('click', function () {
        avaliar('maior');
    });

    app.btnAvaliarMediaNotas.addEventListener('click', function () {
        avaliar('media');
    });

    app.btnAvaliarUltimaNota.addEventListener('click', function () {
        avaliar('ultima');
    });
}

function avaliar(metodo) {
    Swal.fire({
        title: 'Finalizar questionário?',
        text: 'Finalizar e avaliar questionário? Suas tentativas serão apagadas após a avaliação.',
        type: 'question',
        customClass: {
            confirmButton: 'button display-block btn-green',
            cancelButton: 'button display-block btn-red'
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
