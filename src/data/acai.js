export const baseOptions = [
  { id: "acai", de: "Açaí", pt: "Açaí" },
  { id: "frozenJoghurt", de: "Frozen Joghurt", pt: "Frozen Joghurt" },
  { id: "mix", de: "Mix", pt: "Mix" },
];

// Preços da comanda.
// included = toppings incluídos (null = todos incluídos)
// extraPrice = preço de cada topping além dos incluídos
export const acaiSizes = [
  { id: "XS", price: 8.5, included: 5, extraPrice: 0.5 },
  { id: "S", price: 9.5, included: 7, extraPrice: 0.5 },
  { id: "M", price: 11.5, included: null },
  { id: "L", price: 13.5, included: null },
];

// Bowl do dia: tamanho S, preço da comanda "Bowls des Tages"
export const dayBowlPrice = 8.5;

// RioCrunch Cup: só no tamanho M
export const crunchCup = { size: "M", price: 1.5 };

// Ajuste para os horários reais de retirada
export const pickupTimes = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

