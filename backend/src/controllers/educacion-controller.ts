import { Request, Response } from 'express';

export class EducacionController {
    async getArticulos(req: Request, res: Response): Promise<void> {
        const articulos = [
            {
                id: 'insolvencia',
                titulo: '¿Qué es la insolvencia y cómo funciona en Chile?',
                contenido: 'La insolvencia es la situación en la que una persona no puede pagar sus deudas...'
            },
            {
                id: 'renegociacion',
                titulo: 'Cómo renegociar tus deudas con éxito',
                contenido: 'Negociar con tus acreedores puede ser una herramienta poderosa...'
            },
            {
                id: 'cobranza',
                titulo: '¿Te están acosando los cobradores? Conoce tus derechos',
                contenido: 'El acoso de cobradores es una práctica ilegal. Aquí te explicamos qué hacer...'
            }
        ];
        res.status(200).json({ success: true, data: articulos });
    }

    async getChatbotResponse(req: Request, res: Response): Promise<void> {
        const { pregunta } = req.body;

        const respuestas: Record<string, string> = {
            'acoso': 'Si te están acosando los cobradores, puedes denunciarlo en el SERNAC. Aquí tienes el enlace: https://www.sernac.cl',
            'insolvencia': 'La Ley de Insolvencia te permite renegociar tus deudas. Más información en https://www.superir.gob.cl',
            'cae': 'Para el CAE, puedes solicitar asesoría en la Condusef: https://www.condusef.cl',
        };

        const respuesta = respuestas[pregunta] || 'No entendí tu pregunta. Intenta con: "acoso", "insolvencia" o "cae".';
        res.status(200).json({ success: true, data: { respuesta } });
    }
}