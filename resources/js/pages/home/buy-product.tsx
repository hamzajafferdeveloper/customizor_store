import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"; // if using ShadCN
import { Loader2 } from "lucide-react";

const BuyProduct = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/create-checkout-session");
      window.location.href = data.url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Buy Our Awesome Product
      </h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Complete your purchase securely using Stripe Checkout.
      </p>

      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-3 font-medium shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" /> Redirecting...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>
    </div>
  );
};

export default BuyProduct;
