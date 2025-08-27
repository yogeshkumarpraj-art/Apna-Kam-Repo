
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys are not defined in the environment variables.');
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
