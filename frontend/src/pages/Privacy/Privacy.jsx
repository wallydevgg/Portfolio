import React from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/macro";
import PageSEO from "@/components/SEO/PageSEO";
import "./Privacy.scss";

const Privacy = () => {
  useLingui();

  return (
    <div className="privacy-page">
      <PageSEO 
        title="Privacy Policy | wallydev" 
        description="Privacy Policy for wallydev.dev" 
      />
      
      <div className="privacy-container">
        <h1><Trans>Privacy Policy</Trans></h1>
        <p className="last-updated"><Trans>Last updated: August 2026</Trans></p>

        <section>
          <h2><Trans>1. Information We Collect</Trans></h2>
          <p><Trans>When you use the contact form on this website, we collect the following information:</Trans></p>
          <ul>
            <li><Trans><strong>Personal Information:</strong> Name and email address.</Trans></li>
            <li><Trans><strong>Message Content:</strong> The subject and body of your message.</Trans></li>
            <li><Trans><strong>Technical Data:</strong> IP address, browser user agent, and approximate location (country/region) to prevent spam and abuse.</Trans></li>
          </ul>
        </section>

        <section>
          <h2><Trans>2. How We Use Your Information</Trans></h2>
          <p><Trans>The information collected is used exclusively for:</Trans></p>
          <ul>
            <li><Trans>Responding to your inquiries and messages.</Trans></li>
            <li><Trans>Protecting the website against spam, bots, and abuse (via Cloudflare Turnstile and rate limiting).</Trans></li>
          </ul>
          <p><Trans>We do not sell, rent, or share your personal information with third parties for marketing purposes.</Trans></p>
        </section>

        <section>
          <h2><Trans>3. Data Retention</Trans></h2>
          <p><Trans>Contact form submissions are stored securely in our database. We retain this information for up to 12 months, after which it may be permanently deleted. Spam messages are deleted periodically.</Trans></p>
        </section>

        <section>
          <h2><Trans>4. Your Rights (GDPR / LGPD)</Trans></h2>
          <p><Trans>You have the right to:</Trans></p>
          <ul>
            <li><Trans>Request access to the personal data we hold about you.</Trans></li>
            <li><Trans>Request correction of inaccurate data.</Trans></li>
            <li><Trans>Request deletion of your data.</Trans></li>
          </ul>
          <p><Trans>To exercise any of these rights, please contact us at <strong>contact@wallydev.dev</strong>.</Trans></p>
        </section>

        <section>
          <h2><Trans>5. Third-Party Services</Trans></h2>
          <p><Trans>This website uses Cloudflare Turnstile to prevent spam. Turnstile may collect technical information about your device and browser to verify that you are a human. This data is processed in accordance with Cloudflare's Privacy Policy.</Trans></p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
