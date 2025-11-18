// USA-wide Ticketmaster search
// Always returns events with venue (for map + weather)

export default async function GET_keyword(keyword: string, location?: string) {
  const apiKey = "AxXbvSaSd0AFFgqMUj0HpY9aMp1HIrTx";

  const kw = (keyword || "").trim();
  const loc = (location || "").trim();

  // Build search params
  const buildParams = (params: any) => {
    const p = new URLSearchParams({
      apikey: apiKey,
      countryCode: "US",
      size: "200",
      sort: "date,asc",
    });
    Object.entries(params).forEach(([k, v]) => v && p.append(k, v as string));
    return p.toString();
  };

  // Location detection
  let locationFilters: any = {};
  if (loc) {
    const isState = /^[A-Za-z]{2}$/i.test(loc);
    const hasComma = loc.includes(",");
    const [city, state] = hasComma
      ? loc.split(",").map((s) => s.trim())
      : [loc, ""];

    if (hasComma && city && state) {
      locationFilters.city = city;
      locationFilters.stateCode = state.toUpperCase();
    } else if (isState) {
      locationFilters.stateCode = loc.toUpperCase();
    } else {
      locationFilters.city = loc;
    }
  }

  // Check for venue
  const hasVenue = (ev: any) =>
    ev?._embedded?.venues?.[0]?.location?.latitude &&
    ev?._embedded?.venues?.[0]?.location?.longitude;

  // Main event search (keyword + location)
  const localURL = `https://app.ticketmaster.com/discovery/v2/events.json?${buildParams({
    keyword: kw || undefined,
    classificationName:
      "music,sports,arts,theatre,comedy,family,miscellaneous",
    ...locationFilters,
  })}`;

  console.log("LOCAL SEARCH:", localURL);

  try {
    const localRes = await fetch(localURL, { cache: "no-store" });
    const localData = await localRes.json();
    let localEvents = localData?._embedded?.events || [];

    // Keep only events with venue
    localEvents = localEvents.filter(hasVenue);

    if (localEvents.length > 0) {
      return {
        ...localData,
        _embedded: { events: localEvents },
        searchKeyword: kw,
        searchLocation: loc,
      };
    }

    // Attraction search (artist/team)
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

        // Get all events for the artist nationwide
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

    // No results
    return {
      _embedded: { events: [] },
      searchKeyword: kw,
      searchLocation: loc,
    };
  } catch (err: any) {
    console.log("Error:", err);
    return {
      error: err?.message || "Search failed",
      _embedded: { events: [] },
      searchKeyword: kw,
      searchLocation: loc,
    };
  }
}





