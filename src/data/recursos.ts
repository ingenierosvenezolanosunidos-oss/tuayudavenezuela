// Recursos estáticos de emergencia — disponibles sin conexión.
// Inspirado en el directorio y la guía de redayudavenezuela.com.

export interface Telefono {
  nombre: string
  numero: string
}

export interface GrupoTelefonos {
  titulo: string
  items: Telefono[]
}

export const TELEFONOS_EMERGENCIA: GrupoTelefonos[] = [
  {
    titulo: 'Líneas de emergencia (VEN 9-1-1)',
    items: [
      { nombre: 'Emergencias (Movistar)', numero: '911' },
      { nombre: 'Protección Civil Nacional', numero: '0800-5588427' },
      { nombre: 'Cantv', numero: '171' },
      { nombre: 'Digitel', numero: '112' },
      { nombre: 'Movilnet', numero: '*1' },
    ],
  },
  {
    titulo: 'Bomberos y rescate',
    items: [
      { nombre: 'Bomberos', numero: '0212-545-9111' },
      { nombre: 'Protección Civil', numero: '0212-662-3322' },
      { nombre: 'Cruz Roja (Caracas)', numero: '0212-578-2516' },
    ],
  },
  {
    titulo: 'Ambulancias',
    items: [
      { nombre: 'Rescarven', numero: '0500-7372283' },
      { nombre: 'Aeroambulancias', numero: '0212-263-3344' },
      { nombre: 'Servicio Metropolitano', numero: '0212-265-9999' },
    ],
  },
]

export interface PlataformaAyuda {
  nombre: string
  descripcion: string
  url: string
  emoji: string
}

export const PLATAFORMAS_AYUDA: PlataformaAyuda[] = [
  {
    nombre: 'VZLA Ayuda',
    descripcion: 'Pide o da ayuda de forma anónima, sin registro. Iniciativa ciudadana.',
    url: 'https://vzlayuda.com',
    emoji: '🤝',
  },
  {
    nombre: 'tuAyudaVenezuela',
    descripcion: 'Mapa colaborativo de acopio, hospitales, personas buscadas y emergencias.',
    url: 'https://tuayudavenezuela.app',
    emoji: '🗺️',
  },
]

export interface Servicio {
  nombre: string
  descripcion: string
  emoji: string
  telefono?: string
  url?: string
}

export interface CategoriaServicios {
  id: string
  nombre: string
  emoji: string
  color: string
  items: Servicio[]
}

