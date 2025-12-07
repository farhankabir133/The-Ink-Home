import React, { useState } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success';

const CONTACT_EMAIL = 'farhankabir236@gmail.com';

const ContactPage: React.FC = () => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Use FormSubmit's AJAX endpoint. No backend required. Note: the first
    // submission may require verifying the email (formsubmit.co sends a one-time
    // confirmation link) — after that messages will be forwarded to the inbox.
    const endpoint = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !email.trim() || !message.trim()) {
            setError('Please fill out all fields.');
            return;
        }
        setStatus('submitting');

        try {
            const body = {
                name,
                email,
                message,
                _subject: `Website contact form — ${name}`,
                // Honeypot (spam) field — keep empty
                _honey: '',
                // Reply-To header for convenience
                _replyto: email,
            } as Record<string, string>;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error((data && data.message) || 'Failed to send message');
            }

            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
        } catch (err: any) {
            console.error('Contact form error:', err);
            setError(err?.message || 'An unexpected error occurred. Please try again later.');
            setStatus('idle');
        }
    };

    return (
        <div className="opacity-0 animate-fadeInUp">
             <div className="bg-slate-50 dark:bg-gray-900/50 py-24 px-6 transition-colors duration-500">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 animate-scaleIn">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        Have a story to share, a question, or just want to say hello? We'd love to hear from you.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800/50 p-8 rounded-lg shadow-md transition-colors duration-500">
                    {status === 'success' ? (
                        <div className="text-center py-12 animate-scaleIn">
                            <h3 className="text-2xl font-serif text-slate-800 dark:text-slate-100 mb-2">Thank you!</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                            <button onClick={() => setStatus('idle')} className="bg-ink-accent text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition">
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-center mb-6 text-slate-600 dark:text-slate-300">
                                For submissions or feedback, please use the form below or email us directly at <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink-accent hover:underline">{CONTACT_EMAIL}</a>.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Visible note about verifying the receiving email for FormSubmit */}
                                <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    <strong>Note:</strong> The contact form uses FormSubmit.co to deliver messages. The first time this address is used you'll receive a confirmation email at <span className="font-mono">farhankabir236@gmail.com</span> — please confirm that message so future submissions are forwarded to your inbox.
                                </div>
                                {/* Honeypot field for spam bots */}
                                <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                                {/* Optional: disable default browser autocomplete for sensitive fields */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-ink-accent transition-colors duration-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-ink-accent transition-colors duration-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Message</label>
                                    <textarea
                                        required
                                        id="message"
                                        name="message"
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-ink-accent transition-colors duration-500"
                                    ></textarea>
                                </div>
                                {error && (
                                    <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                                )}
                                <div className="text-center">
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'}
                                        className="w-full sm:w-auto bg-ink-accent text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                                    >
                                        {status === 'submitting' ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;