import pg from "pg";

const { Client } = pg;

// Hardcoded UUIDs for reproducibility
const PROFILES = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d", // Amadou Diallo
    email: "amadou@sadekh.sn",
    full_name: "Amadou Diallo",
    phone: "+221 77 123 45 67",
    whatsapp: "+221 77 123 45 67",
    agency_name: "Sadekh Immobilier",
    verified: true,
    bio: "Agent immobilier certifié avec plus de 10 ans d'expérience à Dakar. Spécialiste des villas haut standing.",
    role: "agent",
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e", // Fatou Ndiaye
    email: "fatou@agence.sn",
    full_name: "Fatou Ndiaye",
    phone: "+221 78 234 56 78",
    whatsapp: "+221 78 234 56 78",
    agency_name: "Diaspora Homes",
    verified: true,
    bio: "Experte en immobilier pour la diaspora sénégalaise. Vente et gestion de biens à distance.",
    role: "agent",
  },
  {
    id: "c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f", // Ibrahima Fall
    email: "ibrahima@archi.sn",
    full_name: "Ibrahima Fall",
    phone: "+221 76 345 67 89",
    whatsapp: "+221 76 345 67 89",
    agency_name: "Archidesign SN",
    verified: true,
    bio: "Architecte-agent immobilier. Plans de maison, villas et immeubles sur mesure.",
    role: "agent",
  },
  {
    id: "d4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a", // Mariama Sow
    email: "mariama@promo.sn",
    full_name: "Mariama Sow",
    phone: "+221 77 456 78 90",
    whatsapp: "+221 77 456 78 90",
    agency_name: "Promo Habitat",
    verified: false,
    bio: "Agent immobilier en cours de vérification. Spécialisée dans les programmes neufs à Diamniadio.",
    role: "agent",
  },
  {
    id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b", // Ousmane Ba
    email: "ousmane@vendor.sn",
    full_name: "Ousmane Ba",
    phone: "+221 78 567 89 01",
    whatsapp: "+221 78 567 89 01",
    agency_name: null,
    verified: true,
    bio: "Vendeur indépendant de terrains et maisons dans la région de Dakar et Thiès.",
    role: "agent",
  },
  {
    id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop (buyer)
    email: "acheteur@sadekh.sn",
    full_name: "Moussa Diop",
    phone: "+221 77 678 90 12",
    whatsapp: "+221 77 678 90 12",
    agency_name: null,
    verified: false,
    bio: "Acheteur à la recherche d'une maison ou d'un appartement à Dakar.",
    role: "user",
  },
];

