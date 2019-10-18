export interface IPractice {
  id: string; // e.g. P100445
  address: string; // e.g. Bugginger Str. 87, 79114 Freiburg im Breisgau
  specialties: string[]; // a maximum of 3 specialties (see src/data/specialties.json)
}
