// src/store/playerStore.ts
import { create } from 'zustand';
import { Audio } from 'expo-av';

interface PlayerState {
  sound: Audio.Sound | null;
  setSound: (sound: Audio.Sound | null) => void;
  currentTrack: any;
  setTrack: (track: any) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  sound: null,
  setSound: (sound) => set({ sound }),
  currentTrack: null,
  setTrack: (track) => set({ currentTrack: track }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
}));
