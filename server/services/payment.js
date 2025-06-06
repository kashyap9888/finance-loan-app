// Dummy payment service (replace with Razorpay/Stripe in production)

const verifyPayment = (userId, amount) => {
  const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  console.log(`Processing payment of ₹${amount} for user ${userId} (Transaction ID: ${transactionId})`);
  
  return { 
    transactionId, 
    status: 'success',
    amount,
    timestamp: new Date(),
    message: `Successfully processed ₹${amount} payment`
  };
};

const processLoanDisbursement = (userId, loanId, amount) => {
  const transactionId = 'LOAN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  console.log(`Disbursing loan of ₹${amount} to user ${userId} for loan ${loanId} (Transaction ID: ${transactionId})`);
  
  return {
    transactionId,
    status: 'success',
    amount,
    timestamp: new Date(),
    message: `Successfully disbursed ₹${amount} to user's account`
  };
};

const processRepayment = (userId, loanId, amount) => {
  const transactionId = 'REPAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  console.log(`Processing repayment of ₹${amount} from user ${userId} for loan ${loanId} (Transaction ID: ${transactionId})`);
  
  return {
    transactionId,
    status: 'success',
    amount,
    timestamp: new Date(),
    message: `Successfully processed repayment of ₹${amount}`
  };
};

module.exports = { verifyPayment, processLoanDisbursement, processRepayment };