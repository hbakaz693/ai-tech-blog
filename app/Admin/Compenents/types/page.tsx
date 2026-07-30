export type Status=="Publie"|"Brouillon";

export interface Article{
    id:string,
    title:string,
    slug:string,
    category:string,
    status: Status;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  reading_time: number;
};
//Les donnes qui doit change lors de remplir le formulaire 
export interface FormData{
title: string;
  slug: string;
  category: string;
  status: Status;
  content: string;
  excerpt: string;
  cover_image: string;
}