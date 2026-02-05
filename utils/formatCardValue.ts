export const formatCardValue = (card: string | number) => {
  const num = Number(card);
  if (Number.isNaN(num)) return card;
  return num.toLocaleString("de-DE"); // e.g. 1.000, 2.000.000
};
