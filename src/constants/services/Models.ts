export type Song = {
  id: string
  title: string
  artist: string
  image: string
  audioUrl: string
}


export type Album = {
  id: string
  title: string
  artist: string
  image: string
  releaseDate: string
  zipUrl: string
  shareUrl: string
}


export type Artist = {
  id: string
  name: string
  image: string
  joinDate: string
  profileUrl: string
}


export type Radio = {
  id: number;
  name: string;
  dispname: string;
  type: string;
  image: string;
};
