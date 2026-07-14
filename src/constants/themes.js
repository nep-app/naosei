// Temas fixos do fórum (estilo "subreddits"). A etiqueta vem do i18n: themes.<key>.
// NOTA: as CHAVES internas mantêm-se estáveis (ex.: 'reduzir') mesmo que o nome
// visível mude, para não partir publicações antigas. Só muda a etiqueta no i18n.
export const FORUM_THEMES = ['avisos', 'reduzir', 'recaidas', 'vitorias', 'apoio', 'duvidas', 'geral', 'app'];

// Canais onde só moderadores podem publicar (toda a gente lê).
export const MOD_ONLY_THEMES = ['avisos'];

export const THEME_EMOJI = {
  avisos: '📢',
  reduzir: '🎛️', // etiqueta visível: "Gerir"
  recaidas: '🌧️', // etiqueta visível: "Momentos difíceis"
  vitorias: '🎉',
  apoio: '🤝',
  duvidas: '❓',
  geral: '💬',
  app: '📱',
};
