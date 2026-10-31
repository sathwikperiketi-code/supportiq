export type Article = {
  id: number; title: string; category: string; updated: string; views: string; status: 'Published' | 'Draft'
  excerpt: string; content: string
}
export const articles: Article[] = [
  { id: 1, title: 'Reset your account password', category: 'Account', updated: '2 hours ago', views: '2.4k', status: 'Published', excerpt: 'Steps to securely reset a forgotten password.', content: 'Open Sign in, choose Forgot password, enter the email linked to your account, and follow the secure reset link. The link expires after 30 minutes. If it does not arrive, check spam and confirm you entered the correct email.' },
  { id: 2, title: 'Track an order or shipment', category: 'Orders', updated: 'Yesterday', views: '1.8k', status: 'Published', excerpt: 'Find the latest status and tracking information for an order.', content: 'Open Orders from your account dashboard, select the order, and choose Track shipment. Tracking details appear after the carrier scans the package. If there has been no update for 48 hours, contact support with your order number.' },
  { id: 3, title: 'Refund eligibility and timelines', category: 'Billing', updated: 'Yesterday', views: '1.2k', status: 'Published', excerpt: 'Understand when refunds are available and how long they take.', content: 'Refund eligibility depends on the product and purchase terms. Approved refunds are usually returned to the original payment method within 5–10 business days. Your bank may need additional time to display the credit.' },
  { id: 4, title: 'Update billing information', category: 'Billing', updated: '2 days ago', views: '946', status: 'Published', excerpt: 'Change the billing address and payment details on an account.', content: 'Go to Settings, then Billing. Choose Edit next to billing information, update the required fields, and save. For payment method changes, use the secure payment form; support agents will never ask you to send full card details.' },
  { id: 5, title: 'Contact a human support agent', category: 'Support', updated: '3 days ago', views: '820', status: 'Published', excerpt: 'How to reach the support team when self-service is not enough.', content: 'Use Help → Contact support to open a request. Include the relevant order or ticket ID and a short description. Do not include passwords, full payment card details, or other sensitive information.' },
  { id: 6, title: 'Two-factor authentication guide', category: 'Security', updated: '4 days ago', views: '702', status: 'Draft', excerpt: 'Set up an additional layer of account security.', content: 'Open Security settings and choose Two-factor authentication. Follow the setup steps and store recovery codes somewhere safe. Never share a verification code with anyone.' },
]
export const questions = [
  { text: 'Can I change the email address on my account?', count: 46, tag: 'Account' },
  { text: 'Why was my payment declined?', count: 31, tag: 'Billing' },
  { text: 'Can I change a delivery address after ordering?', count: 28, tag: 'Orders' },
]
export const activities = [
  { title: 'Password reset article updated', detail: 'Knowledge base · 12 min ago', kind: 'edit' },
  { title: 'New unanswered question detected', detail: 'Support chat · 34 min ago', kind: 'question' },
  { title: 'Refund policy article published', detail: 'Knowledge base · 1 hr ago', kind: 'publish' },
  { title: 'Weekly knowledge report generated', detail: 'Analytics · 3 hrs ago', kind: 'report' },
]
