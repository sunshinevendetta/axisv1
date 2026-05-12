export type AudioMeta = {
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string;
};

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
  audioUrl: string;
  artworkUrl?: string;
  sketchIndex: number;
};
