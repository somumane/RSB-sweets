import Stripe from "stripe";
import { validateCartItems } from "use-shopping-cart/utilities";
const stripe = Stripe(process.env.STRIPE_SECRETE_KEY);
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const cartDetails = req.body;
      const data = await stripe.products.list({
        expand: ["data.default_price"],
      });
      const products = data.data.map(product => {
        const price = product.default_price;
        return {
          currency: price.currency,
          id: product.id,
          name: product.name,
          price: price.unit_amount,
          image: product.images[0],
        };
      });
      const items = validateCartItems(products, cartDetails)
     const session= await stripe.checkout.sessions.create({
        mode:"payment",
        payment_method_types:['card'],
        line_items:items,
        success_url:`https://rsb-sweets-qjkg.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`https://rsb-sweets-qjkg.vercel.app/cart`       
       })
       res.status(200).json(session)
    }
     catch (error) {
     res.status(500).json({statusCode:500,message:error.message})

    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
}
