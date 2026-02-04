
import { GoogleGenAI } from "@google/genai";
import { Contact, Activity } from '../types';

// Helper to get client instance dynamically to support API key updates
const getGenAI = () => {
  // Check LocalStorage first (User input), then Environment variable
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Helper to check if AI is available
export const isAIAvailable = () => !!(localStorage.getItem('gemini_api_key') || process.env.API_KEY);

export const generateEmailDraft = async (
  contact: Contact,
  instruction: string,
  tone: string = 'professional'
): Promise<string> => {
  const ai = getGenAI();
  if (!ai) return "Clé API manquante. Veuillez configurer la clé dans les paramètres.";

  const modelId = 'gemini-3-flash-preview';

  const prompt = `
    You are an expert consultant assistant for a firm specializing in GFSI standards (BRCGS, IFS, FSSC 22000, SQF) and quality management.
    
    Task: Draft a ${tone} email to a client.
    
    Client Context:
    Name: ${contact.firstName} ${contact.lastName}
    Company: ${contact.company}
    Interest: ${contact.certificationInterest || 'General Consulting'}
    Recent History: Last contact was on ${new Date(contact.lastContact).toLocaleDateString()}.
    
    User Instruction: ${instruction}
    
    Please provide only the body of the email. Do not include subject lines or placeholders unless necessary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Impossible de générer le brouillon.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la génération. Veuillez vérifier votre clé API.";
  }
};

export const analyzeContactHistory = async (contact: Contact): Promise<string> => {
  const ai = getGenAI();
  if (!ai) return "Clé API manquante.";

  const activitiesText = contact.activities
    .slice(0, 10)
    .map(a => `- [${a.date.split('T')[0]}] ${a.type.toUpperCase()}: ${a.description}`)
    .join('\n');

  const prompt = `
    Analyze the recent interaction history for this consulting lead and suggest the next best action.
    
    Client: ${contact.company} (${contact.firstName})
    Status: ${contact.status}
    
    History:
    ${activitiesText}
    
    Output a concise summary (max 3 bullet points) and one concrete "Next Step" recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Aucune analyse disponible.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erreur lors de l'analyse de l'historique.";
  }
};

export const summarizeMeetingNotes = async (rawNotes: string): Promise<{ summary: string; actionItems: string[] }> => {
    const ai = getGenAI();
    if (!ai) return { summary: "Clé API manquante", actionItems: [] };

    const prompt = `
      Summarize the following meeting notes for a quality consulting session. 
      Extract key decisions and a list of action items.
      
      Return JSON format: { "summary": "...", "actionItems": ["...", "..."] }

      Notes:
      ${rawNotes}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text;
        if (!text) throw new Error("Réponse vide");
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return { summary: "Échec du résumé", actionItems: [] };
    }
}

export const generateConsultingProposal = async (
    contact: Contact,
    needs: string,
    standard: string
): Promise<string> => {
    const ai = getGenAI();
    if (!ai) return "Clé API manquante.";

    const prompt = `
        Rédige une proposition commerciale détaillée (Offre de Service) pour une mission de conseil.
        
        Client : ${contact.company}
        Contact : ${contact.firstName} ${contact.lastName}
        Référentiel cible : ${standard}
        Besoins spécifiques : ${needs}

        Structure de l'offre attendue :
        1. Contexte et Compréhension du besoin
        2. Méthodologie proposée (ex: Diagnostic, Formation, Mise en place documentaire, Audit à blanc)
        3. Livrables
        4. Planning estimatif
        5. Budget estimatif (laisser des xxxx€)

        Ton : Professionnel, persuasif, expert en Qualité/GFSI.
        Langue : Français.
        Format : Markdown propre.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Impossible de générer l'offre.";
    } catch (error) {
        console.error("Gemini Proposal Error:", error);
        return "Erreur lors de la génération de l'offre.";
    }
}

export const askDocument = async (fileName: string, question: string): Promise<string> => {
    const ai = getGenAI();
    if (!ai) return "Clé API manquante.";

    // NOTE: In a real app, we would send the file content (base64) here.
    // For this demo, we simulate the AI knowing the context based on the filename/type.
    const prompt = `
      User is asking a question about a document named "${fileName}".
      Since I cannot physically read the file in this demo environment, 
      please provide a helpful, generic answer based on what such a document usually contains in a GFSI/Quality context.
      
      If it's an "Audit Report", talk about non-conformities and scoring.
      If it's a "Scope Extension", talk about product categories.
      
      User Question: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Je n'ai pas pu analyser ce document.";
    } catch (error) {
        return "Erreur lors de l'analyse du document.";
    }
}
