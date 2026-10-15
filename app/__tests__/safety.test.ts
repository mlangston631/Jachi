import { classify, plain } from '@/lib/safety';

describe('safety: crisis and emergency detection (same patterns as the website)', () => {
  test.each([
    'I want to die',
    "I've been thinking about suicide",
    'sometimes I think about killing myself',
    "I don't want to live anymore",
    'I keep cutting myself',
    'me quiero morir',
    'pienso en el suicidio',
    'quiero hacerme daño',
    'No quiero seguir viviendo',
  ])('crisis: %s', text => {
    expect(classify(text)).toBe('crisis');
  });

  test.each([
    'I have chest pain right now',
    "I can't breathe",
    'my face is drooping',
    'I think it was an overdose',
    'she passed out',
    'tengo dolor de pecho',
    'no puedo respirar',
    'creo que es un infarto',
    'se desmayó',
    'sangrado abundante',
  ])('emergency: %s', text => {
    expect(classify(text)).toBe('emergency');
  });

  test.each(['Do you treat UTIs?', 'How much will it cost?', '¿Necesito seguro médico?', 'I need a refill of my blood pressure medicine'])(
    'nothing flagged: %s',
    text => {
      expect(classify(text)).toBeNull();
    },
  );

  test('crisis wins when both appear', () => {
    expect(classify('chest pain and I want to die')).toBe('crisis');
  });

  test('plain() lowercases and strips Spanish accents', () => {
    expect(plain('DAÑO Corazón Desmayó')).toBe('dano corazon desmayo');
  });
});
