/**
 * @fileOverview Detecta si la descripción de una imagen sugiere contenido erótico o inapropiado.
 *
 * - detectContent - Función que maneja el análisis de la descripción de la imagen.
 * - DetectContentInput - El tipo de entrada para la función detectContent.
 * - DetectContentOutput - El tipo de retorno para la función detectContent.
 */

// Simple client-side content detection without server actions
export interface DetectContentInput {
  imageDescription: string;
}

export interface DetectContentOutput {
  isInappropriate: boolean;
  confidence: number;
  reason: string;
}

// Inappropriate content keywords (more comprehensive list)
const inappropriateKeywords = [
  // Spanish terms
  'desnudo', 'desnuda', 'pornografia', 'porno', 'sexo', 'erotico', 'erotica',
  'masturbacion', 'masturbandose', 'orgasmo', 'penetracion', 'fellatio', 'cunnilingus',
  'bondage', 'bdsm', 'fetiche', 'fetish', 'lenceria', 'bikini', 'tanga', 'sujetador',
  'pechos', 'senos', 'vagina', 'penis', 'genital', 'nalgas', 'trasero', 'culo',
  'prostituta', 'escort', 'stripper', 'webcam', 'cam', 'onlyfans', 'chaturbate',
  
  // English terms
  'nude', 'naked', 'porn', 'pornography', 'sex', 'erotic', 'masturbation',
  'orgasm', 'penetration', 'fellatio', 'cunnilingus', 'bondage', 'bdsm', 'fetish',
  'lingerie', 'bikini', 'thong', 'bra', 'breasts', 'boobs', 'vagina', 'penis',
  'genital', 'buttocks', 'ass', 'prostitute', 'escort', 'stripper', 'webcam',
  'cam', 'adult', 'xxx', 'explicit', 'intimate', 'sexual', 'sensual',
  
  // Site names
  'pornhub', 'xvideos', 'redtube', 'youporn', 'tube8', 'xhamster', 'spankbang',
  'chaturbate', 'cam4', 'myfreecams', 'onlyfans', 'manyvids', 'clips4sale'
];

// Suspicious phrases that might indicate inappropriate content
const suspiciousPhrases = [
  'sin ropa', 'sin vestimenta', 'cuerpo desnudo', 'partes intimas', 'acto sexual',
  'contenido adulto', 'solo para adultos', 'mayores de edad', 'contenido explicito',
  'without clothes', 'naked body', 'private parts', 'sexual act', 'adult content',
  'adults only', 'explicit content', 'intimate moment', 'sexual position'
];

export async function detectContent(input: DetectContentInput): Promise<DetectContentOutput> {
  const description = input.imageDescription.toLowerCase();
  
  // Check for explicit keywords
  let foundKeywords: string[] = [];
  let foundPhrases: string[] = [];
  
  for (const keyword of inappropriateKeywords) {
    if (description.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }
  
  for (const phrase of suspiciousPhrases) {
    if (description.includes(phrase.toLowerCase())) {
      foundPhrases.push(phrase);
    }
  }
  
  // Calculate confidence based on findings
  let confidence = 0;
  let isInappropriate = false;
  let reasons: string[] = [];
  
  if (foundKeywords.length > 0) {
    isInappropriate = true;
    confidence = Math.min(0.9, 0.3 + (foundKeywords.length * 0.2));
    reasons.push(`Palabras clave inapropiadas detectadas: ${foundKeywords.join(', ')}`);
  }
  
  if (foundPhrases.length > 0) {
    isInappropriate = true;
    confidence = Math.max(confidence, Math.min(0.8, 0.4 + (foundPhrases.length * 0.15)));
    reasons.push(`Frases sospechosas detectadas: ${foundPhrases.join(', ')}`);
  }
  
  // Additional heuristics for suspicious patterns
  const suspiciousPatterns = [
    /\b(18\+|adult|nsfw|not safe for work)\b/i,
    /\b(only fans|onlyfans|webcam|cam show)\b/i,
    /\b(strip|stripping|undress|undressing)\b/i,
    /\b(bedroom|bed|shower|bathroom)\b/i && /\b(naked|nude|undressed)\b/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(description)) {
      isInappropriate = true;
      confidence = Math.max(confidence, 0.6);
      reasons.push('Patrones sospechosos detectados en el contenido');
      break;
    }
  }
  
  // Fallback: if no explicit content found but description is very short or vague
  if (!isInappropriate && description.length < 20) {
    confidence = 0.3;
    reasons.push('Descripción muy breve o vaga, requiere verificación manual');
  }
  
  const reason = reasons.length > 0 ? reasons.join('. ') : 'Contenido analizado sin detectar elementos inapropiados';
  
  return {
    isInappropriate,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
    reason
  };
}
