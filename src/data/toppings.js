// Grupos e preços conforme a comanda.
// price = valor cobrado por cada item do grupo.
export const toppingGroups = [
  { id: "inside", de: "Mittendrin", pt: "Dentro do açaí" },
  { id: "top", de: "Oben", pt: "Por cima" },
  { id: "premium", de: "Premium", pt: "Premium", price: 0.5 },
  { id: "sauce", de: "Soßen (maximal 2)", pt: "Caldas (no máximo 2)" },
  { id: "extra", de: "Extra", pt: "Extra", price: 1 },
];

export const toppings = [
  // Mittendrin
  { id: "schokoMuesli", group: "inside", de: "Schoko-Müsli", pt: "Muesli de chocolate" },
  { id: "knusperMuesli", group: "inside", de: "Knusper-Müsli", pt: "Knusper Muesli" },
  { id: "fruchtMuesli", group: "inside", de: "Frucht-Müsli", pt: "Muesli de frutas" },
  { id: "biskuitCrumbs", group: "inside", de: "Biskuit-Crumbs", pt: "Farelo de biscoito" },
  { id: "kokosraspeln", group: "inside", de: "Kokosraspeln", pt: "Coco ralado" },
  { id: "miniBrezel", group: "inside", de: "Mini-Brezel", pt: "Mini pretzel" },
  { id: "cashewkerne", group: "inside", de: "Cashewkerne", pt: "Castanha de caju" },
  { id: "kitKat", group: "inside", de: "Kit Kat", pt: "Kit Kat" },
  { id: "oreo", group: "inside", de: "Oreo", pt: "Oreo" },
  { id: "pacoca", group: "inside", de: "Paçoca", pt: "Paçoca" },
  { id: "erdnusscrunchy", group: "inside", de: "Erdnusscrunchy", pt: "Amendoim crocante" },
  { id: "kondensmilch", group: "inside", de: "Kondensmilch", pt: "Leite condensado" },
  { id: "leinsamen", group: "inside", de: "Leinsamen", pt: "Linhaça" },
  { id: "chiaSamen", group: "inside", de: "Chia Samen", pt: "Sementes de chia" },
  { id: "naturjoghurt", group: "inside", de: "Naturjoghurt", pt: "Iogurte natural" },
  { id: "mangopuree", group: "inside", de: "Mangopüree", pt: "Purê de manga" },
  { id: "chiaPudding", group: "inside", de: "Chia-Pudding", pt: "Pudim de chia" },
  { id: "maracujacreme", group: "inside", de: "Maracujacreme", pt: "Creme de maracujá" },

  // Oben
  { id: "banane", group: "top", de: "Banane", pt: "Banana" },
  { id: "blaubeeren", group: "top", de: "Blaubeeren", pt: "Mirtilo" },
  { id: "erdbeeren", group: "top", de: "Erdbeeren", pt: "Morango" },
  { id: "cranberry", group: "top", de: "Cranberry", pt: "Cranberry" },
  { id: "haselnuesse", group: "top", de: "Haselnüsse", pt: "Avelã" },
  { id: "smarties", group: "top", de: "Smarties", pt: "Smarties" },
  { id: "kakaonibs", group: "top", de: "Kakaonibs", pt: "Nibs de cacau" },
  { id: "schokoraspeln", group: "top", de: "Schokoraspeln", pt: "Raspas de chocolate" },
  { id: "weisseSchokoraspeln", group: "top", de: "Weiße Schokoraspeln", pt: "Raspas de chocolate branco" },

  // Premium (+€0,50)
  { id: "erdnussCreme", group: "premium", de: "Erdnuss Creme", pt: "Creme de amendoim" },
  { id: "pacocaDiet", group: "premium", de: "Paçoca diet", pt: "Paçoca diet" },
  { id: "milchpulver", group: "premium", de: "Milchpulver", pt: "Leite em pó" },
  { id: "pistazieCreme", group: "premium", de: "Pistazie Creme", pt: "Creme de pistache" },
  { id: "nutella", group: "premium", de: "Nutella", pt: "Nutella" },
  { id: "kokosnusscreme", group: "premium", de: "Kokosnusscreme", pt: "Creme de coco" },
  { id: "buenosimoCreme", group: "premium", de: "Buenosimo Creme", pt: "Creme Buenosimo" },
  { id: "vollmilchcreme", group: "premium", de: "Vollmilchcreme", pt: "Creme de chocolate ao leite" },
  { id: "weisseSchoko", group: "premium", de: "Weiße Schoko", pt: "Chocolate branco" },
  { id: "karamellKeksSosse", group: "premium", de: "Karamell-Keks-Soße", pt: "Calda de caramelo com biscoito" },
  { id: "warmeSchoko", group: "premium", de: "Warme Schoko", pt: "Chocolate quente" },
  { id: "warmeWeisseSchoko", group: "premium", de: "Warme weiße Schoko (oben)", pt: "Chocolate branco quente (por cima)" },

  // Soßen (máximo 2)
  { id: "erdnussbutterSosse", group: "sauce", de: "Erdnussbuttersoße", pt: "Calda de pasta de amendoim" },
  { id: "kondensmilchSosse", group: "sauce", de: "Kondensmilch", pt: "Leite condensado" },
  { id: "schokoladensosse", group: "sauce", de: "Schokoladensoße", pt: "Calda de chocolate" },
  { id: "erdbeersosse", group: "sauce", de: "Erdbeersoße", pt: "Calda de morango" },
  { id: "himbeersosse", group: "sauce", de: "Himbeersoße", pt: "Calda de framboesa" },
  { id: "honig", group: "sauce", de: "Honig", pt: "Mel" },

  // Extra (+€1,00)
  { id: "wheyProtein", group: "extra", de: "Whey-Protein", pt: "Whey protein" },

  // Só aparece dentro das bowls do dia (não entra na lista de escolha)
  { id: "erdnussbutter", group: "bowl", de: "Erdnussbutter", pt: "Pasta de amendoim" },
];

// Bowls des Tages (tamanho S). Apague as que não estiverem disponíveis.
// Bowls des Tages: uma por dia da semana (1 = segunda ... 5 = sexta)
export const dayBowls = [
  {
    id: "barra",
    name: "Barra",
    weekday: 1,
    toppings: ["chiaPudding", "biskuitCrumbs", "mangopuree", "kondensmilch", "erdbeeren", "banane"],
  },
  {
    id: "leblon",
    name: "Leblon",
    weekday: 2,
    toppings: ["maracujacreme", "knusperMuesli", "kondensmilch", "erdbeeren"],
  },
  {
    id: "leme",
    name: "Leme",
    weekday: 3,
    toppings: ["wheyProtein", "erdnussbutter", "erdnusscrunchy", "banane", "kakaonibs"],
  },
  {
    id: "urca",
    name: "Urca",
    weekday: 4,
    toppings: ["oreo", "erdnusscrunchy", "kondensmilch", "milchpulver"],
  },
  {
    id: "buzios",
    name: "Buzios",
    weekday: 5,
    toppings: ["nutella", "schokoMuesli", "oreo", "erdbeeren", "schokoraspeln"],
  },
];