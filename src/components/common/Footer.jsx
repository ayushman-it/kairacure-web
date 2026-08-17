import React from 'react';

const BRAND_NAME = 'Kairacure';

export function Footer({ setPage }) {
  const treatmentLinks = [
    ['Cardiac Surgery', 'Improve heart health with bypass, valve repair, and stent procedures.'],
    ['Hair Transplant', 'Restore natural hairline with FUE and DHI techniques.'],
    ['Dental Treatment', 'Full-mouth restoration, implants, veneers, and cosmetic care.'],
    ['Fertility Treatment', 'IVF, IUI, and reproductive care with specialist support.'],
    ['Orthopaedics', 'Knee, hip, and spine procedures with expert surgeons.'],
    ['ENT', 'Ear, nose, and throat surgeries with full recovery support.'],
    ['Cancer Treatment', 'Oncology care with precision surgery, chemo, and immunotherapy.'],
    ['IVF Treatment', "Advanced fertility treatment from India's top clinics."],
    ['Gynaecology', "Women's health, laparoscopy, and minimally invasive surgery."],
  ];

  return (
    <footer className="kc-footer">
      <div className="kc-footer-top">
        <div className="kc-footer-tabs">
          {['Treatments', 'Partners', 'Doctors', 'Destinations'].map((tab) => (
            <button
              key={tab}
              className="kc-footer-tab"
              type="button"
              onClick={() => setPage && setPage(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="kc-footer-treatments">
          {treatmentLinks.map(([name, desc]) => (
            <div key={name} className="kc-footer-treatment-item">
              <strong>{name}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <button className="kc-footer-view-more" type="button" onClick={() => setPage && setPage('treatments')}>
          View more <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <div className="kc-footer-divider" />

      <div className="kc-footer-bottom-grid">
        <div className="kc-footer-col">
          <h4>About {BRAND_NAME}</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('home'); }}>About Us</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('partners'); }}>Become a Partner</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('ai-assistant'); }}>{BRAND_NAME} AI</a>
        </div>
        <div className="kc-footer-col">
          <h4>Support</h4>
          <a href="mailto:care@kairacure.com">Contact Us</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('home'); }}>FAQs</a>
        </div>
        <div className="kc-footer-col">
          <h4>Legal &amp; Policies</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms &amp; Conditions</a>
        </div>
        <div className="kc-footer-col">
          <h4>Accreditations &amp; Quality</h4>
          <span className="kc-footer-community-text">NABH · JCI · ISO Certified Hospitals</span>
        </div>
      </div>

      <div className="kc-footer-copyright">
        <span>© 2026 {BRAND_NAME} · Patient-first medical travel · care@kairacure.com</span>
        <span>NABH · JCI · ISO · 24/7 Support</span>
      </div>
    </footer>
  );
}
