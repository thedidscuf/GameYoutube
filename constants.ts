
import { EquipmentItem, EquipmentType, GenreDetails, Achievement, PremiumBenefits, GameComment, ThumbnailComponent, StreamPrompt } from './types';

export const APP_VERSION = "v1.4.2 Public Beta";
export const MAX_CHANNELS = 3;
export const MAX_CHANNELS_PREMIUM = 4;
export const ENERGY_PER_VIDEO = 25;
export const ENERGY_REGEN_PER_DAY = 50;
export const INITIAL_MAX_ENERGY = 100;
export const MONETIZATION_REQUIREMENTS = {
  subscribers: 1000,
  watchHours: 1000,
};
export const MONEY_PER_1000_VIEWS_MONETIZED = 1; // $1 per 1000 views if monetized
export const WATCH_HOURS_PER_VIEW_MINUTE_AVG = 0.05; // Avg 3 minutes per view (3/60 = 0.05 hours)

export const EQUIPMENT_DATA: { [key in EquipmentType]: EquipmentItem } = {
  [EquipmentType.CAMERA]: {
    name: 'Cámara',
    icon: 'fas fa-video',
    description: 'Mejora la calidad visual de tus videos.',
    levels: [
      { level: 1, cost: 0, description: 'Teléfono Básico' },
      { level: 2, cost: 50, description: 'Webcam HD', statBoost: 0.05 }, // 5% view boost
      { level: 3, cost: 500, description: 'Cámara DSLR', statBoost: 0.10 },
      { level: 4, cost: 1000, description: 'Cámara Profesional', statBoost: 0.15 },
      { level: 5, cost: 5000, description: 'Cámara de Cine', statBoost: 0.20 },
    ],
  },
  [EquipmentType.MICROPHONE]: {
    name: 'Micrófono',
    icon: 'fas fa-microphone',
    description: 'Mejora la calidad del audio.',
    levels: [
      { level: 1, cost: 0, description: 'Micrófono Integrado' },
      { level: 2, cost: 50, description: 'Micrófono USB', statBoost: 0.03 }, // 3% sub boost from quality
      { level: 3, cost: 500, description: 'Micrófono de Condensador', statBoost: 0.07 },
      { level: 4, cost: 1000, description: 'Micrófono Profesional', statBoost: 0.10 },
      { level: 5, cost: 5000, description: 'Estudio de Grabación', statBoost: 0.15 },
    ],
  },
  [EquipmentType.EDITING_SOFTWARE]: {
    name: 'Software de Edición',
    icon: 'fas fa-edit',
    description: 'Mejora la calidad de edición y el atractivo.',
    levels: [
      { level: 1, cost: 0, description: 'Editor Básico Gratuito' },
      { level: 2, cost: 100, description: 'Editor Amateur', statBoost: 0.05 }, // 5% watch hour boost
      { level: 3, cost: 750, description: 'Editor Semi-Pro', statBoost: 0.10 },
      { level: 4, cost: 1500, description: 'Editor Profesional', statBoost: 0.15 },
      { level: 5, cost: 7000, description: 'Suite de Edición Hollywood', statBoost: 0.20 },
    ],
  },
  [EquipmentType.DECORATION]: {
    name: 'Decoración del Set',
    icon: 'fas fa-couch',
    description: 'Mejora el aspecto de tu estudio y aumenta la energía máxima.',
    levels: [
      { level: 1, cost: 0, description: 'Pared Vacía' },
      { level: 2, cost: 30, description: 'Póster Genérico', statBoost: 10 }, // +10 Max Energy
      { level: 3, cost: 200, description: 'Luces LED y Estantería', statBoost: 20 },
      { level: 4, cost: 800, description: 'Set Temático Básico', statBoost: 30 },
      { level: 5, cost: 3000, description: 'Estudio Personalizado Profesional', statBoost: 50 },
    ],
  },
};

export const VIDEO_GENRES: string[] = ["Gaming", "Música", "Vlogs", "Educación", "Comedia", "Tecnología", "Belleza", "Cocina"];

