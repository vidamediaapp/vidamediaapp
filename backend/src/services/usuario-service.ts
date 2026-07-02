import { Repository} from 'typeorm';
import bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario';

export class UsuarioService {
    constructor(private usuarioRepository: Repository<Usuario>) {}
async obtenerTodos(): Promise<Omit<Usuario, 'passwordHash'>[]> {
    const usuarios = await this.usuarioRepository.find({
        select: {
            id: true,
            email: true,
            nombre: true,
            apaterno: true,
            amaterno: true,
            telefono: true
        }
    });
    return usuarios; 
}

   
async obtenerUsuarioPorId(id: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
    if (!id) {
        throw new Error('ID de usuario es requerido');
    }

    const usuario = await this.usuarioRepository.findOne({
        where: { id },
        select: {
            id: true,
            email: true,
            nombre: true,
            apaterno: true,
            amaterno: true,
            telefono: true,

        }
    });


    if (!usuario) {
        return null;
    }

    return usuario;
}

    
    async obtenerUsuarioPorEmail(email: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
        const usuario = await this.usuarioRepository.findOne({
            where: { email }
        });

        if (!usuario) {
            return null;
        }

        const { passwordHash, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword as Omit<Usuario, 'passwordHash'>;
    }


   
    async actualizarPerfil(
        id: string,
        data: {
            nombre?: string;
            apaterno?: string;
            amaterno?: string;
            telefono?: string;
        }
    ): Promise<Omit<Usuario, 'passwordHash'>> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

       
        if (data.nombre !== undefined) usuario.nombre = data.nombre;
        if (data.apaterno !== undefined) usuario.apaterno = data.apaterno;
        if (data.amaterno !== undefined) usuario.amaterno = data.amaterno;
        if (data.telefono !== undefined) usuario.telefono = data.telefono;

        await this.usuarioRepository.save(usuario);

        const { passwordHash, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword as Omit<Usuario, 'passwordHash'>;
    }

    
    async cambiarPassword(
        id: string,
        oldPassword: string,
        newPassword: string
    ): Promise<void> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

    
        const esValida = await bcrypt.compare(oldPassword, usuario.passwordHash);
        if (!esValida) {
            throw new Error('Contraseña actual incorrecta');
        }

  
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        usuario.passwordHash = newPasswordHash;

        await this.usuarioRepository.save(usuario);
    }

    async eliminarUsuario(id: string): Promise<void> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        await this.usuarioRepository.delete(id);
    }

    async existeUsuario(id: string): Promise<boolean> {
        const count = await this.usuarioRepository.count({
            where: { id }
        });
        return count > 0;
    }


    async contarUsuarios(): Promise<number> {
        return await this.usuarioRepository.count();
    }
}