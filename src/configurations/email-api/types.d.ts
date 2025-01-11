export type TTemplateType = "custom" | "brevo";

// Transactional Emails Type
export type TEmailOptions = {
  to: { email: string; name?: string }[];
  subject: string;
  templateType: TTemplateType;
  templateData?: {
    id: string;
    params: Record<string, any>;
  };
  htmlContent?: string;
  sender?: { email: string; name?: string };
};

// Campaign Emails Type
export type TCampaignOptions = {
  name: string;
  subject: string;
  sender: { email: string; name?: string };
  templateType: TTemplateType;
  templateData?: {
    id: string;
    params: Record<string, any>;
  };
  htmlContent?: string;
  recipientListId: number; // ID of contact list in Brevo
};
