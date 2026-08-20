import React, { useState } from 'react';

const BRAND_NAME = 'Kairacure';

const DESTINATIONS_DATA = [
  { name: 'Delhi / NCR', desc: '120+ Accredited Hospitals · Major International Hub' },
  { name: 'Mumbai', desc: '95+ Multi-specialty Hospitals · Top Surgeons' },
  { name: 'Bengaluru', desc: '85+ Super-specialty Centers · Advanced Robotic Surgery' },
  { name: 'Chennai', desc: '110+ JCI/NABH Hospitals · Cardiology & Organ Transplant' },
  { name: 'Hyderabad', desc: '75+ Specialized Clinics · Oncology & Orthopedics' },
  { name: 'Kolkata', desc: '60+ Multi-specialty Centers · Affordable Care' },
  { name: 'Kochi & Kerala', desc: '45+ Wellness & Holistic Medical Centers' },
  { name: 'Ahmedabad', desc: '50+ Tertiary Care Centers · Eye & Dental Excellence' },
];

const DOCTORS_DATA = [
  { name: 'Dr. Ashok Seth (Cardiology)', desc: 'Padma Bhushan · Fortis Escorts Heart Institute' },
  { name: 'Dr. Naresh Trehan (Cardiac Surgery)', desc: 'Padma Bhushan · Medanta The Medicity' },
  { name: 'Dr. S. K. S. Marya (Orthopedics)', desc: 'Max Super Speciality Hospital · 35+ Yrs Exp' },
  { name: 'Dr. Arvinder Singh Soin (Liver Transplant)', desc: 'Padma Shri · Medanta Liver Institute' },
  { name: 'Dr. Suresh Advani (Oncology Care)', desc: 'Padma Bhushan · Raheja Fortis Hospital' },
  { name: 'Dr. H. S. Chhabra (Spine Surgery)', desc: 'Indian Spinal Injuries Centre' },
];

