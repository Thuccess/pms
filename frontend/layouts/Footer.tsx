import React from 'react';

export const Footer = () => {
  return (
    <footer className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 xl:px-12 border-t border-border bg-card/70 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img
              src="/logo.png"
              alt="Luxorld Real Estate"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <span className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-[0.18em]">
              Luxorld Real Estate
            </span>
          </div>
          <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-[0.28em]">
            Elite Property Management System v1.0.4
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          <a href="#" className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-all">
            Privacy Protocol
          </a>
          <a href="#" className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-all">
            Service Terms
          </a>
          <a href="#" className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-all">
            Elite Support
          </a>
        </div>

        <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">
          © 2024 LUXORLD REAL ESTATE
        </p>
      </div>
    </footer>
  );
};
