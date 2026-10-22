// Limite de toppings por tamanho (null = ilimitado). Confirme o limite do S.
export const toppingLimits = { XS: 5, S: 6, M: null, L: null };

export const toppingGroups = [
  { id: "inside", de: "Im Açaí", pt: "Dentro do açaí" },
  { id: "top", de: "Obendrauf", pt: "Por cima" },
  { id: "extras", de: "Extras", pt: "Extras" },
];

// Para topping extra, adicione extraPrice: 1 (valor em euros por copo).
// O grupo "extras" só aparece quando tiver itens.
export const toppings = [
  { id: "oreo", group: "inside", de: "Oreo", pt: "Oreo" },
  { id: "knusperMuesli", group: "inside", de: "Knusper-Müsli", pt: "Knusper Muesli" },
  { id: "chocoMuesli", group: "inside", de: "Choco-Müsli", pt: "Choco Muesli" },
  { id: "chiaPudding", group: "inside", de: "Chia-Pudding", pt: "Chia Pudding" },
  { id: "mangoPuree", group: "inside", de: "Mango-Püree", pt: "Purê de manga" },
  { id: "maracujaCreme", group: "inside", de: "Maracujá-Creme", pt: "Creme de maracujá" },
  { id: "pacoca", group: "inside", de: "Paçoca", pt: "Paçoca" },
  { id: "milchpulver", group: "inside", de: "Milchpulver", pt: "Leite em pó" },
  // EXEMPLOS: confirme com a comanda
  { id: "granola", group: "top", de: "Granola", pt: "Granola" },
  { id: "erdbeere", group: "top", de: "Erdbeere", pt: "Morango" },
  { id: "banane", group: "top", de: "Banane", pt: "Banana" },
];