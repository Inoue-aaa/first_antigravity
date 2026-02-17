export interface AnimalSticker {
  id: string;
  name: string;
  src: string;
}

export const ANIMAL_STICKERS: AnimalSticker[] = [
  { id: "fox", name: "Fox", src: "/animals/fox.png" },
  { id: "wolf", name: "Wolf", src: "/animals/wolf.png" },
  { id: "squirrel", name: "Squirrel", src: "/animals/squirrel.png" },
  { id: "hamster", name: "Hamster", src: "/animals/hamster.png" },
  { id: "hedgehog", name: "Hedgehog", src: "/animals/hedgehog.png" },
  { id: "owl", name: "Owl", src: "/animals/owl.png" },
];

export function getAnimalById(animalId: string): AnimalSticker | undefined {
  return ANIMAL_STICKERS.find((animal) => animal.id === animalId);
}
