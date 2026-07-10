// ── Situaciones legales ───────────────────────────────────────────
export interface SituacionLegal {
  id:          string;
  numero:      string;
  titulo:      string;
  subtitulo:   string;
  descripcion: string;
  color:       'red' | 'blue' | 'teal';
  ley:         string;
  articulo:    string;
  textoLey:    string;
  accionLabel: string;
  accionUrl?:  string;
  accionRoute?: string;
}

export const SITUACIONES_LEGALES: SituacionLegal[] = [
  {
    id:          'acoso',
    numero:      '01',
    titulo:      'Acoso de cobranza',
    subtitulo:   'Llamadas, mensajes o amenazas abusivas',
    descripcion: 'Tienes derecho a exigir que no te contacten fuera de horario laboral, en tu trabajo o mediante amenazas. El acoso de cobranza es ilegal en Chile.',
    color:       'red',
    ley:         'Ley 19.496 — Art. 37',
    articulo:    'Ley 19.496',
    textoLey:    'Prohíbe a las empresas contactar al deudor en horarios o lugares inadecuados, o usar métodos que afecten su honra o reputación. El incumplimiento da derecho a indemnización.',
    accionLabel: 'Denunciar al SERNAC',
    accionUrl:   'https://www.sernac.cl/portal/619/w3-propertyname-624.html',
  },
  {
    id:          'prepago',
    numero:      '02',
    titulo:      'Derecho a prepago',
    subtitulo:   'Pagar antes sin penalización abusiva',
    descripcion: 'Puedes prepagar total o parcialmente cualquier crédito. La empresa no puede cobrarte más de un mes de interés como penalización por hacerlo.',
    color:       'blue',
    ley:         'Ley 18.010 — Art. 10',
    articulo:    'Ley 18.010',
    textoLey:    'El deudor tiene derecho a prepagar en cualquier momento, en dinero efectivo. La compensación máxima es un mes de interés calculado sobre el monto prepagado.',
    accionLabel: 'Calcular mi prepago',
    accionRoute: '/simulator',
  },
  {
    id:          'renegociacion',
    numero:      '03',
    titulo:      'Renegociación de deudas',
    subtitulo:   'Proceso concursal gratuito ante la SuperIR',
    descripcion: 'Si tu deuda supera tu capacidad de pago, puedes iniciar un proceso de renegociación ante la Superintendencia de Insolvencia de forma gratuita.',
    color:       'teal',
    ley:         'Ley 20.720 — Procedimiento Concursal',
    articulo:    'Ley 20.720',
    textoLey:    'Permite renegociar o liquidar deudas cuando superan la capacidad de pago. Protege al deudor de embargos y ejecuciones mientras dura el proceso. Es completamente gratuito.',
    accionLabel: 'Iniciar en SuperIR',
    accionUrl:   'https://www.superir.gob.cl/personas/persona-deudora/',
  },
];

// ── Chatbot local — base de conocimiento ─────────────────────────
export interface ChatRespuesta {
  keywords: string[];
  respuesta: string;
}

export const CHAT_KB: ChatRespuesta[] = [
  {
    keywords: ['embargo', 'embargar', 'renegociacion', 'renegociación', 'proceso', 'concursal'],
    respuesta: 'Durante el proceso concursal de la Ley 20.720, se suspenden automáticamente todos los embargos y ejecuciones en tu contra. Esto te protege mientras dura la negociación.',
  },
  {
    keywords: ['prescripcion', 'prescripción', 'prescribe', 'vence', 'tiempo', 'años'],
    respuesta: 'Las deudas de tarjetas de crédito y retail prescriben en 5 años (acción ejecutiva) y 2 años (mercantil). Para hipotecarios el plazo es de 5 años. Después de ese período, la deuda sigue existiendo pero no pueden demandarte judicialmente.',
  },
  {
    keywords: ['cae', 'tasa', 'interes', 'interés', 'cobrar'],
    respuesta: 'El CAE (Costo Anual Equivalente) incluye la tasa de interés + seguros + comisiones + otros cargos. Por ley, todas las instituciones deben informarte el CAE antes de firmar cualquier crédito. Si no lo hicieron, puedes reclamar al SERNAC.',
  },
  {
    keywords: ['acoso', 'llamadas', 'hostigamiento', 'amenaza', 'amenazas', 'cobrador'],
    respuesta: 'Según la Ley 19.496, es ilegal que te llamen fuera del horario de 8:00 a 20:00, en tu lugar de trabajo sin permiso, o que usen lenguaje amenazante. Guarda evidencia (capturas, grabaciones) y denuncia en sernac.cl o llama al 800 700 100.',
  },
  {
    keywords: ['prepago', 'pagar', 'anticipado', 'antes', 'multa', 'penalizacion', 'penalización'],
    respuesta: 'Tienes derecho a prepagar cualquier deuda en cualquier momento. La penalización máxima que pueden cobrarte es 1 mes de intereses sobre el monto que prepagás. No pueden cobrarte más que eso.',
  },
  {
    keywords: ['derechos', 'derecho', 'consumidor', 'proteccion', 'protección'],
    respuesta: 'Tus principales derechos como deudor en Chile:\n• No ser contactado fuera de horario (Ley 19.496)\n• Prepagar sin penalización abusiva (Ley 18.010)\n• Acceder a proceso concursal gratuito (Ley 20.720)\n• Conocer el CAE antes de firmar\n• Exigir estado de deuda actualizado en cualquier momento',
  },
  {
    keywords: ['boletín', 'boletin', 'dicom', 'infocorp', 'morosidad', 'registro'],
    respuesta: 'Si pagaste una deuda, la empresa tiene 5 días hábiles para eliminarte del registro de morosos. Si no lo hacen, puedes reclamar al SERNAC. El Boletín Comercial lo administra la Cámara de Comercio de Santiago.',
  },
  {
    keywords: ['superir', 'superintendencia', 'insolvencia', 'gratuito', 'gratis'],
    respuesta: 'El proceso de renegociación ante la SuperIR es 100% gratuito para personas naturales. Debes concurrir con tu RUT, acreditar tus ingresos y listar tus deudas. La SuperIR actúa como mediador entre tú y tus acreedores.',
  },
  {
    keywords: ['sernac', 'reclamo', 'denuncia', 'denunciar', 'queja'],
    respuesta: 'Puedes reclamar al SERNAC en sernac.cl, en la app SERNAC o llamando al 800 700 100 (gratuito). El plazo de respuesta del proveedor es 10 días hábiles. Si no responden o la respuesta no te satisface, SERNAC puede mediar.',
  },
  {
    keywords: ['hola', 'buenas', 'saludos', 'ayuda', 'consulta'],
    respuesta: 'Hola 👋 Soy tu asistente legal local. Puedo ayudarte con preguntas sobre:\n• Acoso de cobranza\n• Derecho a prepago\n• Renegociación de deudas\n• Prescripción de deudas\n• Boletín comercial / DICOM\n¿Sobre qué te gustaría saber?',
  },
];

export const CHAT_FALLBACK =
  'No tengo información específica sobre eso. Te recomiendo consultar directamente en sernac.cl o llamar al 800 700 100 (número gratuito de SERNAC).';

export const QUICK_PILLS = [
  '¿Qué es el CAE?',
  '¿Cuándo prescriben las deudas?',
  'Mis derechos como deudor',
  '¿Cómo salir del DICOM?',
];
