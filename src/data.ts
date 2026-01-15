export type ScheduleItem = {
  id: string; // UUID
  time: string;
  title: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  images?: string[];
};

export type DayPlan = {
  day: string;
  items: ScheduleItem[];
};

export type Member = {
  id: string;
  name: string;
};

export const DEFAULT_ROLES: Member[] = [
  { id: "1", name: "" },
  { id: "2", name: "" },
  { id: "3", name: "" },
  { id: "4", name: "" },
];




export const schedule: DayPlan[] = [
  {
    day: "Piątek",
    items: [
      { 
        id: "static-1",
        time: "16:00–17:30", 
        title: "Przyjazd / check-in", 
        location: "https://maps.app.goo.gl/io8hqU14TmbNBdMo8" 
      },
      { 
        id: "static-2",
        time: "17:45–18:45", 
        title: "Spacer startowy (Rynek, Rzeka Aura)", 
        description: "Cel: złapać rytm miasta, nie zmęczyć się",
        location: "https://www.google.com/maps/search/?api=1&query=Market+Square+Turku" 
      },
      { 
        id: "static-3",
        time: "19:00–20:30", 
        title: "Kolacja: Koulu", 
        description: "Duże porcje, mięso, piwo — solidny start",
        location: "https://www.google.com/maps/search/?api=1&query=Panimoravintola+Koulu" 
      },
      { 
        id: "static-4",
        time: "20:45–22:30", 
        title: "Puby: 5piste5 / Uusi Apteekki", 
        location: "https://www.google.com/maps/search/?api=1&query=Uusi+Apteekki+Turku" 
      },
      { id: "static-5", time: "23:00", title: "Powrót / sen" },
    ],
  },
  {
    day: "Sobota",
    items: [
      { id: "static-6", time: "08:30–09:30", title: "Śniadanie (Kawiarnia w centrum)" },
      { 
        id: "static-7",
        time: "10:00–11:30", 
        title: "Zamek w Turku", 
        description: "Krótko i konkretnie — historia bez muzealnego maratonu",
        location: "https://www.google.com/maps/search/?api=1&query=Turku+Castle" 
      },
      { 
        id: "static-8",
        time: "11:45–13:00", 
        title: "Forum Marinum", 
        description: "Statki, morze, północny klimat",
        location: "https://www.google.com/maps/search/?api=1&query=Forum+Marinum+Turku" 
      },
      { 
        id: "static-9",
        time: "13:15–14:15", 
        title: "Lunch (bez alkoholu)",
        description: "Ważne przed sauną!"
      },
      {
        id: "static-10",
        time: "15:30–18:30",
        title: "Järvelä Sauna",
        description: "Sauna nad jeziorem + zimna woda. Rytuał: sauna -> jezioro -> odpoczynek x4.",
        location: "https://www.google.com/maps/search/?api=1&query=Jarvela+Sauna+Littoinen"
      },
      { 
        id: "static-11",
        time: "19:45–21:15", 
        title: "Kolacja po saunie: Nooa", 
        description: "Białko, ciepło, regeneracja",
        location: "https://www.google.com/maps/search/?api=1&query=Ravintola+Nooa+Turku" 
      },
      { 
        id: "static-12",
        time: "21:30–23:30", 
        title: "Spokojny wieczór: Dynamo / Pub", 
        location: "https://www.google.com/maps/search/?api=1&query=Dynamo+Turku" 
      },
      { id: "static-13", time: "00:00", title: "Sen (sauna zrobiła swoje)" },
    ],
  },
  {
    day: "Niedziela",
    items: [
      { id: "static-14", time: "09:00–10:00", title: "Pobudka + kawa" },
      { 
        id: "static-15",
        time: "10:15–11:30", 
        title: "Spacer końcowy (Rzeka Aura)", 
        description: "Bez planu, bez celu",
        location: "https://www.google.com/maps/search/?api=1&query=Aura+River+Turku" 
      },
      { 
        id: "static-16",
        time: "11:45–12:45", 
        title: "Brunch: Cafe Art", 
        location: "https://www.google.com/maps/search/?api=1&query=Cafe+Art+Turku" 
      },
      { id: "static-17", time: "13:00", title: "Wyjazd" },
    ],
  },
];

export const packingList = [
  "Bielizna termiczna (2x)",
  "Polar / sweter",
  "Kurtka wiatro- i wodoodporna",
  "Spodnie zimowe",
  "Buty trekkingowe",
  "Grube skarpety",
  "Czapka + rękawice",
  "Plecak dzienny",
  "Termos",
  "Powerbank",
  "Ręcznik (sauna)",
  "Klapki",
  "Strój kąpielowy",
];
