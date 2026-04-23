'use client';

import React from 'react';
import { ShieldCheck, Eye, Database, Heart, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SafariButton } from '../_components/SafariButton';
import { PoweredByFooter } from '../_components/PoweredByFooter';

export default function PrivacyPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'What We Collect',
      icon: <Eye className="text-forest" />,
      content: 'We collect your name, safari details, and the photos you choose to share to generate your personalized SafariWrap. Your email is used only to send you the link to your wrap.',
    },
    {
      title: 'How We Use It',
      icon: <Heart className="text-forest" />,
      content: 'Your data is used specifically for your review and wrap generation. We share planting coordinates with you as part of our conservation partnership.',
    },
    {
      title: 'Data Storage',
      icon: <Database className="text-forest" />,
      content: 'Your photos and data are stored securely on Supabase servers. We do not sell your personal information to third parties.',
    },
    {
      title: 'Your Rights',
      icon: <ShieldCheck className="text-forest" />,
      content: 'You have the right to request the deletion of your SafariWrap and associated photos at any time. Simply contact us via the support email.',
    },
  ];

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <header className="gradient-forest p-8 rounded-b-[40px] text-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
          <p className="text-forest-light font-bold">Safeguarding your safari memories.</p>
        </div>
        <SafariButton variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </SafariButton>
      </header>

      <main className="flex-1 max-w-2xl mx-auto p-6 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-[32px] p-8 border border-dust shadow-sm space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-forest/5 rounded-2xl flex items-center justify-center">
                {section.icon}
              </div>
              <h2 className="text-xl font-extrabold text-forest">{section.title}</h2>
            </div>
            <p className="text-ink-light font-medium leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}

        <div className="bg-forest text-white rounded-[40px] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldCheck size={120} />
          </div>
          <h2 className="text-2xl font-extrabold mb-4 relative z-10">Need Help?</h2>
          <p className="font-bold opacity-80 mb-6 relative z-10">
            If you have any questions about how your data is handled, feel free to reach out to our privacy team.
          </p>
          <SafariButton variant="secondary" leftIcon={<Mail size={18} />} className="w-full h-14 relative z-10">
            privacy@safariwrap.com
          </SafariButton>
        </div>
      </main>

      <PoweredByFooter />
    </div>
  );
}
