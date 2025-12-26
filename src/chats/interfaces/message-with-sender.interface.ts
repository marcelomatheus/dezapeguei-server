export interface TranslationType {
  originalText: string;
  translatedText: string;
  targetLanguage: string;
}

export interface CorrectionSuggestions {
  suggestionText: string;
  reason: string;
}

export interface MessageWithSender {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  translation: TranslationType | null;
  correctionSuggestions: CorrectionSuggestions | null;
  createdAt: Date;
  updatedAt: Date;
}
