
'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/i18n';

export const Footer = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
    <footer className="bg-slate-800 text-slate-300 pt-12 pb-4">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                    <h4 className="font-headline text-xl text-white mb-3">Apna Kaushal</h4>
                    <p className="text-sm">
                        {t.footerDescription}
                    </p>
                </div>
                <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.links}</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-primary transition-colors">{t.home}</Link></li>
                        <li><Link href="/about" className="hover:text-primary transition-colors">{t.aboutUs}</Link></li>
                         <li><Link href="/blog" className="hover:text-primary transition-colors">{t.blog}</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">{t.contact}</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.legal}</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/policy" className="hover:text-primary transition-colors">{t.privacyPolicy}</Link></li>
                        <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                        <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                    </ul>
                </div>
                 <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.contactUs}</h5>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><MapPin size={16}/> New Delhi, India</li>
                        <li className="flex items-center gap-2"><Phone size={16}/> +91 6376304014</li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-slate-700 pt-4 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Apna Kaushal. {t.allRightsReserved}</p>
            </div>
        </div>
    </footer>
)}
