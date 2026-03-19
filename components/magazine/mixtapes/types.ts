export type Mixtape = {
  id: number;
  slug: string;
  episode: string;
  episodeNumber: number;
  title: string;
  artist: string;
  duration: string;
  date: string;
  description: string;
  tracklist: string[];
  tags: string[];
  color: string;
  accentColor: string;
  /** Grove-hosted MP3 URL */
  audioUrl: string;
  /** Index of the Hydra sketch to use (0–3) */
  sketchIndex: number;
};
