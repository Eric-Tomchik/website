import { Metadata } from 'next';
import { CompanionFrame } from './CompanionFrame';

export const metadata: Metadata = {
  title: 'ASVAB Study Guide Online Companion — Practice Exams & Flashcards',
  description:
    'Free online companion for The Ultimate ASVAB Study Guide 2026-2027. 430+ practice questions, full exam simulator, CAT-ASVAB adaptive testing, flashcards, cheat sheets, and score tracking.',
  openGraph: {
    title: 'ASVAB Study Guide Online Companion | Eric Tomchik',
    description:
      '430+ practice questions, full exam simulator, CAT-ASVAB adaptive testing, flashcards, and score tracking for the ASVAB.',
    url: 'https://erictomchik.com/companions/asvab',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/companions/asvab',
  },
};

export default function ASVABCompanionPage() {
  return <CompanionFrame />;
}
