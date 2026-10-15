/**
 * Emergency and crisis detection, the same patterns the website's help chat uses (src/app.js), in English and
 * Spanish. Everything runs on the phone: a match shows 911 or 988 right away, before anything is sent anywhere.
 */

/** Lowercase, without accents, so "daño" and "dano" match the same way. */
export function plain(text: string): string {
  let out = String(text).toLowerCase();
  try {
    out = out.normalize('NFD').replace(/[̀-ͯ]/g, '');
  } catch {
    // normalize() unavailable: the explicit map below still covers Spanish.
  }
  return out
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[’‘]/g, "'");
}

export const EMERGENCY = /\b(chest pain|chest pressure|heart attack|can'?t breathe|cannot breathe|trouble breathing|difficulty breathing|short(ness)? of breath|stroke|face (is )?drooping|slurred speech|overdos(e|ed|ing)|poisoned|poisoning|severe bleeding|bleeding (heavily|a lot)|won'?t stop bleeding|anaphyla\w*|throat (is )?(closing|swelling)|unconscious|passed out|seizure|seizing|dolor (de|en el) pecho|presion en el pecho|ataque (al|del) corazon|infarto|no puedo respirar|me cuesta respirar|dificultad para respirar|me falta el aire|falta de aire|derrame cerebral|embolia|cara caida|habla arrastrada|sobredosis|envenenad[oa]s?|envenenamiento|sangrado (abundante|fuerte|que no para)|no para de sangrar|hemorragia|se me (cierra|hincha) la garganta|inconsciente|me desmaye|se desmayo|desmayad[oa]|convulsion\w*|convulsionando)\b/;

export const CRISIS = /\b(suicid\w*|kill(ing)? myself|end(ing)? my life|end it all|want(ing)? to die|wanna die|self[- ]?harm\w*|hurt(ing)? myself|cut(ting)? myself|(don'?t|do not) want to (live|be alive)|better off dead|matarme|me quiero matar|quitarme la vida|acabar con mi vida|quiero morir(me)?|me quiero morir|no quiero vivir|no quiero seguir viviendo|hacerme dano|lastimarme|cortarme|autolesion\w*|mejor muert[oa])\b/;

export type Risk = 'crisis' | 'emergency' | null;

/** Crisis is checked first: someone in crisis needs 988, and the reply also mentions 911. */
export function classify(text: string): Risk {
  const p = plain(text);
  if (CRISIS.test(p)) return 'crisis';
  if (EMERGENCY.test(p)) return 'emergency';
  return null;
}

/** Symptoms in the check-in that call for the 911 reminder. */
export const RED_FLAG_SYMPTOMS = ['chest_pain', 'breath'] as const;
