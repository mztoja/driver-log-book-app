/**
 * Przyciski w sekcjach z tłem (ImageBackground) na home dziedziczą opacity całego tła
 * (0.5 w trybie ciemnym) oraz własne 0.9. Przyciski poza tymi sekcjami muszą mieć tę samą
 * wypadkową przezroczystość, inaczej wyglądają na wyraźnie jaśniejsze.
 */
export const homeImageOpacity = (theme: string) => (theme === 'dark' ? 0.5 : 1);
export const homeButtonOpacity = (theme: string) => homeImageOpacity(theme) * 0.9;
