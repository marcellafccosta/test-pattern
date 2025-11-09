import { User } from '../../domain/User.js';

class UserMother {
    static umUsuarioPadrao() {
        return new User(
            1,
            'Marcella Costa',
            'marcella@mail.com',
            'PADRAO'
        );
    }

    static umUsuarioPremium() {
        return new User(
            2,
            'Luan Santana',
            'luansantana@mail.com',
            'PREMIUM'
        );
    }
}

export default UserMother;