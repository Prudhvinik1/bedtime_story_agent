"use client";

import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  ChevronLeft,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const STORY_TITLE = "The Quiet Bear";
const TOTAL_SECONDS = 5 * 60;

const storyParagraphs = [
  "At the edge of a pine forest, where the wind moved softly through silver leaves, a small bear named Alder watched the sky turn from gold to deep blue.",
  "Alder was brave in the daylight, but when night arrived, the forest sounded larger than before. Every rustle felt important. Every shadow felt alive.",
  "So Alder sat beside the old stone path and listened. Far away, an owl hummed once, then twice. A stream answered in a gentle rhythm. A branch sighed, and then was still.",
  "Slowly, Alder noticed something new: the forest was not loud at all. It was careful. It was kind. It made room for quiet hearts to rest.",
  "Alder took a long breath, folded their paws, and smiled into the moonlit dark. The night, they realized, was simply another way the world whispered goodnight.",
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function NowPlayingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(84);
  const [volume, setVolume] = useState(72);

  const progressPct = useMemo(
    () => (currentSeconds / TOTAL_SECONDS) * 100,
    [currentSeconds]
  );

  return (
    <div className="min-h-screen bg-[#F9F9F8] transition-all duration-300 ease-in-out">
      <header
        className="sticky top-0 z-40 border-b border-[#e7e5e4] bg-white/90 backdrop-blur-md transition-all duration-300 ease-in-out"
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#78716C] transition-all duration-300 ease-in-out hover:bg-[#f3f2f1]"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h1
            className={`${merriweather.className} text-center text-lg text-[#1C1917] sm:text-xl`}
          >
            {STORY_TITLE}
          </h1>

          <div className="h-10 w-10" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 pb-48 sm:pb-52">
        <article
          className={`${merriweather.className} space-y-6 text-lg leading-relaxed text-[#1C1917] transition-all duration-300 ease-in-out sm:text-xl`}
        >
          {storyParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </article>
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full px-0 pb-0 sm:px-4 sm:pb-4">
        <section
          className="mx-auto w-full max-w-3xl rounded-none border-t border-[#e7e5e4] bg-white bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out sm:rounded-[28px] sm:border"
          aria-label="Audio player controls"
        >
          <div className="px-4 pt-4 sm:px-6">
            <label htmlFor="progress" className="sr-only">
              Story playback progress
            </label>
            <input
              id="progress"
              type="range"
              min={0}
              max={TOTAL_SECONDS}
              value={currentSeconds}
              onChange={(e) => setCurrentSeconds(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d6d3d1] accent-[#C25E3E]"
              aria-valuetext={`${formatTime(currentSeconds)} elapsed`}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 sm:p-6">
            <p
              className="font-mono text-xs text-[#78716C] transition-all duration-300 ease-in-out sm:text-sm"
            >
              {formatTime(currentSeconds)} / {formatTime(TOTAL_SECONDS)}
            </p>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] transition-all duration-300 ease-in-out hover:bg-[#f5f5f4]"
                aria-label="Skip back 15 seconds"
                onClick={() =>
                  setCurrentSeconds((prev) => Math.max(0, prev - 15))
                }
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#C25E3E] text-white shadow-lg transition-all duration-300 ease-in-out hover:brightness-110"
                aria-label={isPlaying ? "Pause playback" : "Play playback"}
                onClick={() => setIsPlaying((prev) => !prev)}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] transition-all duration-300 ease-in-out hover:bg-[#f5f5f4]"
                aria-label="Skip forward 15 seconds"
                onClick={() =>
                  setCurrentSeconds((prev) => Math.min(TOTAL_SECONDS, prev + 15))
                }
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-end">
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] transition-all duration-300 ease-in-out hover:bg-[#f5f5f4]"
                    aria-label="Open volume controls"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    align="end"
                    sideOffset={12}
                    className="w-44 rounded-2xl border border-[#e7e5e4] bg-white p-4 text-[#1C1917] shadow-lg transition-all duration-300 ease-in-out"
                  >
                    <label htmlFor="volume" className="mb-3 block text-xs">
                      Volume
                    </label>
                    <input
                      id="volume"
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d6d3d1] accent-[#C25E3E]"
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
