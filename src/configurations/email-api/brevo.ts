import { envData } from "../../constants/env-data";
import { TCampaignOptions, TEmailOptions } from "./types";
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = envData.brevoAPIKey as string;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
const campaignEmailApi = new SibApiV3Sdk.EmailCampaignsApi();

// ------------------------------------------------------------------------------------------------------------------

// START : TRANSACTIONAL EMAIL
export const sendTransactionalEmail = async (
  options: TEmailOptions
): Promise<boolean> => {
  const { to, subject, templateType, templateData, htmlContent, sender } =
    options;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = to;
  sendSmtpEmail.subject = subject;

  if (templateType === "brevo") {
    if (!templateData) {
      console.error(
        "Brevo template type selected, but no template data provided."
      );
      return false;
    }
    sendSmtpEmail.templateId = parseInt(templateData.id);
    sendSmtpEmail.params = templateData.params;
  } else if (templateType === "custom") {
    if (!htmlContent) {
      console.error(
        "Custom template type selected, but no HTML content provided."
      );
      return false;
    }
    sendSmtpEmail.htmlContent = htmlContent;
  } else {
    console.error(
      "Invalid template type provided. Must be either 'brevo' or 'custom'."
    );
    return false;
  }

  if(sender?.email){
    sendSmtpEmail.sender = sender;
  }

  try {
    await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log("Transactional email sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send transactional email:", error);
    return false;
  }
};
// END : TRANSACTIONAL EMAIL

// ------------------------------------------------------------------------------------------------------------------

// START : CAMPAIGN EMAILS
export const sendCampaignEmail = async (
  options: TCampaignOptions
): Promise<boolean> => {
  const {
    name,
    subject,
    sender,
    templateType,
    templateData,
    htmlContent,
    recipientListId,
  } = options;

  const campaign = new SibApiV3Sdk.CreateEmailCampaign();
  campaign.name = name;
  campaign.subject = subject;
  campaign.sender = sender;
  campaign.recipients = { listIds: [recipientListId] };

  if (templateType === "brevo") {
    if (!templateData) {
      console.error(
        "Brevo template type selected, but no template data provided."
      );
      return false;
    }
    campaign.templateId = parseInt(templateData.id);
    campaign.params = templateData.params;
  } else if (templateType === "custom") {
    if (!htmlContent) {
      console.error(
        "Custom template type selected, but no HTML content provided."
      );
      return false;
    }
    campaign.htmlContent = htmlContent;
  } else {
    console.error(
      "Invalid template type provided. Must be either 'brevo' or 'custom'."
    );
    return false;
  }

  try {
    await campaignEmailApi.createEmailCampaign(campaign);
    console.log("Campaign email created successfully");
    return true;
  } catch (error) {
    console.error("Failed to create campaign email:", error);
    return false;
  }
};
// END : CAMPAIGN EMAILS