export const CATEGORIAS_SERVICIOS: CategoriaServicios[] = [
  {
    id: 'plataformas',
    nombre: 'Plataformas de ayuda',
    emoji: '🤝',
    color: '#003893',
    items: [
      {
        nombre: 'VZLA Ayuda',
        descripcion: 'Pide o da ayuda de forma anónima y sin registro. Conecta a quien necesita con quien puede ayudar.',
        url: 'https://vzlayuda.com',
        emoji: '🤝',
      },
      {
        nombre: 'tuAyudaVenezuela',
        descripcion: 'Mapa colaborativo de centros de acopio, hospitales, personas buscadas e infraestructura caída.',
        url: 'https://tuayudavenezuela.app',
        emoji: '🗺️',
      },
    ],
  },
  {
    id: 'emergencias',
    nombre: 'Emergencias',
    emoji: '🚨',
    color: '#CF142B',
    items: [
      {
        nombre: 'VEN 9-1-1',
        descripcion: 'Línea nacional de emergencias. Personas atrapadas, colapsos, ambulancias.',
        telefono: '911',
        emoji: '🚨',
      },
      {
        nombre: 'Protección Civil Nacional',
        descripcion: 'Coordinación de desastres, evacuaciones y refugios.',
        telefono: '0800-5588427',
        emoji: '⛑️',
      },
      {
        nombre: 'Cruz Roja Venezuela',
        descripcion: 'Atención médica y primeros auxilios (Caracas).',
        telefono: '0212-578-2516',
        emoji: '🏥',
      },
    ],
  },
  {
    id: 'bomberos',
    nombre: 'Bomberos y rescate',
    emoji: '🔥',
    color: '#D4A017',
    items: [
      {
        nombre: 'Bomberos',
        descripcion: 'Cuerpo de Bomberos Nacional.',
        telefono: '0212-545-9111',
        emoji: '🚒',
      },
      {
        nombre: 'Protección Civil Caracas',
        descripcion: 'Rescate y evacuaciones en Caracas.',
        telefono: '0212-662-3322',
        emoji: '🛡️',
      },
    ],
  },
  {
    id: 'salud',
    nombre: 'Salud y ambulancias',
    emoji: '💊',
    color: '#E24B4A',
    items: [
      {
        nombre: 'Rescarven',
        descripcion: 'Servicio privado de ambulancias a nivel nacional.',
        telefono: '0500-7372283',
        emoji: '🚑',
      },
      {
        nombre: 'Aeroambulancias',
        descripcion: 'Traslado aéreo médico de emergencia.',
        telefono: '0212-263-3344',
        emoji: '🚁',
      },
      {
        nombre: 'Servicio Metropolitano',
        descripcion: 'Ambulancias metropolitanas de Caracas.',
        telefono: '0212-265-9999',
        emoji: '🏥',
      },
    ],
  },
  {
    id: 'acopio',
    nombre: 'Acopio y donaciones',
    emoji: '📦',
    color: '#1D9E75',
    items: [
      {
        nombre: 'Reporta un centro de acopio',
        descripcion: 'Usa el botón "Reportar" en el mapa para registrar un punto de recepción de donaciones en tu zona.',
        emoji: '📍',
      },
      {
        nombre: 'Banco de Alimentos Venezuela',
        descripcion: 'Organización que distribuye alimentos a comunidades vulnerables.',
        url: 'https://bancodealimentosvenezuela.org',
        emoji: '🍽️',
      },
    ],
  },
  {
    id: 'legal',
    nombre: 'Apoyo legal y social',
    emoji: '⚖️',
    color: '#534AB7',
    items: [
      {
        nombre: 'Provea',
        descripcion: 'Programa Venezolano de Educación-Acción en Derechos Humanos.',
        url: 'https://provea.org',
        emoji: '⚖️',
      },
      {
        nombre: 'Acción Solidaria',
        descripcion: 'Organización de respuesta ante la crisis humanitaria de salud en Venezuela.',
        url: 'https://accionsolidaria.info',
        emoji: '❤️',
      },
    ],
  },
]

export interface PasoGuia {
  titulo: string
  detalle: string
}

export const PRIMERAS_HORAS: PasoGuia[] = [
  {
    titulo: 'Verifica tu seguridad y la de los tuyos',
    detalle: 'Revisa si hay heridos. Aléjate de estructuras dañadas, cables y fugas de gas.',
  },
  {
    titulo: 'Corta servicios si hay riesgo',
    detalle: 'Si hueles gas o ves chispas, cierra la llave de gas y baja la electricidad.',
  },
  {
    titulo: 'Avisa que estás a salvo',
    detalle: 'Manda un mensaje corto a tu familia. Usa SMS si las llamadas no entran.',
  },
  {
    titulo: 'Reúnete en un punto seguro',
    detalle: 'Define un lugar abierto, lejos de edificios, como punto de encuentro familiar.',
  },
  {
    titulo: 'Ten lista una mochila de emergencia',
    detalle: 'Agua, linterna, documentos, medicinas, cargador y algo de efectivo.',
  },
  {
    titulo: 'Reporta lo que veas',
    detalle: 'Registra acopio, hospitales, personas o fallas en esta app para ayudar a otros.',
  },
  {
    titulo: 'No difundas rumores',
    detalle: 'Comparte solo información verificada. Evita saturar las líneas de emergencia.',
  },
  {
    titulo: 'Cuida a quien lo necesita',
    detalle: 'Apoya a personas mayores, con discapacidad o que estén solas cerca de ti.',
  },
  {
    titulo: 'Mantente informado',
    detalle: 'Sigue fuentes oficiales y conserva batería para emergencias reales.',
  },
]
