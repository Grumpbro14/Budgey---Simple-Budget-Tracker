import React from "react";
import LegalPage from "@/components/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="September 16, 2026">
      <p>
        BudgyBoom ("Budgey," "we," "us") is a personal budgeting app that helps you track income, expenses,
        savings goals, budgets, loans, and bills. This policy explains what data we collect, how we use it,
        and the choices you have.
      </p>

      <h2>Information We Collect</h2>
      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your email address, first name, and last name. Your password
        is hashed and never stored in plain text.
      </p>

      <h3>Preferences</h3>
      <p>
        We store your preferences on your account, such as your light/dark theme choice and whether bill
        reminder emails are enabled. These settings stay with your account until you change them.
      </p>

      <h3>Financial Data You Enter</h3>
      <p>
        You voluntarily add financial records such as transactions, savings goals, category budgets, loans,
        and bill reminders. <strong>We never connect to your bank or financial institutions.</strong> All
        financial data is manually entered by you. When your account is new and empty, the app may display
        illustrative placeholder ("Fake") transactions and charts to show you what the app looks like — these
        are not real records and disappear once you add your own data.
      </p>

      <h3>Payment Information</h3>
      <p>
        If you purchase Budgey Pro, checkout is handled by our payment provider (Wix Payments). We
        receive a confirmation of your purchase and subscription status, but your card details are processed
        entirely by the payment provider and never touch our servers.
      </p>

      <h3>Usage Data</h3>
      <p>
        We collect basic analytics such as which features are used and app performance metrics to improve
        the product. This data is aggregated and not linked to your identity.
      </p>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>To display your budgets, goals, transactions, loans, and bills within the app</li>
        <li>To send you bill reminder notifications and weekly spending summary emails (if enabled)</li>
        <li>To remember your theme and notification preferences across sessions</li>
        <li>To verify and manage your Pro subscription status</li>
        <li>To improve app features and fix issues</li>
      </ul>

      <h2>Data Storage & Security</h2>
      <p>
        Your data is stored securely and isolated per user — other users cannot see your records. We use
        row-level security to enforce this isolation. Only you and authorized platform administrators can
        access your data. All data is transmitted over encrypted connections (HTTPS/TLS).
      </p>

      <h2>Email Communications</h2>
      <p>
        We may send you bill reminders and weekly spending summaries if you enable them. You can disable
        email reminders at any time in your bill settings. Account-related emails (password reset, etc.)
        are sent as needed.
      </p>

      <h2>Your Rights</h2>
      <ul>
        <li><strong>Access:</strong> You can view all your data within the app at any time.</li>
        <li><strong>Delete:</strong> You can delete individual records or your entire account at any time
        from Settings. Deleting your account permanently removes all your transactions, goals, budgets,
        loans, bills, notifications, and Pro access.</li>
        <li><strong>Export:</strong> You may request a copy of your data by contacting support.</li>
        <li><strong>Opt-out:</strong> You can disable notifications and email summaries in app settings.</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>
        We use third-party services for payments (Wix Payments) and app infrastructure. These providers
        have their own privacy policies governing data they process on our behalf. We do not sell or share
        your personal data with advertisers or data brokers.
      </p>

      <h2>Children's Privacy</h2>
      <p>
        Budgey is not directed at children under 13. We do not knowingly collect data from children under 13.
        If you believe a child has provided us information, please contact support so we can delete it.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. We'll notify you of significant changes via the app
        or email. Continued use after changes constitutes acceptance.
      </p>
    </LegalPage>
  );
}