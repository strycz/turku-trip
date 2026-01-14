export type ScheduleItem = {
  time: string;
  title: string;
  description?: string;
  location?: string;
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
        time: "16:00–17:30", 
        title: "Przyjazd / check-in", 
        location: "https://www.google.com/maps/search/?api=1&query=Turku+Center" 
      },
      { 
        time: "17:45–18:45", 
        title: "Spacer startowy (Rynek, Rzeka Aura)", 
        description: "Cel: złapać rytm miasta, nie zmęczyć się",
        location: "https://www.google.com/maps/search/?api=1&query=Market+Square+Turku" 
      },
      { 
        time: "19:00–20:30", 
        title: "Kolacja: Koulu", 
        description: "Duże porcje, mięso, piwo — solidny start",
        location: "https://www.google.com/maps/search/?api=1&query=Panimoravintola+Koulu" 
      },
      { 
        time: "20:45–22:30", 
        title: "Puby: 5piste5 / Uusi Apteekki", 
        location: "https://www.google.com/maps/search/?api=1&query=Uusi+Apteekki+Turku" 
      },
      { time: "23:00", title: "Powrót / sen" },
    ],
  },
  {
    day: "Sobota",
    items: [
      { time: "08:30–09:30", title: "Śniadanie (Kawiarnia w centrum)" },
      { 
        time: "10:00–11:30", 
        title: "Zamek w Turku", 
        description: "Krótko i konkretnie — historia bez muzealnego maratonu",
        location: "https://www.google.com/maps/search/?api=1&query=Turku+Castle" 
      },
      { 
        time: "11:45–13:00", 
        title: "Forum Marinum", 
        description: "Statki, morze, północny klimat",
        location: "https://www.google.com/maps/search/?api=1&query=Forum+Marinum+Turku" 
      },
      { 
        time: "13:15–14:15", 
        title: "Lunch (bez alkoholu)",
        description: "Ważne przed sauną!"
      },
      {
        time: "15:30–18:30",
        title: "Järvelä Sauna",
        description: "Sauna nad jeziorem + zimna woda. Rytuał: sauna -> jezioro -> odpoczynek x4.",
        location: "https://www.google.com/maps/search/?api=1&query=Jarvela+Sauna+Littoinen"
      },
      { 
        time: "19:45–21:15", 
        title: "Kolacja po saunie: Nooa", 
        description: "Białko, ciepło, regeneracja",
        location: "https://www.google.com/maps/search/?api=1&query=Ravintola+Nooa+Turku" 
      },
      { 
        time: "21:30–23:30", 
        title: "Spokojny wieczór: Dynamo / Pub", 
        location: "https://www.google.com/maps/search/?api=1&query=Dynamo+Turku" 
      },
      { time: "00:00", title: "Sen (sauna zrobiła swoje)" },
    ],
  },
  {
    day: "Niedziela",
    items: [
      { time: "09:00–10:00", title: "Pobudka + kawa" },
      { 
        time: "10:15–11:30", 
        title: "Spacer końcowy (Rzeka Aura)", 
        description: "Bez planu, bez celu",
        location: "https://www.google.com/maps/search/?api=1&query=Aura+River+Turku" 
      },
      { 
        time: "11:45–12:45", 
        title: "Brunch: Cafe Art", 
        location: "https://www.google.com/maps/search/?api=1&query=Cafe+Art+Turku" 
      },
      { time: "13:00", title: "Wyjazd" },
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
