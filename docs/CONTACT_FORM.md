Contact form details

The site's contact form is implemented using FormSubmit (https://formsubmit.co). When a visitor sends a message it is forwarded to the email address configured in the form (currently `farhankabir236@gmail.com`).

Important: FormSubmit requires a one-time verification for the receiving address. After the first submission you'll receive a confirmation email at `farhankabir236@gmail.com` — you must click the confirmation link in that email before FormSubmit will forward future messages to your inbox.

If you prefer to avoid a third-party forwarding service, you can replace the form endpoint with a serverless function (Vercel/Netlify) or integrate an email provider (SendGrid, Mailgun) and store credentials as repository secrets.
