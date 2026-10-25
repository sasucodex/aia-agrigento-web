import type { SectionContacts } from "@/types/contacts";

export const SECTION_CONTACTS: SectionContacts = {
  organizationName: "Associazione Italiana Arbitri - Sezione di Agrigento",
  taxId: "93070180844",
  address: {
    street: "Via Matteo Cimarra, 38",
    city: "Agrigento",
    province: "AG",
    postalCode: "92100",
    region: "Sicilia",
    country: "Italia",
    notes:
      "Situata nel cuore della città, facilmente raggiungibile dalla zona Quadrivio Spinasanta e dal centro storico. Possibilità di parcheggio pubblico lungo la via e nelle strade adiacenti.",
  },
  openingHours: [
    {
      day: "Lunedì",
      hours: "18:00 – 20:00",
      description:
        "Apertura ordinaria della segreteria per tesseramenti, pratiche amministrative e ricevimento associati.",
    },
  ],
  phones: {
    landline: "0922604783",
    landlineDisplay: "0922 604783",
    mobile: "+393924700055",
    mobileDisplay: "392 4700055",
  },
  email: "info@aiaagrigento.it",
  emails: {
    info: "info@aiaagrigento.it",
    federal: "agrigento@aia-figc.it",
    segreteria: "segreteria@aiaagrigento.it",
    corsoArbitri: "corsoarbitri@aiaagrigento.it",
    accrediti: "accrediti@aiaagrigento.it",
    giustificazioniRto: "giustificazionirto@aiaagrigento.it",
    relazioni: "relazioni@aiaagrigento.it",
  },
  maps: {
    googleMaps:
      "https://maps.google.com/?q=Via+Matteo+Cimarra+38+92100+Agrigento+AG",
    appleMaps:
      "https://maps.apple.com/?q=Via+Matteo+Cimarra+38+92100+Agrigento+AG",
    waze: "https://waze.com/ul?q=Via+Matteo+Cimarra+38+Agrigento",
    coordinates: {
      latitude: 37.3197,
      longitude: 13.5855,
    },
  },
  social: {
    sharedDescription:
      "Attraverso i nostri canali social ufficiali raccontiamo la vita quotidiana e i traguardi della Sezione di Agrigento: le designazioni settimanali, gli esordi degli arbitri nei campionati regionali e nazionali, i raduni tecnici e gli eventi formativi che vedono protagonisti i nostri ragazzi.",
    channels: [
      {
        platform: "instagram",
        label: "Instagram",
        kicker: "CANALE FOTOGRAFICO & STORIES",
        handle: "@aia_agrigento",
        url: "https://www.instagram.com/aia_agrigento/",
        description:
          "Foto dalle gare, storie in tempo reale durante i raduni e highlights degli eventi associativi.",
      },
      {
        platform: "facebook",
        label: "Facebook",
        kicker: "PAGINA ISTITUZIONALE UFFICIALE",
        handle: "AIA Agrigento",
        url: "https://www.facebook.com/aiaagrigento",
        description:
          "Comunicati stampa, articoli del blog, album ufficiali delle manifestazioni e direttive della Sezione.",
      },
    ],
  },
  author: {
    name: "Samuele Gallo",
    githubUrl: "https://github.com/sasucodex",
  },
};