const PROPERTIES = [
  {
    id: "10000001-0001-4000-a000-000000000001",
    user_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    type: "maison",
    title: "Villa moderne avec piscine — Almadies",
    description:
      "Magnifique villa moderne avec piscine dans le quartier huppé des Almadies. 6 chambres, 4 salles de bain, grand séjour, cuisine équipée, jardin paysager. Sécurité 24/7, climatisation réversible, garage double. Titre foncier disponible.",
    price: 185000000,
    price_negotiable: true,
    surface_m2: 350,
    rooms: 6,
    region: "Dakar",
    city: "Dakar",
    quartier: "Almadies",
    lat: 14.6937,
    lng: -17.4625,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: true,
    views_count: 342,
  },
  {
    id: "10000002-0001-4000-a000-000000000002",
    user_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    type: "maison",
    title: "Maison basse 3 chambres — Mermoz",
    description:
      "Maison basse de 4 pièces dans le quartier résidentiel de Mermoz. 3 chambres, séjour spacieux, cuisine, 2 salles de bain. Beau jardin arboré, parking. Proche écoles et commerces.",
    price: 75000000,
    price_negotiable: true,
    surface_m2: 200,
    rooms: 4,
    region: "Dakar",
    city: "Dakar",
    quartier: "Mermoz",
    lat: 14.688,
    lng: -17.452,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 189,
  },
  {
    id: "10000003-0001-4000-a000-000000000003",
    user_id: "b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e",
    type: "maison",
    title: "Duplex standing 4 chambres — Plateau",
    description:
      "Duplex haut standing au cœur du Plateau, le quartier des affaires. 4 chambres, 3 salles de bain, terrasse panoramique avec vue sur l'Atlantique. Finitions de luxe, climatisation, ascenseur privatif. Idéal pour investissement ou résidence principale.",
    price: 120000000,
    price_negotiable: false,
    surface_m2: 280,
    rooms: 5,
    region: "Dakar",
    city: "Dakar",
    quartier: "Plateau",
    lat: 14.668,
    lng: -17.444,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: true,
    views_count: 456,
  },
  {
    id: "10000004-0001-4000-a000-000000000004",
    user_id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b",
    type: "maison",
    title: "Maison traditionnelle rénovée — Saint-Louis",
    description:
      "Charmante maison traditionnelle saint-louisienne entièrement rénovée. 4 chambres, 2 salles de bain, cour intérieure avec patio. Charme colonial préservé avec confort moderne. Idéale pour maison d'hôtes ou résidence secondaire.",
    price: 45000000,
    price_negotiable: true,
    surface_m2: 180,
    rooms: 4,
    region: "Saint-Louis",
    city: "Saint-Louis",
    quartier: "Sud",
    lat: 16.0335,
    lng: -16.488,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 98,
  },
  {
    id: "10000005-0001-4000-a000-000000000005",
    user_id: "d4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a",
    type: "maison",
    title: "Villa neuve — Diamniadio",
    description:
      "Villa neuve dans le lotissement de Diamniadio. 5 chambres, 3 salles de bain, séjour, cuisine américaine. Jardin avec puits, parking. Zone en plein développement, à 30 min du centre de Dakar. Titre foncier en cours.",
    price: 55000000,
    price_negotiable: true,
    surface_m2: 220,
    rooms: 5,
    region: "Dakar",
    city: "Diamniadio",
    quartier: "Lotissement",
    lat: 14.715,
    lng: -17.23,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    ]),
    title_foncier: false,
    status: "active",
    is_premium: false,
    views_count: 134,
  },
  {
    id: "10000006-0001-4000-a000-000000000006",
    user_id: "b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e",
    type: "appartement",
    title: "F3 panoramique vue mer — Fann Hock",
    description:
      "Superbe F3 au 5ème étage avec vue panoramique sur l'océan Atlantique. 3 chambres, 2 salles de bain, séjour lumineux, cuisine équipée. Résidence sécurisée avec piscine, parking souterrain. Idéal pour la diaspora.",
    price: 65000000,
    price_negotiable: false,
    surface_m2: 110,
    rooms: 3,
    region: "Dakar",
    city: "Dakar",
    quartier: "Fann Hock",
    lat: 14.682,
    lng: -17.478,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: true,
    views_count: 521,
  },
  {
    id: "10000007-0001-4000-a000-000000000007",
    user_id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b",
    type: "appartement",
    title: "F2 moderne — Liberté",
    description:
      "F2 moderne et fonctionnel dans le quartier de Liberté. 2 chambres, salle de bain, cuisine américaine, séjour. Proche transports en commun et commodités. Bon rapport qualité-prix pour un premier achat.",
    price: 35000000,
    price_negotiable: true,
    surface_m2: 65,
    rooms: 2,
    region: "Dakar",
    city: "Dakar",
    quartier: "Liberté",
    lat: 14.692,
    lng: -17.446,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 267,
  },
  {
    id: "10000008-0001-4000-a000-000000000008",
    user_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    type: "appartement",
    title: "F4 résidence haut standing — Ngor",
    description:
      "F4 spacieux dans une résidence haut standing à Ngor. 4 chambres, 3 salles de bain, double séjour, cuisine fermée équipée. Vue mer, terrasse, 2 places de parking. Piscine collective, gardien 24h. Finitions luxueuses.",
    price: 95000000,
    price_negotiable: false,
    surface_m2: 150,
    rooms: 4,
    region: "Dakar",
    city: "Dakar",
    quartier: "Ngor",
    lat: 14.725,
    lng: -17.515,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: true,
    views_count: 389,
  },
  {
    id: "10000009-0001-4000-a000-000000000009",
    user_id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b",
    type: "appartement",
    title: "Immeuble R+3 — Thiès",
    description:
      "Immeuble R+3 de 12 appartements dans le centre de Thiès. Investissement locatif rentable. F2, F3 et F4 disponibles. Parking, eau et électricité. Zone commerciale stratégique. Rendement locatif estimé à 8-10%.",
    price: 150000000,
    price_negotiable: true,
    surface_m2: 600,
    rooms: 12,
    region: "Thiès",
    city: "Thiès",
    quartier: "Centre-ville",
    lat: 14.793,
    lng: -16.941,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 156,
  },
  {
    id: "1000000a-0001-4000-a000-00000000000a",
    user_id: "d4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a",
    type: "terrain",
    title: "Terrain viabilisé 500m² — Saly",
    description:
      "Terrain viabilisé de 500m² dans la zone résidentielle de Saly Portudal. Eau, électricité et assainissement disponibles. Environnement calme et arboré, à 80 km de Dakar. Idéal pour construire une villa de vacances.",
    price: 30000000,
    price_negotiable: true,
    surface_m2: 500,
    rooms: null,
    region: "Mbour",
    city: "Saly",
    quartier: "Saly Portudal",
    lat: 14.115,
    lng: -16.855,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 87,
  },
  {
    id: "1000000b-0001-4000-a000-00000000000b",
    user_id: "d4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a",
    type: "terrain",
    title: "Terrain loti 800m² — Diamniadio",
    description:
      "Grand terrain loti de 800m² à Diamniadio, dans une zone en plein essor. Viabilisation en cours. Proche du futur pôle urbain, de l'université et de l'autoroute. Excellent investissement à moyen terme. Titre foncier disponible.",
    price: 40000000,
    price_negotiable: true,
    surface_m2: 800,
    rooms: null,
    region: "Dakar",
    city: "Diamniadio",
    quartier: "Zone Lotie",
    lat: 14.72,
    lng: -17.235,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: true,
    views_count: 234,
  },
  {
    id: "1000000c-0001-4000-a000-00000000000c",
    user_id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b",
    type: "terrain",
    title: "Terrain nu 1200m² — Ziguinchor",
    description:
      "Grand terrain nu de 1200m² à Ziguinchor. Idéal pour un projet immobilier ou agricole. Accès route, proche des commodités. Région de la Casamance au fort potentiel touristique.",
    price: 15000000,
    price_negotiable: true,
    surface_m2: 1200,
    rooms: null,
    region: "Ziguinchor",
    city: "Ziguinchor",
    quartier: "Bignona",
    lat: 12.583,
    lng: -16.271,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop",
    ]),
    title_foncier: false,
    status: "active",
    is_premium: false,
    views_count: 45,
  },
  {
    id: "1000000d-0001-4000-a000-00000000000d",
    user_id: "e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b",
    type: "terrain",
    title: "Terrain titre foncier — Rufisque",
    description:
      "Terrain de 600m² avec titre foncier à Rufisque. Zone résidentielle calme, viabilisé. Proche de la route nationale, à 25 min de Dakar. Idéal pour construction immédiate.",
    price: 28000000,
    price_negotiable: true,
    surface_m2: 600,
    rooms: null,
    region: "Dakar",
    city: "Rufisque",
    quartier: "Rufisque Est",
    lat: 14.718,
    lng: -17.259,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&h=500&fit=crop",
    ]),
    title_foncier: true,
    status: "active",
    is_premium: false,
    views_count: 112,
  },
  {
    id: "1000000e-0001-4000-a000-00000000000e",
    user_id: "c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f",
    type: "plan",
    title: "Plan Villa 4 chambres contemporaine",
    description:
      "Plan architectural complet pour une villa contemporaine de 4 chambres. Surface habitable 200m² sur un terrain de 400m². Design moderne avec toiture terrasse, piscine, jardin. Inclut plans de masse, plans d'étage, coupes, façades et dossier technique complet.",
    price: 150000,
    price_negotiable: false,
    surface_m2: 200,
    rooms: 4,
    region: "Dakar",
    city: "Dakar",
    quartier: "",
    lat: null,
    lng: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop",
    ]),
    title_foncier: false,
    status: "active",
    is_premium: true,
    views_count: 678,
    plan_price: 150000,
  },
  {
    id: "1000000f-0001-4000-a000-00000000000f",
    user_id: "c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f",
    type: "plan",
    title: "Plan Maison basse 3 chambres sénégalaise",
    description:
      "Plan de maison basse sénégalaise traditionnelle moderne. 3 chambres, séjour, cuisine, 2 salles de bain. 120m² sur un terrain de 200m². Adapté au climat sénégalais avec véranda et ventilation naturelle. Dossier PDF complet.",
    price: 100000,
    price_negotiable: false,
    surface_m2: 120,
    rooms: 3,
    region: "Dakar",
    city: "Dakar",
    quartier: "",
    lat: null,
    lng: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop",
    ]),
    title_foncier: false,
    status: "active",
    is_premium: false,
    views_count: 423,
    plan_price: 100000,
  },
  {
    id: "10000010-0001-4000-a000-000000000010",
    user_id: "c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f",
    type: "plan",
    title: "Plan Immeuble R+4 investissement locatif",
    description:
      "Plan complet d'immeuble R+4 destiné à l'investissement locatif. 800m² de surface totale avec 12 appartements (F2 et F3). Parkings, ascenseur, espaces communs. Étude de rentabilité incluse. Adapté aux normes de construction sénégalaises.",
    price: 350000,
    price_negotiable: false,
    surface_m2: 800,
    rooms: 12,
    region: "Dakar",
    city: "Dakar",
    quartier: "",
    lat: null,
    lng: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop",
    ]),
    title_foncier: false,
    status: "active",
    is_premium: true,
    views_count: 567,
    plan_price: 350000,
  },
];

