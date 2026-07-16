// Contrato compartilhado entre os componentes de lista simples.
export interface Modelo {
  lista: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}
