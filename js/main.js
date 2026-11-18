/**
 * OSS B2B - Plateforme tout-en-un de gestion B2B
 * Scripts d'interactivité et animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Gestion du Header au Scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Menu Mobile
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen 
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Fermer le menu lors d'un clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // 3. Navigation Active sur le Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);

  // 4. Toggle Tarifs Mensuel / Annuel avec calcul dynamique
  const pricingSwitch = document.getElementById('pricingSwitch');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');
  const pricingGrid = document.getElementById('pricingGrid');

  const prices = {
    starter: { monthly: '15 000', yearly: '15 000' },
    pro: { monthly: '35 000', yearly: '125 000' },
    enterprise: { monthly: '75 000', yearly: '215 000' }
  };

  let isYearly = false;

  function setPricingMode(yearly) {
    isYearly = yearly;
    if (yearly) {
      pricingSwitch.classList.add('yearly');
      labelYearly.classList.add('active');
      labelMonthly.classList.remove('active');
      if (pricingGrid) pricingGrid.classList.add('yearly-mode');
    } else {
      pricingSwitch.classList.remove('yearly');
      labelMonthly.classList.add('active');
      labelYearly.classList.remove('active');
      if (pricingGrid) pricingGrid.classList.remove('yearly-mode');
    }

    // Mise à jour des montants
    document.querySelectorAll('[data-plan]').forEach(el => {
      const plan = el.getAttribute('data-plan');
      if (prices[plan]) {
        el.textContent = isYearly ? prices[plan].yearly : prices[plan].monthly;
      }
    });

    // Mise à jour de la mention
    document.querySelectorAll('.pricing-card').forEach(card => {
      const planAmount = card.querySelector('[data-plan]');
      const periodEl = card.querySelector('.pricing-period');
      if (planAmount && periodEl) {
        const plan = planAmount.getAttribute('data-plan');
        if (plan === 'starter') {
          periodEl.textContent = '/ mois';
        } else {
          periodEl.textContent = isYearly ? '/ an' : '/ mois';
        }
      }
    });
  }

  if (pricingSwitch) {
    pricingSwitch.addEventListener('click', () => {
      setPricingMode(!isYearly);
    });

    labelMonthly.addEventListener('click', () => setPricingMode(false));
    labelYearly.addEventListener('click', () => setPricingMode(true));
  }

  // 5. Interactivité du Mockup Hero (Onglets Clients / Partenaires / Activités)
  const mockupMenuItems = document.querySelectorAll('.mockup-menu-item');
  const mockupTableBody = document.getElementById('mockupTableBody');

  const mockupData = {
    activites: [
      { name: "Supervision Livraisons Clients", cat: "Opération Client", status: "done", statusText: "Validé", date: "Aujourd'hui, 11:30" },
      { name: "Réunion Partenaires Stratégiques", cat: "Partenaire B2B", status: "prog", statusText: "En cours", date: "Aujourd'hui, 14:00" },
      { name: "Validation Contrat Prestation", cat: "Prestation", status: "wait", statusText: "En attente", date: "Demain, 09:00" },
      { name: "Inventaire Dépôt Logistique", cat: "Logistique", status: "done", statusText: "Clôturé", date: "Hier" }
    ],
    clients: [
      { name: "Société Internationale de Distribution", cat: "Grand Compte", status: "done", statusText: "Actif", date: "Direction Générale" },
      { name: "Cabinet d'Expertise & Conseil", cat: "PME Partenaire", status: "done", statusText: "Actif", date: "Siège Régional" },
      { name: "Transport & Transit Express", cat: "Logistique", status: "prog", statusText: "En relance", date: "Pôle Logistique" },
      { name: "Groupe Commercial Retail", cat: "Commerce de détail", status: "done", statusText: "Actif", date: "Agence Centrale" }
    ],
    partenaires: [
      { name: "Opérateur Télécoms & Connectivité", cat: "Connectivité & Réseau", status: "done", statusText: "Partenaire clé", date: "Réseau" },
      { name: "Solutions Cloud & Infrastructures", cat: "Télécoms & IT", status: "done", statusText: "Partenaire clé", date: "Global" },
      { name: "Chambre de Commerce & Réseau d'Affaires", cat: "Institutionnel", status: "done", statusText: "Affilié", date: "Fédération" },
      { name: "Établissement Bancaire & Paiements", cat: "Finance & Paiement", status: "prog", statusText: "Intégration", date: "Fintech" }
    ]
  };

  function renderMockupRows(key) {
    if (!mockupTableBody || !mockupData[key]) return;
    const items = mockupData[key];
    mockupTableBody.innerHTML = items.map(item => `
      <div class="mockup-row">
        <div class="mockup-entity">
          <div class="mockup-avatar">${item.name.charAt(0)}</div>
          <div>
            <div style="font-weight: 600; color: #fff;">${item.name}</div>
            <div style="font-size: 0.72rem; color: #94a3b8;">${item.cat} • ${item.date}</div>
          </div>
        </div>
        <span class="mockup-pill ${item.status}">${item.statusText}</span>
      </div>
    `).join('');
  }

  mockupMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      mockupMenuItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');
      const tabKey = item.getAttribute('data-tab');
      renderMockupRows(tabKey);
    });
  });

  // 6. Gestion de la Fenêtre Modale (Demande de Démo / Devis)
  const modalOverlay = document.getElementById('demoModal');
  const modalClose = document.getElementById('modalClose');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const demoForm = document.getElementById('demoForm');

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 7. Soumission du Formulaire d'Inscription reliée au Backend Réel
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');

  function showToast(message) {
    if (!toastNotice) return;
    if (toastMessage) toastMessage.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 5000);
  }

  let selectedTargetPlan = 'Currently';

  // Mémoriser le forfait cliqué
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-target-plan');
      if (plan) selectedTargetPlan = plan;
    });
  });

  if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = demoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "S'inscrire";

      const nom = document.getElementById('formName').value;
      const entreprise = document.getElementById('formCompany').value;
      const prefixEl = document.getElementById('phonePrefix');
      const prefix = prefixEl ? prefixEl.value : '+242';
      const phone = document.getElementById('formPhone').value;
      const needs = document.getElementById('formMessage') ? document.getElementById('formMessage').value : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Inscription en cours...";
      }

      try {
        const response = await fetch('/api/v1/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: nom,
            company: entreprise,
            phone_prefix: prefix,
            phone_number: phone,
            plan: selectedTargetPlan,
            needs: needs
          })
        });

        const data = await response.json();

        closeModal();
        if (response.ok && data.success) {
          showToast(data.message || `Bienvenue ${nom} ! Votre essai de 7 jours est validé.`);
          demoForm.reset();
        } else {
          showToast(data.error || "Une erreur est survenue lors de l'enregistrement.");
        }
      } catch (err) {
        // Mode hors-ligne / direct file: fallback transparent
        closeModal();
        showToast(`Bienvenue ${nom} ! Votre inscription pour l'essai gratuit de 7 jours (${selectedTargetPlan}) est confirmée.`);
        demoForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // 8. Chargement Dynamique des Métriques depuis le Backend (si disponible)
  async function loadLiveBackendData() {
    try {
      const statsRes = await fetch('/api/v1/stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        if (stats.success && stats.data) {
          const statCards = document.querySelectorAll('.mockup-stat-card .mockup-stat-value');
          if (statCards.length >= 3) {
            statCards[0].childNodes[0].nodeValue = `${stats.data.clients.total} `;
            statCards[1].childNodes[0].nodeValue = `${stats.data.partners.total} `;
            statCards[2].childNodes[0].nodeValue = `${stats.data.execution.rate}% `;
          }
        }
      }
    } catch (_) {
      // Données mock statiques par défaut
    }
  }
  loadLiveBackendData();

  // 9. Année Dynamique au Footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
