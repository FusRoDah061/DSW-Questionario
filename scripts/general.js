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

window.cookie = {

    bake: function (name, value) {
        var cookie = [name, '=', JSON.stringify(value), '; domain_.', window.location.host.toString(), '; path=/;'].join('');
        document.cookie = cookie;
    },

    read: function (name) {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        result = result != null ? JSON.parse(result[1]) : [];
        return result;
    },

    delete: function (name) {
        document.cookie = [name, '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain.', window.location.host.toString()].join('');
    }
}

window.storage = {
    set: function (key, value) {
        if (window.localStorage) {
            localStorage.setItem(key, value);
        } else if (document.cookie) {
            cookie.bake(key, value);
        }
    },

    get: function (key) {
        let v = null;

        if (window.localStorage) {
            v = localStorage.getItem(key);
        } else if (document.cookie) {
            v = cookie.read(key);
        }

        return v;
    },

    delete: function (key) {
        if (window.localStorage) {
            localStorage.removeItem(key);
        } else if (document.cookie) {
            cookie.delete(key);
        }
    }
}

window.tentativas = {
    storageKey: 'tentativas',

    list: function () {
        let tentativas = storage.get(this.storageKey);

        if (!tentativas)
            tentativas = [];
        else
            tentativas = JSON.parse(tentativas);

        return tentativas;
    },

    get: function (id){
        let tentativas = this.list();

        return tentativas.find(t => {
            if(t.id == id)
                return t;
        });
    },

    set: function (tentativas) {
        storage.set(this.storageKey, JSON.stringify(tentativas));
    },

    push: function (tentativa) {
        let tentativas = this.list();

        tentativa.id = ((tentativas[tentativas.length - 1]) ? tentativas[tentativas.length - 1].id + 1 : tentativas.length) + 1;

        tentativas.push(tentativa);

        this.set(tentativas);
    },

    remove: function(id) {
        let tentativas = this.list();
        let indiceTentativa = tentativas.findIndex(item => {
            return item.id == id;
        });

        tentativas.splice(indiceTentativa, 1);
        this.set(tentativas);
    },

    clear: function (){
        storage.set(this.storageKey, '');
    }
}
