import boardData from "@/data/board.json";
import type { BoardCategory, BoardMember } from "@/types/board";

export function getBoardMembers(): BoardMember[] {
  return [...(boardData as BoardMember[])].sort((a, b) => a.order - b.order);
}

export function getBoardMembersByCategory(
  category: BoardCategory,
): BoardMember[] {
  return getBoardMembers().filter((member) => member.category === category);
}

export function getBoardPresident(): BoardMember | undefined {
  return getBoardMembers().find((member) => member.category === "president");
}