export const ADVANCED_GENRES: GenreDetails = {
  "Gaming": ["Fortnite", "Roblox", "Minecraft", "League of Legends", "Valorant", "Otro"],
  "Música": ["Clásica", "Dubstep", "Rap", "Pop", "Rock", "Cover", "Original", "Otro"],
  "Vlogs": ["Diario", "Viajes", "Eventos", "Opinión", "Otro"],
  "Educación": ["Tutoriales", "Ciencia", "Historia", "Idiomas", "Otro"],
  "Comedia": ["Sketches", "Stand-up", "Parodias", "Bromas", "Otro"],
  "Tecnología": ["Reseñas", "Tutoriales de Software", "Noticias Tech", "Gadgets", "Otro"],
  "Belleza": ["Maquillaje", "Cuidado de la Piel", "Moda", "Hauls", "Otro"],
  "Cocina": ["Recetas", "Repostería", "Comida Rápida", "Cocina Internacional", "Otro"],
};


export const RECORDING_METHODS: string[] = ["Directo (Baja Calidad)", "Grabado (Calidad Media)", "Profesional (Alta Calidad)"];


export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'subs_10', name: 'Primeros Pasos', description: 'Alcanza 10 suscriptores.', icon: 'fas fa-shoe-prints', milestoneType: 'subscribers', milestoneValue: 10, reward: { money: 10 } },
  { id: 'subs_100', name: 'Comunidad Creciente', description: 'Alcanza 100 suscriptores.', icon: 'fas fa-users', milestoneType: 'subscribers', milestoneValue: 100, reward: { money: 50 } },
  { id: 'subs_500', name: 'Medio K', description: 'Alcanza 500 suscriptores.', icon: 'fas fa-user-friends', milestoneType: 'subscribers', milestoneValue: 500, reward: { money: 100 } },
  { id: 'subs_1000', name: '¡El Gran K!', description: 'Alcanza 1,000 suscriptores.', icon: 'fas fa-star', milestoneType: 'subscribers', milestoneValue: 1000, reward: { money: 200, energyBoost: 10 } },
  { id: 'subs_10000', name: 'Sensación Viral', description: 'Alcanza 10,000 suscriptores.', icon: 'fas fa-fire', milestoneType: 'subscribers', milestoneValue: 10000, reward: { money: 1000, energyBoost: 20 } },
  { id: 'subs_100000', name: 'Botón de Plata (Virtual)', description: 'Alcanza 100,000 suscriptores.', icon: 'fas fa-award', milestoneType: 'subscribers', milestoneValue: 100000, reward: { money: 5000, energyBoost: 50 } },
  { id: 'subs_1000000', name: 'Millonario en Subs', description: 'Alcanza 1,000,000 suscriptores.', icon: 'fas fa-trophy', milestoneType: 'subscribers', milestoneValue: 1000000, reward: { money: 25000, energyBoost: 100 } },

  { id: 'views_1000', name: 'Visto por Miles', description: 'Alcanza 1,000 vistas totales.', icon: 'fas fa-eye', milestoneType: 'views', milestoneValue: 1000, reward: { money: 20 } },
  { id: 'views_10000', name: 'Popularidad en Aumento', description: 'Alcanza 10,000 vistas totales.', icon: 'fas fa-chart-line', milestoneType: 'views', milestoneValue: 10000, reward: { money: 100 } },
  { id: 'views_100000', name: 'Rey de las Vistas', description: 'Alcanza 100,000 vistas totales.', icon: 'fas fa-crown', milestoneType: 'views', milestoneValue: 100000, reward: { money: 500 } },
  { id: 'views_1000000', name: 'Dominador de Vistas', description: 'Alcanza 1,000,000 vistas totales.', icon: 'fas fa-globe-americas', milestoneType: 'views', milestoneValue: 1000000, reward: { money: 2000 } },

  { id: 'watch_100', name: 'Enganchando a la Audiencia', description: 'Alcanza 100 horas de reproducción.', icon: 'fas fa-history', milestoneType: 'watchHours', milestoneValue: 100, reward: { money: 30 } },
  { id: 'watch_1000', name: 'Listo para Monetizar (Requisito)', description: 'Alcanza 1,000 horas de reproducción.', icon: 'fas fa-hourglass-half', milestoneType: 'watchHours', milestoneValue: 1000, reward: { money: 150 } },
  
  { id: 'videos_1', name: '¡Primer Video!', description: 'Sube tu primer video.', icon: 'fas fa-video', milestoneType: 'videosUploaded', milestoneValue: 1 },
  { id: 'videos_10', name: 'Creador Consistente', description: 'Sube 10 videos.', icon: 'fas fa-film', milestoneType: 'videosUploaded', milestoneValue: 10, reward: { money: 50 } },
  { id: 'videos_50', name: 'Videoteca Creciente', description: 'Sube 50 videos.', icon: 'fas fa-photo-video', milestoneType: 'videosUploaded', milestoneValue: 50, reward: { money: 250 } },

  { id: 'money_100', name: 'Primeros Ingresos', description: 'Gana tus primeros $100.', icon: 'fas fa-dollar-sign', milestoneType: 'totalEarnings', milestoneValue: 100 },
  { id: 'money_1000', name: 'Mil Dólares', description: 'Gana $1,000 en total.', icon: 'fas fa-money-bill-wave', milestoneType: 'totalEarnings', milestoneValue: 1000 },
  { id: 'money_10000', name: 'Magnate del Contenido', description: 'Gana $10,000 en total.', icon: 'fas fa-wallet', milestoneType: 'totalEarnings', milestoneValue: 10000 },
];


