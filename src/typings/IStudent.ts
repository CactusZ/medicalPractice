export interface IStudent {
  id: string; // e.g. S3306109
  address: string; // e.g. Klarastraße 18, 79106 Freiburg im Breisgau
  alternativeAddress1?: string;
  alternativeAddress2?: string;
  hasCar: boolean;
  hasChildren: boolean;
  favoriteSpecialties: string[]; // a maximum of 3 specialties (see data/specialties.json)
}
