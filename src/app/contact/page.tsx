'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { logError } from '@/lib/error-logger';


interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactType: 'general' | 'support' | 'community' | 'press' | 'partnerships';
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          contactType: 'general'
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      logError('Contact form error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-medium text-ink mb-4">
              Message Sent Successfully
            </h1>
            <p className="text-ink/70 mb-6">
              Thank you for reaching out. We&apos;ll get back to you within 2-3 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 text-accent hover:text-accent/80 underline"
              >
                Send Another Message
              </button>
              <Link
                href="/library"
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                Back to Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-ink mb-4">
            Contact Us
          </h1>
          <p className="text-ink/70 leading-relaxed">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <h3 className="font-medium text-ink mb-2">General Inquiries</h3>
            <p className="text-sm text-ink/70">
              Questions about the platform, features, or partnerships. Use the form below to get in touch.
            </p>
          </div>
          <div className="card">
            <h3 className="font-medium text-ink mb-2">Community Support</h3>
            <p className="text-sm text-ink/70">
              Help with your account, communities, or content. We typically respond within 2-3 business days.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card">
          <h2 className="text-xl font-medium text-ink mb-6">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Type */}
            <div>
              <label htmlFor="contactType" className="block text-sm font-medium text-ink mb-2">
                What can we help you with?
              </label>
              <select
                id="contactType"
                value={formData.contactType}
                onChange={(e) => handleInputChange('contactType', e.target.value as ContactFormData['contactType'])}
                className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              >
                <option value="general">General Questions</option>
                <option value="support">Technical Support</option>
                <option value="community">Community Issues</option>
                <option value="press">Press & Media</option>
                <option value="partnerships">Partnerships</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                placeholder="Enter your email address"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-ink mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
                className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                placeholder="Brief description of your inquiry"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-ink mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                required
                rows={6}
                className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
                placeholder="Please provide details about your inquiry..."
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-ink/60">
                  {formData.message.length} characters
                </span>
                {formData.message.length < 10 && (
                  <span className="text-xs text-red-600">Please provide more details (minimum 10 characters)</span>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Privacy:</strong> Your message will be sent directly to our team. 
                We don&apos;t share your contact information with third parties. 
                Read our <Link href="/transparency" className="underline hover:text-blue-600">transparency policy</Link> for more details.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || formData.message.length < 10}
                className="flex-1 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              <Link
                href="/library"
                className="px-6 py-3 border border-border rounded-md text-ink hover:bg-panel transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Response Time Notice */}
        <div className="mt-8 text-center text-sm text-ink/60">
          <p>
            We aim to respond to all inquiries within 2-3 business days. Thank you for your patience!
          </p>
        </div>
      </div>
    </div>
  );
}