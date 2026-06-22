import { db } from '../src/lib/db';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque'];
const DAKAR_QUARTIERS = ['Almadies', 'Plateau', 'Mermoz', 'Fann Hock', 'Omnium', 'Liberté', 'Sacre-Cœur', 'Yoff', 'Ngor', 'Diamniadio'];
const TYPES = ['maison', 'appartement', 'terrain', 'plan'];

const DEMO_USERS = [
  { email: 'amadou@sadekh.sn', name: 'Amadou Diallo', phone: '+221771234567', whatsapp: '+221771234567', agencyName: 'Sadekh Immobilier', verified: true, role: 'admin' },
  { email: 'fatou@agence.sn', name: 'Fatou Ndiaye', phone: '+221782345678', whatsapp: '+221782345678', agencyName: 'Diaspora Homes', verified: true, role: 'user' },
  { email: 'ibrahima@archi.sn', name: 'Ibrahima Fall', phone: '+221763456789', whatsapp: '+221763456789', agencyName: 'Archidesign SN', verified: true, role: 'user' },
  { email: 'mariama@promo.sn', name: 'Mariama Sow', phone: '+221774567890', whatsapp: '+221774567890', agencyName: 'Promo Habitat', verified: false, role: 'user' },
  { email: 'ousmane@vendor.sn', name: 'Ousmane Ba', phone: '+221785678901', whatsapp: '+221785678901', verified: true, role: 'user' },
];

