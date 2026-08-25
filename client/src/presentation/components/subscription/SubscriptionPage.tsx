import React from 'react';
import { motion } from 'framer-motion';

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Ücretsiz',
      price: '0 ₺',
      period: '/ ay',
      description: 'Tıp fakültesine yeni başlayanlar için temel özellikler.',
      features: [
        'Ayda 5 Vaka Çözümü',
        'Temel Branşlara Erişim',
        'Topluluk Liderlik Tablosu'
      ],
      buttonText: 'Mevcut Planınız',
      isPrimary: false
    },
    {
      name: 'Pro Öğrenci',
      price: '99 ₺',
      period: '/ ay',
      description: 'Sınavlarına ve komitelere hazırlanan tıp öğrencileri için ideal.',
      features: [
        'Sınırsız Vaka Çözümü',
        'Tüm Dönem ve Branşlara Erişim',
        'Öncelikli Yapay Zeka Hızı',
        'Detaylı Gelişim Analitiği'
      ],
      buttonText: 'Premium\'a Geç',
      isPrimary: true
    }
  ];

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="subscription-title"
        >
          Kariyerinize <span className="highlight">Seviye Atlatın</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="subscription-subtitle"
        >
          Sınırları kaldırın, sınırsız simülasyonla daha iyi bir hekim olun.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: '#10b981',
            fontWeight: 500,
            display: 'inline-block'
          }}
        >
          🎉 Şimdilik abonelik sistemimiz bulunmamaktadır. Tüm özellikler tamamen ücretsiz yayındadır!
        </motion.div>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`pricing-card ${plan.isPrimary ? 'primary' : ''}`}
          >
            {plan.isPrimary && <div className="popular-badge">En Çok Tercih Edilen</div>}
            
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="price-amount">{plan.price}</span>
              <span className="price-period">{plan.period}</span>
            </div>
            <p className="plan-desc">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map(feature => (
                <li key={feature}>
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`plan-btn ${plan.isPrimary ? 'btn-primary-large' : 'btn-secondary-large'}`}>
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
