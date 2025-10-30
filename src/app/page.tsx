"use client";

import React, { useEffect, useState } from "react";
import ChromaGrid from '@/components/ui/ChromaGrid';
import Prism from "@/components/Prism";


import dynamic from "next/dynamic";

import { PersistedInput as UserInput} from "@/components/ui/inputHomePage";



//import ticketmaster_API from "../../lib/ticketmasterDiscoveryEndpoint";

//import  airportGET  from "../../lib/AirportEndpoint";
//import Weather from "../../lib/weatherEndpoint";
//import amadeusGet from "../../lib/AmadeusServer";

const MapView = dynamic(() => import("../../lib/MapView"), { ssr: false });

export default function Home() {

    const [ticketmasterData, setData] = useState<any[]>([]);
    const [chromaDisplay, setChromaGrid] = useState<any[]>([])
    return (
      
      <main className = 'scroll-smooth'>
        {/* Prism background: full-screen fixed canvas behind page content */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
              <Prism
              suspendWhenOffscreen={false} transparent={true} />
            </div>
        <section className="w-full flex flex-col items-center justify-center py-16">
          <h1 className="head_text text-center font-extrabold leading-tight sm:text-6xl">
            Discover and Plan:
            <br className="max-md:hidden" />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
              Adventure Awaits!
            </span>
          </h1>
          
        </section>

      {/* input component for the search bar on the home page. Using inputHomePage.tsx for search components */}
        <UserInput onResults={(data: any) => { 
          //Use onresult to wait for a result from inputHomePage from when the user enters a search 
          //data holds what ever the the user entered from the input of the search bar
          //change the ticketmaster data to feed it into the map component
          //this on result in partivular is making a call to the ticketmaster api and getting back event data
          //I am logging the venues of the events to see if I can get the address to plot on the map
          console.log(data); 
          console.log(data._embedded.events[0])
          
          //ONLY GRABBing ONE EVENT!!!!! DONT FORGET TO CHANGE THIS LATER 
          

          //once I get the data and I commpress all lists if there are multiple into one list using flatMap
          //I set the v state to the list of venues using set state. I then hoist the data to the top 
          //so that I can pass it to the map component as a prop to plot the venues on the map
          //I also added a check to see if there is no data back from ticketmaster to avoid errors
          //if there is no data back I set the state to a string that says "YOU GOT NOTHING BACK TRY AGAIN"

          setData(data)

          // --- minimal helpers ---
          //we might move these function outside of the tag
          //the return is too long and makes it hard to read

            const pickImage = (images?: any[]) => {
              if (!images || !images.length) return undefined;
              const byRatio = (r: string) => images.find((img) => img.ratio === r)?.url;
              return byRatio("16_9") || byRatio("3_2") || images.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;
            };
            const fallbackAvatar = (name: string) => {
              const initials = encodeURIComponent(
                name.split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2)
              );
              return `https://ui-avatars.com/api/?name=${initials}&background=111827&color=F9FAFB&size=256`;
            };

            const events = data?._embedded?.events ?? [];

            // build items for ChromaGrid (keeps your structure)
            const itemsForChroma = events.map((ev: any, i: number) => {
              const img =
                pickImage(ev.images) ||
                pickImage(ev?._embedded?.attractions?.[0]?.images) ||
                pickImage(ev?._embedded?.venues?.[0]?.images) ||
                fallbackAvatar(ev?.name ?? "EV");

              // very light subtitle and colors (rotate a few)
              const v = ev?._embedded?.venues?.[0];
              const place = [v?.name, [v?.city?.name, v?.state?.stateCode || v?.state?.name].filter(Boolean).join(", ")].filter(Boolean).join(", ");
              const when = ev?.dates?.start?.localDate || ev?.dates?.start?.dateTime;
              const subtitle = [when, place].filter(Boolean).join(" • ");

              const COLORS = [
                { border: "#3B82A6", grad: "linear-gradient(145deg, #3B82F6, #000)" },
                { border: "#10B981", grad: "linear-gradient(145deg, #10B981, #000)" },
                { border: "#F59E0B", grad: "linear-gradient(145deg, #F59E0B, #000)" },
                { border: "#EC4899", grad: "linear-gradient(145deg, #EC4899, #000)" },
              ];
              const palette = COLORS[i % COLORS.length];

              return {
                image: img,
                title: ev?.name ?? "Event",
                subtitle,
                handle: ev?.classifications?.[0]?.segment?.name ? `#${String(ev.classifications[0].segment.name).toLowerCase().replace(/\s+/g, "")}` : undefined,
                borderColor: palette.border,
                gradient: palette.grad,
                url: ev?.url,
              };
            });

            setChromaGrid(itemsForChroma);
          
        }} />


        <div className="block w-full h-[70vh] min-h-[420px] overflow-hidden sm:rounded-lg md:rounded-xl lg:rounded-2xl"
        >
          {/* map component to display the venues on the map. Using MapView for display and returning what MapView is showing. */}
            <MapView 
            //pass the venues state to the map component as a prop
            ticketmasterData={ticketmasterData}  />
        </div>
        <h1 className="text-center text-balance leading-tight text-4xl sm:text-5xl md:text-6xl font-extrabold">Events</h1>

        <section className="relative z-10 min-h-[620px] overflow-hidden">
          <ChromaGrid
            items={chromaDisplay.slice(0,35)}
            radius={300}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
          />
        </section>
      </main>
    );
}