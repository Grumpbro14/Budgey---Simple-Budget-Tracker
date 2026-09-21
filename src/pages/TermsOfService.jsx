import React from "react";
import LegalPage from "@/components/LegalPage";

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="September 16, 2026">
      <p>
        Welcome to Budgey - Fun and Simple Budgeting. By using the app you agree to these Terms.
      </p>

      <h2>1. What Budgey Is</h2>
      <p>
        Budgey is a personal budgeting tracker for manually entered income, expenses, budgets, savings
        goals, loans and bill reminders. Sample data may be shown in an empty account for demo purposes
        only.
      </p>

      <h2>2. Account &amp; Age</h2>
      <p>
        You must be at least 13 years old to use Budgey, or 18+ to purchase Pro. If under 18, use only
        with parent/guardian permission. You are responsible for keeping your login secure.
      </p>

      <h2>3. Your Data</h2>
      <p>
        You own the data you enter. You can delete individual records or your entire account anytime via
        Settings &gt; Delete Account.
      </p>

      <h2>4. Budgey Pro &amp; Billing</h2>
      <p>All payments are processed and managed by Google Play Billing.</p>
      <p>
        <strong>Pro Free:</strong> Track transactions, budgets, loans, up to 5 savings goals and 1
        bill reminder.
      </p>
      <p>
        <strong>Pro:</strong> Unlimited goals/reminders, advanced insights, charts, history, loan
        interest tracking.
      </p>
      <h3>Plans</h3>
      <p>
        <strong>Monthly $5/month</strong> - billed monthly, cancel anytime in Google Play &gt; Payments
        &amp; subscriptions. Access remains until end of current period.
      </p>
      <p>
        <strong>Lifetime $20</strong> - one-time payment for permanent Pro access on your account.
      </p>
      <p>
        All refunds, cancellations and billing inquiries are handled under Google Play's billing
        policy. For issues, contact Google Play Support or us at budgey.help@outlook.com
      </p>

      <h2>5. Reminders</h2>
      <p>
        Bill reminders and emails are a convenience feature requiring your consent. We are not liable
        for missed payments due to email delivery, spam filters, or outages. Do not rely solely on
        Budgey for critical deadlines.
      </p>

      <h2>6. No Financial Advice</h2>
      <p>
        Budgey provides tracking tools only and does not provide financial, tax, or investment advice.
      </p>

      <h2>7. Acceptable Use</h2>
      <p>
        Do not use Budgey unlawfully, attempt to access other users' data, reverse-engineer the app, or
        interfere with its operation.
      </p>

      <h2>8. Suspension &amp; Termination</h2>
      <p>
        You may delete your account anytime. We may suspend accounts that violate these Terms, engage
        in fraud, abuse, or create security risks. If suspended, you will see the reason on login and
        may appeal within 14 days by emailing budgey.help@outlook.com with subject "Appeal - [your
        email]". We review appeals within 7 business days.
      </p>

      <h2>9. Disclaimer &amp; Liability</h2>
      <p>
        Budgey is provided "as is" without warranties. To the fullest extent permitted by Texas law, our
        liability is limited to the amount you paid for Pro in the last 12 months.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms. We will notify you of material changes in-app. Latest version at:{" "}
        <a href="https://budgey-fun-and-simple-budgeting.base44.app/terms-of-service" className="text-primary font-semibold hover:underline">
          https://budgey-fun-and-simple-budgeting.base44.app/terms-of-service
        </a>
      </p>

      <h2>11. Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:budgey.help@outlook.com" className="text-primary font-semibold hover:underline">
          budgey.help@outlook.com
        </a>
      </p>
      <p>Governing Law: Texas, USA</p>
    </LegalPage>
  );
}