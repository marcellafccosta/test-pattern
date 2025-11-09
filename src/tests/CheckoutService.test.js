import { CheckoutService } from '../services/CheckoutService.js';
import CarrinhoBuilder from './builders/CarrinhoBuilder.js';
import UserMother from './builders/UserMother.js';

const TestHelpers = {
    criarGatewayStub: (respostaPagamento) => ({
        cobrar: jest.fn().mockResolvedValue(respostaPagamento)
    }),

    criarRepositoryStub: (pedidoRetornado) => ({
        salvar: jest.fn().mockResolvedValue(pedidoRetornado)
    }),

    criarEmailMock: () => ({
        enviarEmail: jest.fn().mockResolvedValue(true)
    }),

    criarRepositoryDummy: () => ({
        salvar: jest.fn()
    }),

    criarEmailDummy: () => ({
        enviarEmail: jest.fn()
    }),

    criarCartaoCredito: () => ({
        numero: '1234567890123456',
        cvv: '123',
        validade: '12/25'
    })
};

describe('CheckoutService', () => {
    describe('quando o pagamento falha', () => {
        it('deve retornar null e não processar o pedido', async () => {

            // arrange
            const carrinho = new CarrinhoBuilder()
                .comValorTotal(100.00)
                .build();

            const gatewayStub = TestHelpers.criarGatewayStub({ success: false });
            const repositoryDummy = TestHelpers.criarRepositoryDummy();
            const emailDummy = TestHelpers.criarEmailDummy();
            const cartaoCredito = TestHelpers.criarCartaoCredito();
            const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

            // act
            const pedido = await checkoutService.processarPedido(carrinho, cartaoCredito);

            expect(pedido).toBeNull();
            expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(100.00, cartaoCredito);
            expect(repositoryDummy.salvar).not.toHaveBeenCalled();
            expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente premium finaliza a compra', () => {
        it('deve aplicar desconto de 10% e enviar email de confirmacao', async () => {
            // arrange
            const usuarioPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comValorTotal(200.00)
                .build();

            const pedidoEsperado = { id: 1, carrinho: carrinho, totalFinal: 180.00, status: 'PROCESSADO' };

            const gatewayStub = TestHelpers.criarGatewayStub({
                success: true,
                transactionId: 'trans123'
            });
            const repositoryStub = TestHelpers.criarRepositoryStub(pedidoEsperado);

            const emailMock = TestHelpers.criarEmailMock();
            const cartaoCredito = TestHelpers.criarCartaoCredito();
            const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

            // act
            const pedido = await checkoutService.processarPedido(carrinho, cartaoCredito);

            // assert
            expect(pedido).not.toBeNull();
            expect(pedido.id).toBe(1);
            expect(pedido.totalFinal).toBe(180.00);
            expect(pedido.status).toBe('PROCESSADO');
            expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180.00, cartaoCredito);
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'luansantana@mail.com',
                "Seu Pedido foi Aprovado!",
                expect.stringContaining('Pedido 1 no valor de R$180')
            );
        });
    });
});