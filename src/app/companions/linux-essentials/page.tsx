import { Metadata } from 'next';
import { CompanionFrame } from './CompanionFrame';

export const metadata: Metadata = {
  title: 'Linux Essentials Online Companion — Interactive Labs & Terminal',
  description:
    'Interactive online companion for the Linux Essentials Complete Study Guide 2026 (Exam 010-160). Practice Linux commands in a browser-based terminal, take quizzes, review flash cards, and complete hands-on labs.',
  openGraph: {
    title: 'Linux Essentials Online Companion | Eric Tomchik',
    description:
      'Browser-based Linux terminal, quizzes, flash cards, and hands-on labs for the Linux Essentials certification exam.',
    url: 'https://erictomchik.com/companions/linux-essentials',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/companions/linux-essentials',
  },
};

export default function LinuxEssentialsPage() {
  return <CompanionFrame />;
}