export const UPDATE_LOG = [
  { version: "v1.4.2", date: "2024-07-28", changes: ["Modo Oscuro/Claro implementado.", "Mejoras de UI generales.", "Botón 'Cómprame un café' añadido.", "Corrección de errores menores."] },
  { version: "v1.4.1", date: "2024-07-25", changes: ["Corrección de errores en monetización y ganancias totales.", "Ajustes de balance de energía."] },
  { version: "v1.4 Public Beta", date: "2024-07-20", changes: ["Lanzamiento Beta Público.", "Sistema de equipamiento expandido.", "Logros implementados.", "Revisión de monetización."] },
  { version: "v1.3.3", date: "2024-07-15", changes: ["Mejoras en la interfaz de subida de videos.", "Ajustes de UI en equipamiento."] },
  { version: "v1.3.0", date: "2024-07-10", changes: ["Introducción de 'Saltar al día siguiente'.", "Sistema de energía básico."] },
  { version: "v1.0.0", date: "2024-06-01", changes: ["Lanzamiento inicial del simulador."] },
];

export const PREMIUM_USERNAMES = ["project", "Quereo"]; // Usernames that get premium status

export const PREMIUM_BENEFITS_DETAILS: PremiumBenefits = {
  extraSaveSlot: true,
  earningsMultiplier: 1.5,
  viewsMultiplier: 1.2,
  exclusiveBadge: true,
  reducedEnergyCosts: true,
};

export const DEV_USERNAMES = ["project", "Quereo"];

// Constants for Community Minigame
export const COMMENT_RESPONDER_ENERGY_COST = 10;
export const COMMENT_RESPONDER_NUM_ROUNDS = 5; // Number of comments per game session
export const MAX_COMMUNITY_BOOST_POINTS = 25; // Max points obtainable from one game session

