export interface LivatinoWinner {
  edition: number;
  season: string;
  year: number;
  name: string;
  section: string;
  image: string;
}

export interface LivatinoData {
  title: string;
  subtitle: string;
  judgeImage: string;
  judgeCaption: string;
  quote: {
    text: string;
    author: string;
  };
  description: string[];
  winners: LivatinoWinner[];
}

export interface TraditionalWinner {
  season: string;
  year: number;
  name: string;
  image?: string | null;
  unassigned?: boolean;
  note?: string;
}

export interface TraditionalAward {
  id: string;
  name: string;
  category: string;
  dedicatedTo: string;
  criteria: string;
  historicalImage?: string;
  isPersonal: boolean;
  winners: TraditionalWinner[];
}

export interface AwardsData {
  livatino: LivatinoData;
  traditional: TraditionalAward[];
}
