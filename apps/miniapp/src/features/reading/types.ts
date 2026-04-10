export type ReadingCard = {
  label: string;
  headline: string;
  body: string;
};

export type ReadingPreview = {
  title: string;
  summary: string;
  cards: ReadingCard[];
};
