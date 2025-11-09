
export interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  featured: boolean;
  content: string;
  tags: string[];
  externalUrl?: string;
}