export const PREDEFINED_COMMENTS: GameComment[] = [
  {
    id: 'pos1',
    author: 'FanLeal01',
    text: '¡Este es el mejor video que he visto en semanas! ¡Sigue así!',
    type: 'positive',
    options: [
      { text: '¡Muchas gracias! 😊', points: 5, feedback: '¡Respuesta perfecta!', isCorrect: true },
      { text: 'Lo sé.', points: 0, feedback: 'Un poco arrogante, ¿no crees?' },
      { text: 'Ignorar', points: -1, feedback: 'Interactuar es clave.' },
    ],
  },
  {
    id: 'pos2',
    author: 'SubsNuevo44',
    text: 'Acabo de descubrir tu canal, ¡ya me suscribí! Genial contenido.',
    type: 'positive',
    options: [
      { text: '¡Bienvenido! Gracias por suscribirte.', points: 5, feedback: '¡Excelente bienvenida!', isCorrect: true },
      { text: 'Ok.', points: 1, feedback: 'Podrías ser más entusiasta.' },
      { text: 'Spam (Reportar)', points: -5, feedback: '¡No es spam! Es un nuevo fan.' },
    ],
  },
  {
    id: 'neu1',
    author: 'Pregunton7',
    text: '¿Qué programa usas para editar tus videos?',
    type: 'neutral',
    options: [
      { text: 'Uso "EditProX" (Responder amablemente)', points: 3, feedback: '¡Buena info!', isCorrect: true },
      { text: 'Es secreto.', points: 0, feedback: 'Compartir es bueno para la comunidad.' },
      { text: 'Ignorar', points: -1, feedback: 'Una oportunidad perdida para interactuar.' },
    ],
  },
  {
    id: 'neu2',
    author: 'CuriosoJorge',
    text: '¿Podrías hacer un video sobre [tema X relacionado al canal]?',
    type: 'neutral',
    options: [
      { text: '¡Buena idea! Lo consideraré.', points: 3, feedback: '¡A la audiencia le gusta que la escuchen!', isCorrect: true },
      { text: 'No hago videos por encargo.', points: 0, feedback: 'Un poco directo, pero válido.' },
      { text: 'Quizás. (Vago)', points: 1, feedback: 'Intenta ser más claro.' },
    ],
  },
  {
    id: 'neg1',
    author: 'Critico Constructivo',
    text: 'El audio estaba un poco bajo en este video, pero la idea es buena.',
    type: 'mildly_negative',
    options: [
      { text: 'Gracias por el feedback, lo tendré en cuenta.', points: 4, feedback: '¡Madurez ante todo!', isCorrect: true },
      { text: 'Mi audio es perfecto.', points: -2, feedback: 'No aceptar críticas no ayuda.' },
      { text: 'Eliminar comentario', points: -3, feedback: 'Era una crítica constructiva...' },
    ],
  },
  {
    id: 'neg2',
    author: 'Sincerin',
    text: 'Este video me pareció un poco aburrido...',
    type: 'mildly_negative',
    options: [
      { text: 'Lamento que no te haya gustado, ¡intentaré mejorar!', points: 3, feedback: '¡Buena actitud!', isCorrect: true },
      { text: 'Pues no lo veas.', points: -2, feedback: 'Eso aleja a la audiencia.' },
      { text: 'Ignorar', points: 0, feedback: 'A veces es mejor no decir nada.' },
    ],
  },
  {
    id: 'spam1',
    author: 'BotSpammer77',
    text: 'COMPRA MIS CURSOS!! GANA DINERO YA!! LINK EN MI BIO!',
    type: 'toxic_spam',
    options: [
      { text: 'Reportar como Spam y Eliminar', points: 5, feedback: '¡Comunidad limpia!', isCorrect: true },
      { text: 'Responder: "No, gracias."', points: -1, feedback: 'No interactúes con spam.' },
      { text: 'Preguntar más detalles', points: -3, feedback: '¡Es una trampa!' },
    ],
  },
  {
    id: 'spam2',
    author: 'YoElMejor',
    text: 'SUB X SUB?? RESPONDE RAPIDO!!',
    type: 'toxic_spam',
    options: [
      { text: 'Eliminar comentario', points: 4, feedback: 'Mantén tu sección de comentarios relevante.', isCorrect: true },
      { text: 'Responder: "Claro, sub ya!"', points: -5, feedback: 'El sub x sub no es crecimiento real.' },
      { text: 'Ignorar', points: 1, feedback: 'Eliminar es mejor para el spam.' },
    ],
  },
   {
    id: 'pos3',
    author: 'AprendiendoContigo',
    text: '¡Gracias! Este tutorial me ayudó muchísimo a entenderlo.',
    type: 'positive',
    options: [
      { text: '¡Me alegra mucho haberte ayudado! 😄', points: 5, feedback: '¡Excelente interacción!', isCorrect: true },
      { text: 'De nada.', points: 2, feedback: 'Corto pero educado.' },
      { text: 'Pedir que comparta el video', points: 0, feedback: 'Un poco directo para este comentario.' },
    ],
  },
  {
    id: 'neg3',
    author: 'NoEntendiNada',
    text: 'No explicaste bien la parte de XYZ, muy confuso.',
    type: 'mildly_negative',
    options: [
      { text: 'Intentaré ser más claro la próxima vez, ¿qué parte te confundió?', points: 4, feedback: '¡Buscar mejorar es clave!', isCorrect: true },
      { text: 'El problema eres tú, no mi explicación.', points: -3, feedback: 'Eso no es productivo.' },
      { text: 'Ignorar', points: 0, feedback: 'Podrías haber aprendido algo.' },
    ],
  }
];

