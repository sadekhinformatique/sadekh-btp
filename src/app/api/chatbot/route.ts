import { NextResponse } from 'next/server';

// AI Chatbot for SADEKH BTP - uses z-ai-web-dev-sdk on the server
// Provides real estate assistance for Senegal

const KNOWLEDGE_BASE = [
  { keywords: ['prix', 'combien', 'couter', 'budget', 'tarif'], response: 'Les prix varient selon le type et la localisation :\n• Maisons : 45M - 185M FCFA\n• Appartements : 35M - 150M FCFA\n• Terrains : 15M - 40M FCFA\n• Plans architecturaux : 100K - 350K FCFA\n\nLes quartiers les plus chers sont Almadies, Plateau et Ngor à Dakar.' },
  { keywords: ['titre foncier', 'document', 'papier', 'legal', 'acte'], response: 'Le titre foncier est crucial au Sénégal. Voici les documents importants :\n• Titre foncier (propriété reconnue par l\'État)\n• Acte de vente notarié\n• Certificat de localisation\n• Plan de situation\n\nSADEKH BTP indique clairement si un bien dispose d\'un titre foncier avec la mention "Titre foncier" sur chaque annonce.' },
  { keywords: ['wave', 'orange money', 'paiement', 'payer', 'mobile money'], response: 'SADEKH BTP accepte les paiements mobile :\n• Wave : paiement instantané, aucun frais supplémentaire\n• Orange Money : paiement sécurisé par OTP\n\nLes services payants :\n• Boost d\'annonce : 5 000 FCFA\n• Annonce Premium : 15 000 FCFA\n• Plans architecturaux : 100K - 350K FCFA' },
  { keywords: ['quartier', 'region', 'zone', 'endroit', 'localisation'], response: 'Les principales zones immobilières au Sénégal :\n• Dakar : Almadies, Plateau, Mermoz, Fann Hock, Ngor, Liberté\n• Périphérie : Diamniadio, Rufisque\n• Autres régions : Thiès, Saint-Louis, Ziguinchor, Kaolack\n\nDiamniadio est en plein essor avec un fort potentiel de plus-value.' },
  { keywords: ['publier', 'vendre', 'deposer', 'annonce', 'poster'], response: 'Pour publier une annonce sur SADEKH BTP :\n1. Cliquez sur le bouton "+" dans la barre de navigation\n2. Choisissez le type de bien (maison, appartement, terrain, plan)\n3. Remplissez les détails (titre, description, prix, surface)\n4. Ajoutez des photos\n5. Sélectionnez la localisation sur la carte GPS\n6. Publiez !\n\nL\'inscription est gratuite. Le boost et le premium sont des options payantes.' },
  { keywords: ['investir', 'investissement', 'rentabilite', 'locatif'], response: 'Le Sénégal offre de belles opportunités d\'investissement :\n• Dakar : forte demande locative, rendement 6-10%\n• Diamniadio : nouveau pôle urbain, plus-value attendue 15-25%\n• Saly/Mbour : potentiel location saisonnière\n\nConseil : les terrains viabilisés avec titre foncier à Diamniadio offrent le meilleur rapport risque/rendement.' },
  { keywords: ['plan', 'architecte', 'construction', 'batir', 'maison'], response: 'SADEKH BTP propose des plans architecturaux :\n• Villa contemporaine 4 chambres (200 m²) - 150K FCFA\n• Maison basse 3 chambres (120 m²) - 100K FCFA\n• Immeuble R+4 investissement locatif (800 m²) - 350K FCFA\n\nTous les plans sont conçus par des architectes diplômés d\'État sénégalais et adaptés au climat tropical.' },
  { keywords: ['contact', 'whatsapp', 'telephone', 'joindre', 'aide'], response: 'Pour nous contacter :\n• WhatsApp : utilisez le bouton WhatsApp sur chaque annonce\n• Messages : envoyez un message directement via la plateforme\n• Email : info@sadekhbtp.sn\n\nLes agents vérifiés ont un badge vert "Vérifié" sur leur profil.' },
];

function findBestResponse(message: string): string {
  const lower = message.toLowerCase();
  let bestMatch = KNOWLEDGE_BASE[0];
  let bestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestScore > 0) return bestMatch.response;

  // Default response
  return 'Je suis l\'assistant SADEKH BTP ! Je peux vous aider avec :\n• Les prix de l\'immobilier au Sénégal\n• Les documents nécessaires (titre foncier)\n• Le paiement mobile (Wave / Orange Money)\n• Les meilleurs quartiers et régions\n• La publication d\'une annonce\n• Les plans architecturaux\n• L\'investissement immobilier\n\nPosez-moi votre question !';
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const response = findBestResponse(message);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}