const FAVORITES = [
  {
    id: "f0000001-0000-4000-a000-000000000001",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop (buyer)
    property_id: "10000001-0001-4000-a000-000000000001", // Villa moderne Almadies
  },
  {
    id: "f0000001-0000-4000-a000-000000000002",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    property_id: "10000006-0001-4000-a000-000000000006", // F3 Fann Hock
  },
  {
    id: "f0000001-0000-4000-a000-000000000003",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    property_id: "1000000b-0001-4000-a000-00000000000b", // Terrain Diamniadio
  },
];

const MESSAGES = [
  {
    id: "b0000001-0001-4000-a000-000000000001",
    sender_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    receiver_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d", // Amadou Diallo
    property_id: "10000001-0001-4000-a000-000000000001", // Villa Almadies
    content: "Bonjour Monsieur Diallo, la villa des Almadies est-elle toujours disponible ? Je suis très intéressé. Quel est votre meilleur prix ?",
  },
  {
    id: "b0000002-0001-4000-a000-000000000002",
    sender_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    receiver_id: "b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e", // Fatou Ndiaye
    property_id: "10000006-0001-4000-a000-000000000006", // F3 Fann Hock
    content: "Bonjour Madame Ndiaye, le F3 à Fann Hock m'intéresse beaucoup. Est-il possible de visiter cette semaine ? Je vis en France mais je serai à Dakar à partir de jeudi.",
  },
  {
    id: "b0000003-0001-4000-a000-000000000003",
    sender_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    receiver_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d", // Amadou Diallo
    property_id: "10000001-0001-4000-a000-000000000001", // Villa Almadies
    content: "Merci pour votre réponse rapide. Pouvez-vous m'envoyer des photos supplémentaires de la piscine et du jardin ?",
  },
  {
    id: "b0000004-0001-4000-a000-000000000004",
    sender_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    receiver_id: "c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f", // Ibrahima Fall
    property_id: "1000000e-0001-4000-a000-00000000000e", // Plan Villa
    content: "Bonjour Monsieur Fall, je souhaite acheter le plan de la villa 4 chambres. Comment procéder pour le paiement et la réception du dossier PDF ?",
  },
];

