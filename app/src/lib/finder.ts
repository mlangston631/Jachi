/** The care finder's answers, the same outcomes as the website's (src/app.js), as data the screen renders. */
import type { Key } from '@/i18n/core';
import { CONTENT } from './content';

export type Need = 'urgent' | 'refill' | 'mental' | 'sexual' | 'mens' | 'womens' | 'skin' | 'weight';
export type Flag = 'yes' | 'no' | 'unsure' | '';

export type Outcome = {
  kind: 'emergency' | 'crisis' | 'inperson' | 'caution' | 'likely';
  icon: string;
  title: Key;
  body: Key;
  extra?: Key;
  /** Service keys whose names show as chips. */
  chips?: string[];
  chipKeys?: Key[];
  launchNote?: boolean;
  /** What the main button does. */
  cta?: { type: 'call911' } | { type: 'join'; interest: string } | { type: 'services' } | { type: 'weight' };
};

export const QUESTION: Record<Exclude<Need, 'weight'>, { q: Key; unsure: boolean }> = {
  urgent: { q: 'finder.urgentQ', unsure: false },
  refill: { q: 'finder.refillQ', unsure: true },
  mental: { q: 'finder.mentalQ', unsure: false },
  sexual: { q: 'finder.sexualQ', unsure: true },
  mens: { q: 'finder.mensQ', unsure: true },
  womens: { q: 'finder.womensQ', unsure: false },
  skin: { q: 'finder.skinQ', unsure: false },
};


/** Waitlist interest values for each need, from the services' own values (the same as the website's form). */
const interestOf = (key: string) => CONTENT.services.find(sv => sv.key === key)?.interest ?? key;
const INTEREST: Record<Need, string> = {
  urgent: interestOf('urgent'),
  refill: interestOf('refill'),
  mental: `${interestOf('therapy')},${interestOf('mental')}`,
  sexual: interestOf('sexual'),
  mens: interestOf('mens'),
  womens: interestOf('womens'),
  skin: interestOf('skin'),
  weight: interestOf('weight'),
};

const match = (need: Need, icon: string, title: Key, body: Key, extra?: Key): Outcome => ({
  kind: 'likely', icon, title, body, extra, chips: [need], launchNote: true, cta: { type: 'join', interest: INTEREST[need] },
});

export function outcome(need: Need, flag: Flag): Outcome {
  switch (need) {
    case 'urgent':
      if (flag === 'yes') return { kind: 'emergency', icon: 'alert', title: 'site.f_urgent_911_title', body: 'site.f_urgent_911_body', cta: { type: 'call911' } };
      return match('urgent', 'thermo', 'site.f_urgent_title', 'site.f_urgent_body');
    case 'refill':
      if (flag === 'yes') return { kind: 'caution', icon: 'alert', title: 'site.f_refill_controlled_title', body: 'site.f_refill_controlled_body', cta: { type: 'services' } };
      if (flag === 'unsure') return match('refill', 'pill', 'site.f_refill_unsure_title', 'site.f_refill_unsure_body');
      return match('refill', 'pill', 'site.f_refill_title', 'site.f_refill_body');
    case 'mental':
      if (flag === 'yes') return { kind: 'crisis', icon: 'heart', title: 'site.f_crisis_title', body: 'site.f_crisis_body' };
      return {
        kind: 'likely', icon: 'mind', title: 'site.f_mental_title', body: 'site.f_mental_body',
        chipKeys: ['site.f_mental_chip_therapy', 'site.f_mental_chip_meds'], launchNote: true, cta: { type: 'join', interest: INTEREST.mental },
      };
    case 'sexual':
      if (flag === 'yes') return { kind: 'inperson', icon: 'alert', title: 'site.f_sexual_pep_title', body: 'site.f_sexual_pep_body' };
      return match('sexual', 'heart', 'site.f_sexual_title', 'site.f_sexual_body', flag === 'unsure' ? 'site.f_sexual_unsure' : undefined);
    case 'mens':
      if (flag === 'yes') return { kind: 'caution', icon: 'alert', title: 'site.f_mens_nitrates_title', body: 'site.f_mens_nitrates_body', cta: { type: 'join', interest: INTEREST.mens } };
      return match('mens', 'male', 'site.f_mens_title', 'site.f_mens_body', flag === 'unsure' ? 'site.f_mens_unsure' : undefined);
    case 'womens':
      if (flag === 'yes') return { kind: 'inperson', icon: 'alert', title: 'site.f_inperson_title', body: 'site.f_womens_inperson_body' };
      return match('womens', 'female', 'site.f_womens_title', 'site.f_womens_body');
    case 'skin':
      if (flag === 'yes') return { kind: 'inperson', icon: 'alert', title: 'site.f_inperson_title', body: 'site.f_skin_inperson_body' };
      return match('skin', 'drop', 'site.f_skin_title', 'site.f_skin_body');
    case 'weight':
      return { kind: 'likely', icon: 'scale', title: 'site.f_weight_title', body: 'site.f_weight_body', chips: ['weight'], cta: { type: 'weight' } };
  }
}

