import { Commentary } from '../commentary/commentary';
import { Rating } from '../rating/rating';

export interface Episode {
    
  id: number;
  title: string;
  description: string;
  publicationDate: string; // LocalDateTime as ISO string
  views: number;
  imageUrl?: string;
  season: number;
  chapter: number;
  audioPath: string;
  duration: string; // Duration as ISO-8601 duration string (e.g., "PT1H30M")
  createdAt: string; // LocalDateTime as ISO string
  commentaries?: Commentary[];
  ratings?: Rating[];

}
