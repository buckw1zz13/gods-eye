// God's Eye — Free API Proxy (Zero Keys Required)
// All APIs used are 100% free with no signup needed.
// Password is checked server-side — keys/password never exposed to frontend.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Pass",
  "Content-Type": "application/json",
};

const ok  = (data) => ({ statusCode: 200, headers: CORS, body: JSON.stringify(data) });
const err = (msg, code = 500) => ({ statusCode: code, headers: CORS, body: JSON.stringify({ error: msg }) });

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };

  // Password check
  const PASS = process.env.ACCESS_PASS || "4llSeing3ye";
  const supplied = event.headers["x-access-pass"] || event.queryStringParameters?.pass || "";
  if (supplied !== PASS) return err("Unauthorized", 401);

  const api    = event.queryStringParameters?.api || "";
  const params = event.queryStringParameters || {};

  try {

    // WEATHER — Open-Meteo (free, no key, unlimited)
    if (api === "weather") {
      const lat = params.lat || "14.5995";
      const lon = params.lon || "120.9842";
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,precipitation` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto`
      );
      const d = await res.json();
      return ok({ source: "open-meteo.com", free: true, lat, lon, current: d.current, units: d.current_units, daily: d.daily });
    }

    // FLIGHTS — OpenSky Network (free, no key, unlimited)
    if (api === "flights") {
      const { lamin="4", lomin="95", lamax="22", lomax="127" } = params;
      const res = await fetch(`https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);
      const d   = await res.json();
      const aircraft = (d.states || []).slice(0, 80).map(s => ({
        icao: s[0], callsign: (s[1] || "").trim(), origin: s[2],
        lon: s[5], lat: s[6], altitude_m: s[7], velocity_ms: s[9], heading: s[10], on_ground: s[8],
      }));
      return ok({ source: "opensky-network.org", free: true, time: d.time, count: aircraft.length, aircraft });
    }

    // CONFLICT NEWS — GDELT (free, no key, unlimited, updates every 15min)
    if (api === "conflict") {
      const q     = encodeURIComponent(params.q || "military conflict war attack coup");
      const limit = Math.min(parseInt(params.limit || "20"), 50);
      const span  = params.span || "1440";
      const res = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=${limit}&format=json&timespan=${span}`);
      const d   = await res.json();
      return ok({
        source: "gdeltproject.org", free: true,
        count: (d.articles || []).length,
        articles: (d.articles || []).map(a => ({ title: a.title, url: a.url, source: a.domain, date: a.seendate, country: a.sourcecountry })),
      });
    }

    // FOREX — Frankfurter / ECB (free, no key, unlimited)
    if (api === "forex") {
      const base    = params.base    || "USD";
      const symbols = params.symbols || "PHP,IDR,MYR,SGD,THB,VND,JPY,CNY,EUR,GBP,KRW,INR,AUD,MMK,BND";
      const res = await fetch(`https://api.frankfurter.app/latest?base=${base}&symbols=${symbols}`);
      const d   = await res.json();
      return ok({ source: "frankfurter.app", free: true, base: d.base, date: d.date, rates: d.rates });
    }

    // COUNTRY DATA — REST Countries (free, no key, unlimited)
    if (api === "country") {
      const name = encodeURIComponent(params.name || "Philippines");
      const res  = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=false`);
      const data = await res.json();
      const c    = Array.isArray(data) ? data[0] : data;
      if (!c || c.status === 404) return err("Country not found", 404);
      return ok({
        source: "restcountries.com", free: true,
        name: c.name?.common, official: c.name?.official, capital: c.capital?.[0],
        region: c.region, subregion: c.subregion, population: c.population, area: c.area,
        currencies: c.currencies, languages: c.languages, flag: c.flag, flag_svg: c.flags?.svg,
        maps: c.maps, timezones: c.timezones, borders: c.borders, latlng: c.latlng,
      });
    }

    // EARTHQUAKES — USGS (free, no key, unlimited)
    if (api === "earthquakes") {
      const period = params.period || "day";
      const res    = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_${period}.geojson`);
      const d      = await res.json();
      const quakes = (d.features || []).slice(0, 30).map(f => ({
        id: f.id, magnitude: f.properties.mag, place: f.properties.place,
        time: new Date(f.properties.time).toISOString(),
        lon: f.geometry?.coordinates[0], lat: f.geometry?.coordinates[1], depth_km: f.geometry?.coordinates[2],
      }));
      return ok({ source: "earthquake.usgs.gov", free: true, count: quakes.length, period, earthquakes: quakes });
    }

    // WORLD BANK — GDP & economic data (free, no key, unlimited)
    if (api === "worldbank") {
      const country   = params.country   || "PH";
      const indicator = params.indicator || "NY.GDP.MKTP.CD";
      const res = await fetch(`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&mrv=5&per_page=5`);
      const d   = await res.json();
      const entries = Array.isArray(d) ? d[1] : [];
      return ok({
        source: "worldbank.org", free: true, country, indicator,
        data: (entries || []).map(e => ({ year: e.date, value: e.value, country: e.country?.value })),
      });
    }

    // MARITIME — enriched static data (no live API key needed)
    if (api === "maritime") {
      const lanes = {
        malacca: { name: "Strait of Malacca",       status: "NORMAL",     vessels: 118, risk: "LOW",      notes: "Clear, high commercial traffic" },
        hormuz:  { name: "Strait of Hormuz",         status: "ELEVATED",   vessels: 36,  risk: "HIGH",     notes: "Naval exercises, tanker escort advised" },
        scs:     { name: "South China Sea",          status: "ELEVATED",   vessels: 88,  risk: "MEDIUM",   notes: "PLA patrols, ADIZ incursions ongoing" },
        redsea:  { name: "Red Sea / Bab-el-Mandeb", status: "RESTRICTED", vessels: 14,  risk: "CRITICAL", notes: "Houthi threat — reroute via Cape of Good Hope" },
        suez:    { name: "Suez Canal",               status: "CONGESTED",  vessels: 52,  risk: "LOW",      notes: "Queue 18 vessels, normal operations" },
        sunda:   { name: "Sunda / Lombok Strait",    status: "NORMAL",     vessels: 44,  risk: "LOW",      notes: "Standard transit, clear" },
        panama:  { name: "Panama Canal",             status: "NORMAL",     vessels: 38,  risk: "LOW",      notes: "Water levels recovered, normal ops" },
        channel: { name: "English Channel",          status: "NORMAL",     vessels: 92,  risk: "LOW",      notes: "TSS enforced, very high traffic" },
        tsushima:{ name: "Tsushima Strait",          status: "WATCH",      vessels: 55,  risk: "MEDIUM",   notes: "JMSDF monitoring, DPRK activity nearby" },
      };
      const key = params.strait || "all";
      return ok({ source: "enriched-static", free: true, updated: new Date().toISOString(), lanes: key === "all" ? lanes : (lanes[key] || lanes) });
    }

    // LEADER SUMMARY — Wikipedia (free, no key, unlimited)
    if (api === "leader") {
      const name = encodeURIComponent(params.name || "Ferdinand Marcos Jr.");
      const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${name}`);
      const d    = await res.json();
      return ok({ source: "wikipedia.org", free: true, title: d.title, extract: (d.extract || "").slice(0, 600), thumbnail: d.thumbnail?.source, url: d.content_urls?.desktop?.page });
    }

    // HELP
    if (api === "help" || api === "") {
      return ok({
        name: "God's Eye API Proxy",
        version: "2.0",
        total_cost: "$0/month",
        auth: "Pass X-Access-Pass header or ?pass= param",
        endpoints: {
          "?api=weather&lat=14.5995&lon=120.9842":           "Weather — Open-Meteo (no key)",
          "?api=flights&lamin=4&lomin=95&lamax=22&lomax=127":"Live flights — OpenSky (no key)",
          "?api=conflict&q=Myanmar+military&limit=20":       "Conflict news — GDELT (no key)",
          "?api=forex&base=USD&symbols=PHP,IDR,SGD":         "Exchange rates — Frankfurter/ECB (no key)",
          "?api=country&name=Philippines":                   "Country data — REST Countries (no key)",
          "?api=earthquakes&period=day":                     "Seismic events — USGS (no key)",
          "?api=worldbank&country=PH":                       "Economic data — World Bank (no key)",
          "?api=maritime":                                   "Maritime lane status (no key)",
          "?api=leader&name=Ferdinand+Marcos+Jr.":           "Leader summary — Wikipedia (no key)",
        },
      });
    }

    return err(`Unknown api="${api}". Try ?api=help`, 400);

  } catch (e) {
    return err(`Proxy error: ${e.message}`);
  }
};