const DEMO_PROPERTIES = [
  // Maisons
  { type: 'maison', title: 'Villa moderne avec piscine — Almadies', description: 'Magnifique villa de 5 chambres avec piscine privée, jardin paysager et garage double. Située dans le quartier huppé des Almadies, proche des ambassades et de la Corniche. Finitions haut de gamme, climatisation réversible dans toutes les pièces, cuisine équipée américaine. Idéale pour une famille expatriée ou la diaspora sénégalaise.', price: 185000000, region: 'Dakar', city: 'Dakar', quartier: 'Almadies', surfaceM2: 350, rooms: 6, lat: 14.6937, lng: -17.4625, images: '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: true, userId: 0 },
  { type: 'maison', title: 'Maison basse 3 chambres — Mermoz Sacré-Cœur', description: 'Charmante maison basse de 3 chambres avec cour intérieure, située dans le quartier résidentiel de Mermoz. Proche des écoles internationales et des commerces. Séjour spacieux, 2 salles de bain, buanderie. Terrain de 200 m² avec potager. Quartier calme et sécurisé.', price: 75000000, region: 'Dakar', city: 'Dakar', quartier: 'Mermoz', surfaceM2: 200, rooms: 4, lat: 14.6880, lng: -17.4520, images: '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: false, userId: 1 },
  { type: 'maison', title: 'Duplex standing 4 chambres — Plateau', description: 'Duplex haut standing au cœur du Plateau, le quartier des affaires de Dakar. Vue panoramique sur l\'océan depuis la terrasse. 4 chambres, 3 salles de bain, bureau, séjour double. Parking souterrain pour 2 véhicules. Sécurité 24h/24. Idéal pour cadre ou investissement locatif.', price: 120000000, region: 'Dakar', city: 'Dakar', quartier: 'Plateau', surfaceM2: 280, rooms: 5, lat: 14.6680, lng: -17.4440, images: '["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: true, userId: 2 },
  { type: 'maison', title: 'Maison traditionnelle rénovée — Saint-Louis', description: 'Maison de style colonial rénovée avec goût dans l\'île de Saint-Louis, patrimoine mondial de l\'UNESCO. 3 chambres, patio intérieur, terrasse avec vue sur le fleuve. Charme authentique préservé avec des aménagements modernes (plomberie, électricité). Parfait pour résidence secondaire ou maison d\'hôtes.', price: 45000000, region: 'Saint-Louis', city: 'Saint-Louis', quartier: 'Sud', surfaceM2: 180, rooms: 4, lat: 16.0335, lng: -16.4880, images: '["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: false, userId: 3 },
  { type: 'maison', title: 'Villa neuve — Diamniadio', description: 'Villa neuve dans le nouveau pôle urbain de Diamniadio. 4 chambres, 2 salles de bain, garage, jardin. Quartier résidentiel calme en plein développement. Accès facile à l\'autoroute Ila-Touba. Idéal pour primo-accédant ou investissement locatif à fort potentiel de plus-value.', price: 55000000, region: 'Dakar', city: 'Diamniadio', quartier: 'Zone résidentielle', surfaceM2: 220, rooms: 5, lat: 14.7150, lng: -17.2300, images: '["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: false, userId: 4 },

  // Appartements
  { type: 'appartement', title: 'F3 panoramique vue mer — Corniche Ouest', description: 'Superbe appartement F3 avec vue imprenable sur l\'océan Atlantique depuis le salon et la terrasse. Résidence sécurisée avec piscine commune, jardin tropical et parking. Proche de la Corniche, restaurants et hôtels. Charges comprises. Idéal pour expatrié ou investissement locatif saisonnier.', price: 65000000, region: 'Dakar', city: 'Dakar', quartier: 'Fann Hock', surfaceM2: 110, rooms: 3, lat: 14.6820, lng: -17.4780, images: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: true, userId: 1 },
  { type: 'appartement', title: 'F2 moderne — Liberté 6', description: 'Appartement F2 entièrement rénové dans le quartier animé de Liberté 6. Proche de tous les commerces, transports en commun et écoles. Cuisine américaine équipée, climatisation, balcon. Charges mensuelles incluses dans le prix. Idéal jeune couple ou investissement locatif.', price: 35000000, region: 'Dakar', city: 'Dakar', quartier: 'Liberté', surfaceM2: 65, rooms: 2, lat: 14.6920, lng: -17.4460, images: '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: false, userId: 2 },
  { type: 'appartement', title: 'F4 résidence haut standing — Ngor', description: 'Grand appartement F4 dans résidence de standing à Ngor, avec vue mer. 3 chambres, 2 salles de bain, grand séjour, cuisine fermée équipée. Piscine, salle de sport et gardiennage 24h/24. 2 places de parking en sous-sol. À deux pas de la plage de Ngor.', price: 95000000, region: 'Dakar', city: 'Dakar', quartier: 'Ngor', surfaceM2: 150, rooms: 4, lat: 14.7250, lng: -17.5150, images: '["https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: true, userId: 0 },
  { type: 'appartement', title: 'Immeuble R+3 à vendre — Thiès', description: 'Immeuble de 3 étages comprenant 6 appartements (4 F2 et 2 F3) à vendre dans le centre-ville de Thiès. Revenus locatifs mensuels de 1 200 000 FCFA. Terrain de 300 m². Structure en bon état, toiture récente. Excellent rapport rentabilité/prix pour investisseur.', price: 150000000, region: 'Thiès', city: 'Thiès', quartier: 'Centre-ville', surfaceM2: 600, rooms: 12, lat: 14.7930, lng: -16.9410, images: '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: false, userId: 4 },

  // Terrains
  { type: 'terrain', title: 'Terrain viabilisé 500 m² — Saly Portudal', description: 'Terrain viabilisé (eau, électricité, assainissement) de 500 m² dans la zone résidentielle de Saly Portudal. Titre foncier en cours d\'obtention, tous les documents disponibles. Proche de la plage et des commodités. Idéal pour construction villa familiale ou projet immobilier.', price: 30000000, region: 'Thiès', city: 'Mbour', quartier: 'Saly', surfaceM2: 500, rooms: 0, lat: 14.1150, lng: -16.8550, images: '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: false, userId: 3 },
  { type: 'terrain', title: 'Terrain loti 800 m² — Diamniadio', description: 'Grand terrain loti de 800 m² dans la zone urbanisée de Diamniadio, près de l\'université et du futur centre des expositions. Viabilisé avec raccordement Eau et Électricité du Sénégal (SDE, SENELEC). Bornage effectué. Titre foncier disponible. Potentiel de plus-value élevé.', price: 40000000, region: 'Dakar', city: 'Diamniadio', quartier: 'Zone lotie A', surfaceM2: 800, rooms: 0, lat: 14.7200, lng: -17.2350, images: '["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: true, userId: 0 },
  { type: 'terrain', title: 'Terrain nu 1200 m² — Ziguinchor', description: 'Terrain nu de 1200 m² dans la périphérie de Ziguinchor, en Casamance. Accès par route bitumée. Terre fertile, adapté pour construction ou agriculture. Environnement calme et verdoyant. Prix très compétitif pour la région. Ideal pour un projet résidentiel ou ecotourisme.', price: 15000000, region: 'Ziguinchor', city: 'Ziguinchor', quartier: 'Bignona', surfaceM2: 1200, rooms: 0, lat: 12.5830, lng: -16.2710, images: '["https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: false, userId: 1 },
  { type: 'terrain', title: 'Terrain avec titre foncier — Rufisque', description: 'Terrain de 600 m² avec titre foncier authentique à Rufisque, ville en plein essor à 25 min de Dakar. Zone résidentielle calme, routes goudronnées, tous les réseaux disponibles (eau, électricité, internet fibre). Proche du nouveau marché et des écoles. Excellent investissement.', price: 28000000, region: 'Dakar', city: 'Rufisque', quartier: 'Rufisque Est', surfaceM2: 600, rooms: 0, lat: 14.7180, lng: -17.2590, images: '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=500&fit=crop"]', titleFoncier: true, isPremium: false, userId: 4 },

  // Plans architecturaux
  { type: 'plan', title: 'Plan Villa 4 chambres contemporaine', description: 'Plan architectural complet pour une villa contemporaine de 4 chambres. Surface au sol 200 m², étage possible. Inclut plans de coupe, façades, plan électrique et plomberie. Format PDF haute résolution. Modifiable sur demande avec supplément. Conçu par un architecte diplômé d\'État du Sénégal.', price: 150000, region: 'Dakar', city: 'Dakar', quartier: 'Plateau', surfaceM2: 200, rooms: 4, lat: 14.6680, lng: -17.4440, images: '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: true, userId: 2 },
  { type: 'plan', title: 'Plan Maison basse 3 chambres sénégalaise', description: 'Plan de maison basse adaptée au climat sénégalais avec patio central, véranda et puits de lumière. 3 chambres, 2 salles de bain, séjour ouvert sur cuisine. Optimisé pour la ventilation naturelle. Surface 120 m². Plans DF et DTG inclus. Format PDF + DWG.', price: 100000, region: 'Dakar', city: 'Dakar', quartier: 'Mermoz', surfaceM2: 120, rooms: 3, lat: 14.6880, lng: -17.4520, images: '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: false, userId: 2 },
  { type: 'plan', title: 'Plan Immeuble R+4 investissement locatif', description: 'Plan complet d\'immeuble R+4 destiné à l\'investissement locatif. 12 appartements (8 F2 et 4 F3) avec parkings en sous-sol. Surface totale 800 m². Plans structure, façades, électricité, plomberie et ascenseur. Conforme aux normes sénégalaises de construction. Étude de faisabilité incluse.', price: 350000, region: 'Dakar', city: 'Dakar', quartier: 'Plateau', surfaceM2: 800, rooms: 12, lat: 14.6680, lng: -17.4440, images: '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop"]', titleFoncier: false, isPremium: true, userId: 2 },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Create users with profiles
  const users: any[] = [];
  for (const u of DEMO_USERS) {
    const user = await db.user.create({
      data: {
        email: u.email,
        name: u.name,
        profile: {
          create: {
            fullName: u.name,
            phone: u.phone,
            whatsapp: u.whatsapp,
            agencyName: u.agencyName,
            role: u.role || 'user',
            verified: u.verified,
            bio: `Agent immobilier professionnel basé au Sénégal. ${u.agencyName} vous accompagne dans tous vos projets immobiliers.`,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user);
    console.log(`  ✓ User: ${user.name}`);
  }

  // Create buyer user
  const buyer = await db.user.create({
    data: {
      email: 'acheteur@sadekh.sn',
      name: 'Moussa Diop',
      profile: {
        create: {
          fullName: 'Moussa Diop',
          phone: '+221779876543',
          whatsapp: '+221779876543',
          role: 'user',
          bio: 'Acheteur intéressé par les biens immobiliers au Sénégal.',
        },
      },
    },
  });
  console.log(`  ✓ Buyer: ${buyer.name}`);

  // Create properties
  for (const p of DEMO_PROPERTIES) {
    await db.property.create({
      data: {
        userId: users[p.userId].id,
        type: p.type,
        title: p.title,
        description: p.description,
        price: p.price,
        priceNegotiable: Math.random() > 0.5,
        surfaceM2: p.surfaceM2,
        rooms: p.rooms,
        region: p.region,
        city: p.city,
        quartier: p.quartier,
        lat: p.lat,
        lng: p.lng,
        images: p.images,
        titleFoncier: p.titleFoncier,
        status: 'active',
        isPremium: p.isPremium,
        viewsCount: Math.floor(Math.random() * 500) + 50,
        planPdfUrl: p.type === 'plan' ? '/plans/sample-plan.pdf' : null,
        planPrice: p.type === 'plan' ? p.price : null,
        planDownloads: p.type === 'plan' ? Math.floor(Math.random() * 50) : 0,
      },
    });
    console.log(`  ✓ Property: ${p.title.substring(0, 40)}...`);
  }

  // Create some favorites for the buyer
  const allProperties = await db.property.findMany({ take: 5 });
  for (let i = 0; i < 3; i++) {
    await db.favorite.create({
      data: {
        userId: buyer.id,
        propertyId: allProperties[i].id,
      },
    });
  }
  console.log(`  ✓ Favorites created for buyer`);

  // Create some messages
  for (let i = 0; i < 4; i++) {
    await db.message.create({
      data: {
        senderId: buyer.id,
        receiverId: users[i].id,
        propertyId: allProperties[i]?.id,
        content: [
          'Bonjour, le bien est-il toujours disponible ?',
          'Quel est le prix final négocié ?',
          'Est-il possible de visiter cette semaine ?',
          'Merci, je suis très intéressé. Pouvez-vous me contacter sur WhatsApp ?',
        ][i],
      },
    });
  }
  console.log(`  ✓ Messages created`);

  console.log('\n✅ Seed completed successfully!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));