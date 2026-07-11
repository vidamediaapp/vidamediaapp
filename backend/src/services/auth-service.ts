import {Repository} from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../entities/usuario';
import {CreateUsuarioDto} from '../dtos/crear-usuario.dto';

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apaterno: string;
  amaterno: string;
  rut: string;
  telefono: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface tokenPayload {
  id: string;
  email: string;
}

export class AuthService {

    constructor(private userRepository: Repository<Usuario>) {}

    async register(data: CreateUsuarioDto): Promise<Usuario> {
        const usuarioExistente = await this.userRepository.findOne({ where: { email: data.email } });
        if (usuarioExistente) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        const existente = await this.userRepository.findOne({ where: { rut: data.rut } });
        if (existente) {
         throw new Error('El RUT ya se encuentra registrado');
      }

        const SaltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, SaltRounds);
        const nuevoUsuario = this.userRepository.create({
            email: data.email,
            passwordHash,
            nombre: data.nombre,
            apaterno: data.apellidoPat,
            amaterno: data.apellidoMat,
            rut: data.rut,
            telefono: data.telefono,
  
        });
        return this.userRepository.save(nuevoUsuario);
    }


    async login({ email, password }: LoginData): Promise<string> {
        const usuario = await this.userRepository.findOne({ where: { email } });
        if (!usuario) {
            throw new Error('Credenciales inválidas.');
        }
        const esValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!esValida) {
            throw new Error('Credenciales inválidas.');
        }
        const payload: tokenPayload = {
            id: usuario.id,
            email: usuario.email
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return token;
    }

    async loginWithToken(token: string): Promise<{ token: string; usuario: Omit<Usuario, 'passwordHash'> }> {
        const payload = await this.verifyToken(token);
        const usuario = await this.userRepository.findOne({ where: { id: payload.id } });
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        const { passwordHash, ...usuarioSinPassword } = usuario;
        return { token, usuario: usuarioSinPassword as Omit<Usuario, 'passwordHash'> };
    }

    async verifyToken(token: string): Promise<tokenPayload> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as tokenPayload;
            return decoded;
        } catch (error) {
            throw new Error('Token inválido o expirado.');
        }
    }

    async obtenerUsuarioPorId(id: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
        const usuario = await this.userRepository.findOne({ where: { id } });
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }
        const { passwordHash, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword as Omit<Usuario, 'passwordHash'>;
    }

}