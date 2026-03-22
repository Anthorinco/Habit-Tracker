export interface Modelo {
  lista: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}