// Constants for Thumbnail Optimizer Minigame
export const THUMBNAIL_OPTIMIZER_ENERGY_COST = 15;
export const THUMBNAIL_GAME_DURATION_SECONDS = 45;
export const MAX_THUMBNAIL_POINTS = 50; // Max points obtainable from one game session
export const MAX_CTR_BOOST_PERCENTAGE = 0.05; // 5% max CTR boost

export const PREDEFINED_THUMBNAIL_COMPONENTS: ThumbnailComponent[] = [
  // Backgrounds
  { id: 'bg_red_solid', componentType: 'background', displayName: 'Rojo Sólido', visual: { type: 'color', value: '#EF4444' }, quality: 'good', points: 8 },
  { id: 'bg_blue_gradient', componentType: 'background', displayName: 'Degradado Azul', visual: { type: 'gradient', value: 'linear-gradient(to right, #3B82F6, #60A5FA)' }, quality: 'good', points: 10 },
  { id: 'bg_grey_plain', componentType: 'background', displayName: 'Gris Simple', visual: { type: 'color', value: '#6B7280' }, quality: 'neutral', points: 3 },
  { id: 'bg_yellow_bright', componentType: 'background', displayName: 'Amarillo Brillante', visual: { type: 'color', value: '#F59E0B' }, quality: 'good', points: 7 },
  { id: 'bg_black_solid', componentType: 'background', displayName: 'Negro Sólido', visual: { type: 'color', value: '#1F2937' }, quality: 'neutral', points: 5 },
  { id: 'bg_green_subtle', componentType: 'background', displayName: 'Verde Suave', visual: { type: 'color', value: '#10B981' }, quality: 'good', points: 8 },
  { id: 'bg_purple_vibrant', componentType: 'background', displayName: 'Púrpura Vibrante', visual: { type: 'gradient', value: 'linear-gradient(to right, #8B5CF6, #A78BFA)' }, quality: 'good', points: 9 },
  { id: 'bg_brown_dull', componentType: 'background', displayName: 'Marrón Apagado', visual: { type: 'color', value: '#78350F' }, quality: 'bad', points: -2 },
  { id: 'bg_pink_flashy', componentType: 'background', displayName: 'Rosa Llamativo', visual: { type: 'color', value: '#EC4899' }, quality: 'neutral', points: 4 },
  { id: 'bg_white_clean', componentType: 'background', displayName: 'Blanco Limpio', visual: { type: 'color', value: '#F9FAFB' }, quality: 'good', points: 6 },

  // Objects (using Font Awesome icons)
  { id: 'obj_rocket', componentType: 'object', displayName: 'Cohete', visual: { type: 'icon', iconClass: 'fas fa-rocket', color: '#EF4444', size: '60px' }, quality: 'good', points: 10 },
  { id: 'obj_star', componentType: 'object', displayName: 'Estrella', visual: { type: 'icon', iconClass: 'fas fa-star', color: '#F59E0B', size: '55px' }, quality: 'good', points: 8 },
  { id: 'obj_face_surprise', componentType: 'object', displayName: 'Cara Sorpresa', visual: { type: 'icon', iconClass: 'fas fa-surprise', color: '#3B82F6', size: '60px' }, quality: 'good', points: 9 },
  { id: 'obj_thumbs_up', componentType: 'object', displayName: 'Pulgar Arriba', visual: { type: 'icon', iconClass: 'fas fa-thumbs-up', color: '#10B981', size: '50px' }, quality: 'good', points: 7 },
  { id: 'obj_poop', componentType: 'object', displayName: 'Emoji Poop', visual: { type: 'icon', iconClass: 'fas fa-poo', color: '#78350F', size: '50px' }, quality: 'bad', points: -5 },
  { id: 'obj_question', componentType: 'object', displayName: 'Interrogación', visual: { type: 'icon', iconClass: 'fas fa-question-circle', color: '#6B7280', size: '55px' }, quality: 'neutral', points: 3 },
  { id: 'obj_fire', componentType: 'object', displayName: 'Fuego', visual: { type: 'icon', iconClass: 'fas fa-fire', color: '#EF4444', size: '60px' }, quality: 'good', points: 10 },
  { id: 'obj_lightbulb', componentType: 'object', displayName: 'Bombilla', visual: { type: 'icon', iconClass: 'fas fa-lightbulb', color: '#F59E0B', size: '55px' }, quality: 'good', points: 7 },
  { id: 'obj_ghost', componentType: 'object', displayName: 'Fantasma', visual: { type: 'icon', iconClass: 'fas fa-ghost', color: '#A78BFA', size: '50px' }, quality: 'neutral', points: 4 },
  { id: 'obj_heart', componentType: 'object', displayName: 'Corazón', visual: { type: 'icon', iconClass: 'fas fa-heart', color: '#EC4899', size: '55px' }, quality: 'good', points: 8 },


  // Texts
  { id: 'txt_epic', componentType: 'text', displayName: '"ÉPICO!" (Impact)', visual: { type: 'text', content: '¡ÉPICO!', fontFamily: 'Impact, sans-serif', fontSize: '28px', color: '#FFFF00', strokeColor: '#000000', strokeWidth: '1px' }, quality: 'good', points: 10 },
  { id: 'txt_new', componentType: 'text', displayName: '"NUEVO VIDEO" (Arial)', visual: { type: 'text', content: 'NUEVO VIDEO', fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#FFFFFF', strokeColor: '#1F2937', strokeWidth: '1px' }, quality: 'good', points: 7 },
  { id: 'txt_boring', componentType: 'text', displayName: '"Interesante" (Times)', visual: { type: 'text', content: 'Interesante', fontFamily: 'Times New Roman, serif', fontSize: '20px', color: '#6B7280' }, quality: 'bad', points: -3 },
  { id: 'txt_clickbait', componentType: 'text', displayName: '"NO TE LO CREERÁS" (Comic Sans)', visual: { type: 'text', content: 'NO TE LO CREERÁS', fontFamily: 'Comic Sans MS, cursive', fontSize: '22px', color: '#10B981', strokeColor: '#FFFFFF', strokeWidth: '1px' }, quality: 'neutral', points: 4 },
  { id: 'txt_urgent', componentType: 'text', displayName: '"¡URGENTE!" (Impact, Red)', visual: { type: 'text', content: '¡URGENTE!', fontFamily: 'Impact, sans-serif', fontSize: '30px', color: '#EF4444', strokeColor: '#FFFFFF', strokeWidth: '1.5px' }, quality: 'good', points: 9 },
  { id: 'txt_simple', componentType: 'text', displayName: '"Tutorial" (Helvetica)', visual: { type: 'text', content: 'Tutorial', fontFamily: 'Helvetica, sans-serif', fontSize: '26px', color: '#1F2937' }, quality: 'neutral', points: 5 },
  { id: 'txt_tiny_unreadable', componentType: 'text', displayName: '"secreto" (Pequeño)', visual: { type: 'text', content: 'secreto', fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#A0AEC0' }, quality: 'bad', points: -5 },
  { id: 'txt_wow', componentType: 'text', displayName: '"¡WOW!" (Impact, Blue)', visual: { type: 'text', content: '¡WOW!', fontFamily: 'Impact, sans-serif', fontSize: '32px', color: '#3B82F6', strokeColor: '#FFFFFF', strokeWidth: '1.5px' }, quality: 'good', points: 10 },
  { id: 'txt_question', componentType: 'text', displayName: '"¿QUÉ PASÓ?" (Bold)', visual: { type: 'text', content: '¿QUÉ PASÓ?', fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#F59E0B', strokeColor: '#1F2937', strokeWidth: '1px' }, quality: 'good', points: 8 },
  { id: 'txt_cool_style', componentType: 'text', displayName: '"Cool Style" (Freestyle)', visual: { type: 'text', content: 'Cool Style', fontFamily: 'Freestyle Script, cursive', fontSize: '28px', color: '#EC4899', strokeColor: '#FFFFFF', strokeWidth: '1px' }, quality: 'neutral', points: 3 },
];


// Constants for Streamer Sensation Minigame
export const STREAMER_SENSATION_ENERGY_COST = 20;
export const STREAM_DURATION_SECONDS = 60; // Total duration of the stream mini-game
export const PROMPT_DEFAULT_DURATION_SECONDS = 7; // How long each prompt stays on screen
export const HYPE_METER_MAX = 100;
export const HYPE_METER_INITIAL = 50;
export const HYPE_METER_MIN_THRESHOLD_FAIL = 25; // If hype drops below this, stream fails
export const HYPE_DECAY_RATE_PER_SECOND = 1; // Hype points lost per second naturally
export const MAX_STREAM_BONUS_MULTIPLIERS = {
  views: 1.20, // Max 20% views boost
  subs: 1.15,  // Max 15% subs boost
  money: 1.10  // Max 10% money boost
};

export const PREDEFINED_STREAM_PROMPTS: StreamPrompt[] = [
  // Quick Click Prompts
  { id: 'qc1', type: 'QUICK_CLICK', displayText: "¡Nuevo SUB! ¡Salúdalo!", data: { buttonText: "¡Hola Sub!" }, durationSeconds: 5, pointsForSuccess: 12, pointsForFailure: -8 },
  { id: 'qc2', type: 'QUICK_CLICK', displayText: "¡Alguien envió una DONACIÓN! ¡Agradécele!", data: { buttonText: "¡Gracias por la Donación!" }, durationSeconds: 5, pointsForSuccess: 15, pointsForFailure: -7 },
  { id: 'qc3', type: 'QUICK_CLICK', displayText: "¡El chat está ENCENDIDO! ¡Anímate!", data: { buttonText: "¡Vamos Equipo!" }, durationSeconds: 6, pointsForSuccess: 10, pointsForFailure: -5 },
  { id: 'qc4', type: 'QUICK_CLICK', displayText: "¡Momento ÉPICO! ¡Reacciona!", data: { buttonText: "¡Increíble!" }, durationSeconds: 5, pointsForSuccess: 13, pointsForFailure: -6 },

  // Keyword Type Prompts
  { id: 'kw1', type: 'KEYWORD_TYPE', displayText: "El chat quiere saber sobre el 'SORTEO'", data: { keyword: "SORTEO", placeholder: "Escribe la palabra clave..." }, durationSeconds: 8, pointsForSuccess: 15, pointsForFailure: -10 },
  { id: 'kw2', type: 'KEYWORD_TYPE', displayText: "¡Anuncia la 'EXCLUSIVA'!", data: { keyword: "EXCLUSIVA", placeholder: "Escribe la palabra clave..." }, durationSeconds: 7, pointsForSuccess: 14, pointsForFailure: -9 },
  { id: 'kw3', type: 'KEYWORD_TYPE', displayText: "Comparte el código 'PROMO123'", data: { keyword: "PROMO123", placeholder: "Escribe el código..." }, durationSeconds: 10, pointsForSuccess: 18, pointsForFailure: -12 },
  { id: 'kw4', type: 'KEYWORD_TYPE', displayText: "Preguntan por la 'GUIA'", data: { keyword: "GUIA", placeholder: "Escribe la palabra clave..." }, durationSeconds: 8, pointsForSuccess: 13, pointsForFailure: -8 },

  // Emoji Select Prompts
  { id: 'em1', type: 'EMOJI_SELECT', displayText: "¡El chat está feliz! Reacciona:", data: { emojis: ['🥳', '😢', '😠'], correctEmoji: '🥳' }, durationSeconds: 6, pointsForSuccess: 10, pointsForFailure: -5 },
  { id: 'em2', type: 'EMOJI_SELECT', displayText: "¡Algo gracioso pasó! Reacciona:", data: { emojis: ['😂', '🤔', '😱'], correctEmoji: '😂' }, durationSeconds: 6, pointsForSuccess: 12, pointsForFailure: -6 },
  { id: 'em3', type: 'EMOJI_SELECT', displayText: "¡Muestra tu apoyo! Reacciona:", data: { emojis: ['👍', '👎', '🤷'], correctEmoji: '👍' }, durationSeconds: 5, pointsForSuccess: 11, pointsForFailure: -5 },
  { id: 'em4', type: 'EMOJI_SELECT', displayText: "¡Sorpresa en el chat! Reacciona:", data: { emojis: ['😮', '😴', '😐'], correctEmoji: '😮' }, durationSeconds: 6, pointsForSuccess: 12, pointsForFailure: -7 },
];
