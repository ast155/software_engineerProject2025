"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GET_keyword from "@/lib/ticketmasterClient";

type PersistedInputProps = {
  onResults?: (data: any) => void;
};

export function PersistedInput({ onResults }: PersistedInputProps) {
  const [q, setQ] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load saved search 
  useEffect(() => {
    try {
      const storedKeyword = localStorage.getItem("tm-search-q");
      if (storedKeyword) setQ(storedKeyword);

      const storedLocation = localStorage.getItem("tm-search-keyword");
      if (storedLocation) setUserInput(storedLocation);
    } catch (error) {
      console.warn("LocalStorage load failed:", error);
    }
  }, []);

  // Save search 
  useEffect(() => {
    try {
      localStorage.setItem("tm-search-q", q);
      localStorage.setItem("tm-search-keyword", userInput);
    } catch (error) {
      console.warn("LocalStorage save failed:", error);
    }
  }, [q, userInput]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const keyword = q.trim();
    const location = userInput.trim();
    if (!keyword && !location) return;

    try {
      setLoading(true);
      const data = await GET_keyword(keyword, location);
      if (typeof onResults === "function") onResults(data);
    } catch (error: any) {
      setErr("Search failed: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-4xl mx-auto 
        flex flex-col sm:flex-row 
        items-center gap-4 p-4

        bg-white/10 backdrop-blur-xl 
        border border-white/20 
        shadow-[0_0_30px_rgba(255,255,255,0.1)]
        rounded-3xl
      "
    >

      {/* Keyword Input */}
      <Input
        className="
          w-full text-lg font-semibold
          rounded-2xl px-5 py-4
          bg-white/90 text-black 
          placeholder:text-neutral-500

          shadow-lg ring-1 ring-black/10 
          focus:ring-2 focus:ring-pink-400 
          transition-all duration-300
        "
        type="search"
        placeholder="Search an artist, event, or attraction"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Location Input */}
      <Input
        className="
          w-full text-lg font-semibold
          rounded-2xl px-5 py-4
          bg-white/90 text-black
          placeholder:text-neutral-500

          shadow-lg ring-1 ring-black/10 
          focus:ring-2 focus:ring-pink-400 
          transition-all duration-300
        "
        type="search"
        placeholder="Enter city or state (optional)"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />

      {/* Search Button */}
      <Button
        type="submit"
        disabled={loading}
        className="
          text-lg font-bold px-8 py-4 rounded-2xl
          bg-gradient-to-r from-pink-500 via-amber-300 to-orange-400
          text-black shadow-xl

          hover:scale-105 hover:shadow-[0_0_20px_rgba(255,200,200,0.6)]
          transition-all duration-300
        "
      >
        {loading ? "Searching…" : "Search"}
      </Button>

      {err && <span className="text-sm text-red-600">{err}</span>}
    </form>
  );
}

