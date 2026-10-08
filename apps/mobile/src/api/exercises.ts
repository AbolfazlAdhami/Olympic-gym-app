import { apiFetch } from "./client";

export type Exercise = {
  id: string;
  name: string;
  slug: string;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  category: string | null;
  difficulty: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: {
    step: number;
    text: string;
  }[];
  images: {
    url: string;
    position: number;
  }[];
  translations: {
    language: string;
    name: string;
    description: string | null;
  }[];
  aliases: {
    language: string;
    alias: string;
  }[];
};

export type ExerciseListResponse = {
  data: Exercise[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function getExercises(page = 1, limit = 20) {
  return apiFetch<ExerciseListResponse>(`/api/v1/exercises?page=${page}&limit=${limit}`);
}
