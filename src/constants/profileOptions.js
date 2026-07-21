// Opções pré-feitas para o perfil (redução de danos). Guardadas como chaves;
// as etiquetas visíveis vêm do i18n (doc.<key> e roa.<key>).

// Substância(s) de eleição (Drug of Choice)
export const DOC_OPTIONS = [
  'mdma', 'cocaina', 'crack', 'anfetaminas', 'metanfetamina',
  'cannabis', 'canabinoides', 'ketamina', 'lsd', 'cogumelos',
  'dmt', '2cb', 'nbome', 'mescalina', 'ghb',
  'opioides', 'heroina', 'benzo', 'catinonas', 'nps',
  'poppers', 'nitroso', 'salvia', 'alcool', 'tabaco', 'outra',
];

// Via(s) de administração (Route of Administration)
export const ROA_OPTIONS = [
  'oral', 'sublingual', 'insuflado', 'fumado', 'vaporizado', 'injetado', 'retal', 'outra',
];

// Motivos ("o que te traz aqui") — escolha múltipla
export const REASON_OPTIONS = ['apoio', 'partilhar', 'duvidas', 'ajudar', 'ler'];
