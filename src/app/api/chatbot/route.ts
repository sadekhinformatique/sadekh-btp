import { NextResponse } from 'next/server';

// System prompt for the AI chatbot
const SYSTEM_PROMPT = `Tu es l'assistant IA de SADEKH BTP, la première marketplace immobilière sénégalaise. Tu aides les utilisateurs en français et en wolof.

Informations clés :
- Types de biens : maisons (45M-185M FCFA), appartements (35M-150M FCFA), terrains (15M-40M FCFA), plans architecturaux (100K-350K FCFA)
- Zones principales : Almadies, Plateau, Mermoz, Fann Hock, Ngor, Diamniadio, Thiès, Saint-Louis, Ziguinchor
- Paiements : Wave et Orange Money acceptés
- Services payants : Boost (5 000 FCFA), Premium (15 000 FCFA)
- Documents : titre foncier, acte de vente notarié, certificat de localisation
- Contact : WhatsApp, messages, info@sadekhbtp.sn

Réponds de manière concise, amicale et utile. Si la question n'est pas liée à l'immobilier, redirige poliment vers le sujet.`;

// Fallback knowledge base for when AI is not available
const FALLBACK_RESPONSES: Record<string, string> = {
  prix: 'Les prix varient : Maisons 45M-185M FCFA, Appartements 35M-150M FCFA, Terrains 15M-40M FCFA, Plans 100K-350K FCFA.',
  'titre foncier': 'Le titre foncier est crucial. Demandez toujours ce document avant tout achat.',
  wave: 'Wave : paiement instantané, aucun frais. Boost 5 000 FCFA, Premium 15 000 FCFA.',
  'orange money': 'Orange Money : paiement par OTP sécurisé. Mêmes tarifs que Wave.',
  quartier: 'Zones prisées : Almadies, Plateau, Mermoz, Ngor. Diamniadio en plein essor.',
  publier: 'Cliquez "+", remplissez le formulaire, ajoutez des photos et sélectionnez la localisation GPS.',
  investir: 'Dakar : rendement 6-10%. Diamniadio : plus-value attendue 15-25%. Saly : location saisonnière.',
  plan: 'Plans : Villa 4ch (150K), Maison 3ch (100K), Immeuble R+4 (350K). Architectes diplômés d\'État.',
  contact: 'WhatsApp sur chaque annonce, messages via la plateforme, ou info@sadekhbtp.sn.',
};

const DEFAULT_RESPONSE = 'Je suis l\'assistant SADEKH BTP ! Je peux vous aider avec les prix, quartiers, paiement mobile, documents, publication d\'annonces et plans architecturaux. Posez-moi votre question !';

// Try to use z-ai-web-dev-sdk for AI response
async function getAIResponse(message: string, conversationHistory: Array<{role: string; content: string}>): Promise<string> {
  try {
    // Dynamic import to avoid build errors if SDK is not available
    const { chat } = await import('z-ai-web-dev-sdk');

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message },
    ];

    const result = await chat({
      model: 'glm-4-flash',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    if (result?.content) return result.content;
    throw new Error('No content in response');
  } catch (err) {
    console.warn('AI SDK unavailable, using fallback:', (err as Error).message);
    return null;
  }
}

// Fallback keyword matching
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return DEFAULT_RESPONSE;
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Try AI first, fallback to keyword matching
    const aiResponse = await getAIResponse(message, history || []);
    const response = aiResponse || getFallbackResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ response: DEFAULT_RESPONSE });
  }
}