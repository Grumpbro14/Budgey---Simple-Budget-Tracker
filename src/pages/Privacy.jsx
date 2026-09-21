import React from "react";
import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="September 16, 2026">
      <p>
        Budgey - Fun & Simple Budgeting is operated from Texas, USA. Contact: budgey.help@outlook.com
      </p>

      <h2>1. Age Requirement</h2>
      <p>
        You must be at least 13 years old to use Budgey. If you are under 18, you may only use Budgey
        with permission from a parent or guardian. We do not knowingly collect data from children
        under 13.
      </p>

      <h2>2. Data We Collect</h2>
      <p>
        We only store what you manually enter to make the app work: display name, email,
        transactions (income/expenses you enter manually), budgets, savings goals, loans, bill
        reminders, and preferences (theme). All data is encrypted in transit (HTTPS/TLS) and
        isolated per account.
      </p>

      <h2>3. What We Do NOT Collect</h2>
      <p>
        We do not connect to your bank. We do not collect bank account numbers, card numbers, or
        financial credentials. We do not sell your data, share it with advertisers or data brokers,
        or track you across other apps.
      </p>

      <h2>4. Purchases</h2>
      <p>
        All payments are processed by Google Play Billing. We do not receive or store your payment
        information. We only receive a purchase token to verify Pro status.
      </p>

      <h2>5. How We Use Data</h2>
      <p>
        Only to provide the app, sync your data, send reminders if enabled, verify Pro, prevent
        abuse, and provide support.
      </p>

      <h2>6. Sharing</h2>
      <p>
        We do not sell or share personal data except when required by law, to prevent fraud/abuse,
        or with Google for payment verification.
      </p>

      <h2>7. Retention & Security</h2>
      <p>
        We retain data while your account is active. We use industry-standard security measures.
        You can delete data at any time.
      </p>

      <h2>8. Your Rights</h2>
      <p>
        Delete individual items in-app, or delete your entire account via Settings &gt; Delete
        Account. To request an export or deletion, email budgey.help@outlook.com.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy. Material changes will be notified in-app. Current version at:{" "}
        <a href="https://budgey-fun-and-simple-budgeting.base44.app/privacy" className="text-primary font-semibold hover:underline">
          https://budgey-fun-and-simple-budgeting.base44.app/privacy
        </a>
      </p>

      <h2>10. Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:budgey.help@outlook.com" className="text-primary font-semibold hover:underline">
          budgey.help@outlook.com
        </a>
      </p>
    </LegalPage>
  );
}