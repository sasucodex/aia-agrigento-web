export type BoardCategory =
  | "president"
  | "executive"
  | "referent"
  | "collaborator";

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  category: BoardCategory;
  order: number;
  image: string;
}