const PROPERTY_ALERTS = [
  {
    id: "a0000001-0000-4000-a000-000000000001",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    type: "maison",
    region: "Dakar",
    max_price: 200000000,
    min_surface: null,
    active: true,
  },
  {
    id: "a0000001-0000-4000-a000-000000000002",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    type: "appartement",
    region: "Dakar",
    max_price: 100000000,
    min_surface: null,
    active: true,
  },
  {
    id: "a0000001-0000-4000-a000-000000000003",
    user_id: "f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c", // Moussa Diop
    type: "all",
    region: "Dakar",
    max_price: null,
    min_surface: null,
    active: true,
  },
];

async function main() {
  const client = new Client({
    host: "aws-0-eu-west-3.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.bqqkuxehwaaxkgqqsrnq",
    password: "Dspro1814@2027",
    ssl: { rejectUnauthorized: false },
  });

  console.log("🔌 Connecting to Supabase PostgreSQL...");
  await client.connect();
  console.log("✅ Connected!");

  try {
    // ============================================
    // SEED PROFILES
    // ============================================
    console.log("\n👥 Seeding profiles...");
    for (const p of PROFILES) {
      await client.query(
        `INSERT INTO profiles (id, email, full_name, phone, whatsapp, agency_name, verified, bio, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          p.id,
          p.email,
          p.full_name,
          p.phone,
          p.whatsapp,
          p.agency_name,
          p.verified,
          p.bio,
          p.role,
        ]
      );
      console.log(`  ✅ ${p.full_name} (${p.email})`);
    }

    // ============================================
    // SEED PROPERTIES
    // ============================================
    console.log("\n🏠 Seeding properties...");
    for (const p of PROPERTIES) {
      await client.query(
        `INSERT INTO properties (id, user_id, type, title, description, price, price_negotiable, 
         surface_m2, rooms, region, city, quartier, lat, lng, images, title_foncier, 
         status, is_premium, views_count, plan_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          p.id,
          p.user_id,
          p.type,
          p.title,
          p.description,
          p.price,
          p.price_negotiable,
          p.surface_m2,
          p.rooms,
          p.region,
          p.city,
          p.quartier,
          p.lat,
          p.lng,
          p.images,
          p.title_foncier,
          p.status,
          p.is_premium,
          p.views_count,
          p.plan_price || null,
        ]
      );
      const shortTitle =
        p.title.length > 40 ? p.title.substring(0, 40) + "..." : p.title;
      console.log(`  ✅ [${p.type}] ${shortTitle} — ${(p.price / 1000000).toFixed(0)}M FCFA`);
    }

    // ============================================
    // SEED FAVORITES
    // ============================================
    console.log("\n❤️  Seeding favorites...");
    for (const f of FAVORITES) {
      await client.query(
        `INSERT INTO favorites (id, user_id, property_id) VALUES ($1, $2, $3)`,
        [f.id, f.user_id, f.property_id]
      );
      console.log(`  ✅ Favorite: user → property ${f.property_id.slice(-3)}`);
    }

    // ============================================
    // SEED MESSAGES
    // ============================================
    console.log("\n💬 Seeding messages...");
    for (const m of MESSAGES) {
      await client.query(
        `INSERT INTO messages (id, sender_id, receiver_id, property_id, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.id, m.sender_id, m.receiver_id, m.property_id, m.content]
      );
      const shortContent =
        m.content.length > 50 ? m.content.substring(0, 50) + "..." : m.content;
      console.log(`  ✅ "${shortContent}"`);
    }

    // ============================================
    // SEED PROPERTY ALERTS
    // ============================================
    console.log("\n🔔 Seeding property alerts...");
    for (const a of PROPERTY_ALERTS) {
      await client.query(
        `INSERT INTO property_alerts (id, user_id, type, region, max_price, min_surface, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [a.id, a.user_id, a.type, a.region, a.max_price, a.min_surface, a.active]
      );
      console.log(`  ✅ Alert: type=${a.type}, region=${a.region}${a.max_price ? `, max_price=${a.max_price}` : ""}`);
    }

    // ============================================
    // VERIFICATION
    // ============================================
    console.log("\n🔍 Verifying seeded data...");

    const profileCount = await client.query("SELECT COUNT(*) FROM profiles");
    console.log(`  Profiles: ${profileCount.rows[0].count}`);

    const propertyCount = await client.query("SELECT COUNT(*) FROM properties");
    console.log(`  Properties: ${propertyCount.rows[0].count}`);

    const favoriteCount = await client.query("SELECT COUNT(*) FROM favorites");
    console.log(`  Favorites: ${favoriteCount.rows[0].count}`);

    const messageCount = await client.query("SELECT COUNT(*) FROM messages");
    console.log(`  Messages: ${messageCount.rows[0].count}`);

    const alertCount = await client.query("SELECT COUNT(*) FROM property_alerts");
    console.log(`  Property Alerts: ${alertCount.rows[0].count}`);

    // Show premium properties
    const premiums = await client.query(
      "SELECT title, price, is_premium FROM properties WHERE is_premium = true ORDER BY price DESC"
    );
    console.log("\n🏆 Premium properties:");
    for (const p of premiums.rows) {
      console.log(`  • ${p.title} — ${(p.price / 1000000).toFixed(0)}M FCFA`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ SUCCESS: All demo data seeded successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ FAILURE: Error during seeding:");
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();