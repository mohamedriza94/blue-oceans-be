import Stripe from "stripe";
import { envData } from "../../constants/env-data";

// Initialize Stripe
const stripe = new Stripe(envData.stripeApiKey || "", {
  apiVersion: "2024-12-18.acacia",
});

export const createPaymentIntent = async ({
  total,
  transferGroup,
  currency = "usd",
  description,
}: {
  total: number;
  transferGroup: string;
  currency?: string;
  description: string;
}) => {
  try {
    // Convert total to cents
    const roundedTotal = Math.round(total * 100);

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: roundedTotal,
      currency,
      payment_method_types: ["card"],
      transfer_group: transferGroup,
      description,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Unable to create payment intent");
  }
};