export function Footer({ setPage, treatments = [], hospitals = [], setSelectedTreatment, setSelectedHospital }) {
  const [activeTab, setActiveTab] = useState('Treatments');

  // Dynamic Item List according to Active Tab & Backend Props
  let displayItems = [];

  if (activeTab === 'Treatments') {
    const sourceList = Array.isArray(treatments) && treatments.length > 0 ? treatments : [
      { title: 'Cardiac Surgery (CABG)', category: 'Heart Care', desc: 'Improve heart health with bypass, valve repair, and stent procedures.' },
      { title: 'Knee & Joint Replacement', category: 'Orthopedics', desc: 'Total knee and hip replacement with minimally invasive techniques.' },
      { title: 'Oncology Care & Surgery', category: 'Cancer Care', desc: 'Precision tumor removal, chemotherapy, and immunotherapy.' },
      { title: 'IVF & Infertility Treatment', category: 'Fertility Care', desc: 'Advanced reproductive care with high success rates.' },
      { title: 'Spine & Neuro Surgery', category: 'Neuro Care', desc: 'Disc replacement, brain surgery, and spinal alignment.' },
      { title: 'Gastroenterology Surgery', category: 'GI Care', desc: 'Endoscopy, liver transplant, and bariatric surgery.' },
      { title: 'ENT & Sinus Surgeries', category: 'ENT Care', desc: 'Ear, nose, and throat procedures with rapid recovery.' },
      { title: 'Dental & Cosmetic Restorations', category: 'Dental Care', desc: 'Full-mouth implants, veneers, and smile design.' },
      { title: 'Hair Transplant (FUE/DHI)', category: 'Cosmetic Care', desc: 'Restore natural hairline with advanced FUE and DHI techniques.' }
    ];

    displayItems = sourceList.slice(0, 9).map((t) => ({
      name: t.title || t.name,
      desc: t.subtitle || t.desc || `${t.category || t.group || 'Specialty Surgery'} · Starting ₹${t.costInr ? (t.costInr / 100000).toFixed(1) + 'L' : '1.5L'}`,
      rawItem: t,
      type: 'treatment'
    }));
  } else if (activeTab === 'Partners') {
    const sourceHospitals = Array.isArray(hospitals) && hospitals.length > 0 ? hospitals : [
      { name: 'Apollo Hospitals', city: 'Delhi / NCR', accreditations: ['NABH', 'JCI'] },
      { name: 'Fortis Healthcare', city: 'Mumbai', accreditations: ['NABH', 'JCI'] },
      { name: 'Max Super Speciality', city: 'Delhi / NCR', accreditations: ['NABH'] },
      { name: 'Manipal Hospitals', city: 'Bengaluru', accreditations: ['NABH', 'JCI'] },
      { name: 'Medanta The Medicity', city: 'Gurugram', accreditations: ['JCI'] },
      { name: 'Artemis Hospital', city: 'Gurugram', accreditations: ['JCI'] }
    ];

    displayItems = sourceHospitals.slice(0, 9).map((h) => ({
      name: h.name,
      desc: `${h.city || h.location || 'India'} · ${Array.isArray(h.accreditations) ? h.accreditations.join(', ') : 'NABH & JCI Accredited'}`,
      rawItem: h,
      type: 'hospital'
    }));
  } else if (activeTab === 'Doctors') {
    displayItems = DOCTORS_DATA.map((d) => ({
      name: d.name,
      desc: d.desc,
      type: 'doctor'
    }));
  } else if (activeTab === 'Destinations') {
    displayItems = DESTINATIONS_DATA.map((dst) => ({
      name: dst.name,
      desc: dst.desc,
      type: 'destination'
    }));
  }

  const handleItemClick = (itemObj) => {
    if (itemObj.type === 'treatment') {
      if (setSelectedTreatment && itemObj.rawItem) setSelectedTreatment(itemObj.rawItem);
      setPage && setPage('treatment-detail');
    } else if (itemObj.type === 'hospital') {
      if (setSelectedHospital && itemObj.rawItem) setSelectedHospital(itemObj.rawItem);
      setPage && setPage('partner-detail', itemObj.rawItem);
    } else if (itemObj.type === 'doctor') {
      setPage && setPage('planner');
    } else if (itemObj.type === 'destination') {
      setPage && setPage('partners');
    }
  };

  const handleViewMore = () => {
    if (activeTab === 'Treatments') setPage && setPage('treatments');
    else if (activeTab === 'Partners') setPage && setPage('partners');
    else if (activeTab === 'Doctors') setPage && setPage('treatments');
    else if (activeTab === 'Destinations') setPage && setPage('destinations');
  };

  return (
    <footer className="kc-footer" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      <div className="kc-footer-top">
        {/* Dynamic Footer Tabs */}
        <div className="kc-footer-tabs">
          {['Treatments', 'Partners', 'Doctors', 'Destinations'].map((tab) => (
            <button
              key={tab}
              className={`kc-footer-tab${activeTab === tab ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 800 : 600,
                color: activeTab === tab ? '#0d2f5d' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #0d2f5d' : '2px solid transparent',
                paddingBottom: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Items Grid */}
        <div className="kc-footer-treatments">
          {displayItems.map((item, idx) => (
            <div 
              key={idx} 
              className="kc-footer-treatment-item"
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <strong style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: 800 }}>{item.name}</strong>
              <span style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.45 }}>{item.desc}</span>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <button 
          className="kc-footer-view-more" 
          type="button" 
          onClick={handleViewMore}
          style={{
            cursor: 'pointer',
            fontWeight: 800,
            color: '#0d2f5d',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f0f7ff',
            border: '1px solid #bfdbfe',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginTop: '16px'
          }}
        >
          <span>View all {activeTab.toLowerCase()}</span>
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <div className="kc-footer-divider" />

      <div className="kc-footer-bottom-grid">
        <div className="kc-footer-col">
          <h4>About {BRAND_NAME}</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('home'); }}>About Us</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('partner-growth'); }}>Become a Hospital Partner</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage && setPage('ai-assistant'); }}>{BRAND_NAME} AI Concierge</a>
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
