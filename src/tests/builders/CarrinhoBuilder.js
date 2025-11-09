import { Carrinho } from '../../domain/Carrinho.js';
import { Item } from '../../domain/Item.js';
import UserMother from './UserMother.js';

class CarrinhoBuilder {
    constructor() {
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [
            new Item('Produto Padrao', 100.00)
        ];
    }

    comUser(user) {
        this.user = user;
        return this;
    }

    vazio() {
        this.itens = []
        return this;
    }

    comValorTotal(valor) {
        this.itens = [new Item('Produto Teste', valor)];
        return this;
    }

    build() {
        return new Carrinho(this.user, this.itens);
    }
}

export default CarrinhoBuilder;
