import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from '../dashboard/components/AppAppBar';
import Hero from '../dashboard/components/Hero';
import LogoCollection from '../dashboard/components/LogoCollection';
import Highlights from '../dashboard/components/Highlights';
import Pricing from '../dashboard/components/Pricing';
import Features from '../dashboard/components/Features';
import Testimonials from '../dashboard/components/Testimonials';
import FAQ from '../dashboard/components/FAQ';
import Footer from '../dashboard/components/Footer';

export default function MarketingPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Hero />
      <div>
        <LogoCollection />
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <Highlights />
        <Divider />
        <Pricing />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
