// USA-wide Ticketmaster search
// Supports artists, sports, comedy, attractions, and all events
// Always returns events with venue (required for map + weather)

export default async function GET_keyword(keyword: string, location?: string) {
  const apiKey = "AxXbvSaSd0AFFgqMUj0HpY9aMp1HIrTx";

  const kw = (keyword || "").trim();
  const loc = (location || "").trim();

  // Helper to build query params
  const buildParams = (params: any) => {
    const p = new URLSearchParams({
      apikey: apiKey,
      countryCode: "US",
      size: "200",
      sort: "date,asc",
    });

    Object.entries(params).forEach(([key, val]) => {
      if (val) p.append(key, val as string);
    });

    return p.toString();
  };

  // Parse location string
  let locationFilters: any = {};

  if (loc) {
    const isState = /^[A-Za-z]{2}$/i.test(loc);
    const hasComma = loc.includes(",");

    const [cityPart, statePart] = hasComma
      ? loc.split(",").map((x) => x.trim())
      : [loc, ""];

    if (hasComma && cityPart && statePart) {
      locationFilters.city = cityPart;
      locationFilters.stateCode = statePart.toUpperCase();
    } else if (isState) {
      locationFilters.stateCode = loc.toUpperCase();
    } else {
      locationFilters.city = loc;
    }
  }

  // Ensure venue has latitude & longitude (needed for Map + Weather)
  const hasVenue = (ev: any) =>
    ev?._embedded?.venues?.[0]?.location?.latitude &&
    ev?._embedded?.venues?.[0]?.location?.longitude;

  // MAIN SEARCH: keyword + location
  const localURL = `https://app.ticketmaster.com/discovery/v2/events.json?${buildParams(
    {
      keyword: kw || undefined,
      classificationName:
        "music,sports,arts,theatre,comedy,family,miscellaneous",
      ...locationFilters,
    }
  )}`;

  console.log("LOCAL SEARCH:", localURL);

  try {
    const localRes = await fetch(localURL, { cache: "no-store" });
    const localData = await localRes.json();
    let localEvents = localData?._embedded?.events || [];

    localEvents = localEvents.filter(hasVenue);

    // If events found locally (with venue), return that
    if (localEvents.length > 0) {
      return {
        ...localData,
        _embedded: { events: localEvents },
        searchKeyword: kw,
        searchLocation: loc,
      };
    }

    // SECOND SEARCH: Attraction (Artist / Team)
    if (kw) {
      const attrURL = `https://app.ticketmaster.com/discovery/v2/attractions.json?${buildParams(
        { keyword: kw }
      )}`;

      console.log("ATTRACTION SEARCH:", attrURL);

      const attrRes = await fetch(attrURL, { cache: "no-store" });
      const attrData = await attrRes.json();
      const attractions = attrData?._embedded?.attractions || [];

      if (attractions.length > 0) {
        const artist = attractions[0];

        // Get all events for that artist nationwide
        const artistEventURL = `https://app.ticketmaster.com/discovery/v2/events.json?${buildParams(
          { attractionId: artist.id }
        )}`;

        console.log("ARTIST EVENT SEARCH:", artistEventURL);

        const artistEventRes = await fetch(artistEventURL, {
          cache: "no-store",
        });
        const artistEventData = await artistEventRes.json();
        let artistEvents = artistEventData?._embedded?.events || [];

        artistEvents = artistEvents.filter(hasVenue);

        if (artistEvents.length > 0) {
          return {
            ...artistEventData,
            _embedded: { events: artistEvents },
            searchKeyword: kw,
            searchLocation: loc,
          };
        }
      }
    }

    // No events found anywhere
    return {
      _embedded: { events: [] },
      searchKeyword: kw,
      searchLocation: loc,
    };
  } catch (err: any) {
    console.log("Ticketmaster error:", err);

    return {
      error: err?.message || "Search failed",
      _embedded: { events: [] },
      searchKeyword: kw,
      searchLocation: loc,
    };
  }
}
