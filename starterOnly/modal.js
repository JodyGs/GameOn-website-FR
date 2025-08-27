function editNav() {
  const navElement = document.getElementById("myTopnav");
  if (!navElement) return;
  navElement.classList.toggle("responsive");
}

// Configuration globale
const config = {
  emailRegex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08]\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08]\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i,
  minLength: 2,
  fieldNames: ["first", "last", "email", "quantity", "birthdate"]
};

// Fonction principale qui gère tous les cas
function handleModal(action, data = {}) {
  // Cache des éléments DOM
  const elements = {
    modalbg: document.querySelector(".bground"),
    modalBtn: document.querySelectorAll(".modal-btn"),
    closeBtn: document.querySelector(".close"),
    form: document.forms["reserve"],
    modalBody: document.querySelector(".modal-body")
  };

  // Actions disponibles
  switch (action) {
    case 'init':
      return initializeModal(elements);
    
    case 'open':
      return openModal(elements);
    
    case 'close':
      return closeModal(elements);
    
    case 'validate':
      return validateForm(elements);
    
    case 'submit':
      return submitForm(elements, data);
    
    case 'showConfirmation':
      return showConfirmation(elements);
    
    case 'reset':
      return resetForm(elements);
    
    case 'setError':
      return setError(data.element, data.message);
    
    case 'clearError':
      return clearError(data.element);
    
    case 'clearAllErrors':
      return clearAllErrors(elements);
    
    default:
      console.warn(`Action '${action}' non reconnue`);
      return false;
  }
}

// Fonctions internes
function initializeModal(elements) {
  if (!elements.form) return false;
  
  elements.form.setAttribute("novalidate", "novalidate");
  
  // Event listeners pour ouvrir la modale
  elements.modalBtn.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => handleModal('open'));
    }
  });
  
  // Event listener pour fermer la modale
  if (elements.closeBtn) {
    elements.closeBtn.addEventListener("click", () => handleModal('close'));
  }
  
  // Fermeture au clic sur le fond
  window.addEventListener("click", (e) => {
    if (e.target === elements.modalbg) {
      handleModal('close');
    }
  });
  
  // Fermeture avec Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && elements.modalbg && elements.modalbg.style.display === "block") {
      handleModal('reset');
    }
  });
  
  // Event listener pour la soumission
  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleModal('submit', { event: e });
  });
  
  // Event listeners pour l'effacement dynamique des erreurs
  setupDynamicErrorClearing(elements);
  
  return true;
}

function openModal(elements) {
  if (elements.modalbg) {
    elements.modalbg.style.display = "block";
    return true;
  }
  return false;
}

function closeModal(elements) {
  if (elements.modalbg) {
    elements.modalbg.style.display = "none";
    return true;
  }
  return false;
}

function validateForm(elements) {
  if (!elements.form) return false;
  
  const fields = getFormFields(elements.form);
  const radioGroupWrap = fields.radios[0]?.closest(".formData") || null;
  
  // Nettoyer toutes les erreurs d'abord
  handleModal('clearAllErrors');
  
  const validations = [
    validate('text', fields.first, { errorMessage: "Veuillez saisir au moins 2 caractères." }),
    validate('text', fields.last, { errorMessage: "Veuillez saisir au moins 2 caractères." }),
    validate('email', fields.email),
    validate('required', fields.birthdate, { errorMessage: "Veuillez saisir votre date de naissance." }),
    validate('numeric', fields.quantity),
    validate('radio', null, { form: elements.form, radioGroupWrap, errorMessage: "Veuillez choisir un tournoi." }),
    validate('checkbox', fields.cgu)
  ];
  
  return validations.every(result => result);
}

function submitForm(elements, data) {
  if (handleModal('validate')) {
    handleModal('showConfirmation');
    return true;
  }
  return false;
}

function showConfirmation(elements) {
  if (!elements.modalBody || !elements.form) return false;
  
  let confirmationBox = elements.modalBody.querySelector(".confirmation-message");
  
  if (!confirmationBox) {
    confirmationBox = document.createElement("div");
    confirmationBox.className = "confirmation-message";
    Object.assign(confirmationBox.style, {
      display: "none",
      textAlign: "center",
      padding: "20px"
    });
    
    confirmationBox.innerHTML = `
      <h2>Merci ! Votre réservation a été reçue.</h2>
      <p>Nous vous contacterons bientôt avec plus de détails.</p>
      <div style="margin-top:20px;">
        <button id="confirm-close" class="btn-submit">Fermer</button>
      </div>
    `;
    
    elements.modalBody.appendChild(confirmationBox);
    
    // Event listener pour le bouton de fermeture
    const btnClose = confirmationBox.querySelector("#confirm-close");
    if (btnClose) {
      btnClose.addEventListener("click", (ev) => {
        ev.preventDefault();
        handleModal('reset');
      });
    }
  }
  
  elements.form.style.display = "none";
  confirmationBox.style.display = "block";
  
  return true;
}

function resetForm(elements) {
  // Fermer la modale
  handleModal('close');
  
  // Réinitialiser le formulaire
  if (elements.form) {
    elements.form.reset();
    elements.form.style.display = "block";
  }
  
  // Nettoyer les erreurs
  handleModal('clearAllErrors');
  
  // Cacher la confirmation
  const confirmationBox = elements.modalBody?.querySelector(".confirmation-message");
  if (confirmationBox) {
    confirmationBox.style.display = "none";
  }
  
  return true;
}

function setError(el, message) {
  if (!el) return false;
  const wrap = el.closest(".formData") || el;
  wrap.setAttribute("data-error", message);
  wrap.setAttribute("data-error-visible", "true");
  if (el instanceof HTMLElement) el.setAttribute("aria-invalid", "true");
  return true;
}

function clearError(el) {
  if (!el) return false;
  const wrap = el.closest(".formData") || el;
  wrap.removeAttribute("data-error");
  wrap.removeAttribute("data-error-visible");
  if (el instanceof HTMLElement) el.removeAttribute("aria-invalid");
  return true;
}

function clearAllErrors(elements) {
  if (!elements.form) return false;
  
  const fields = config.fieldNames
    .map(name => elements.form[name])
    .filter(Boolean);
  
  fields.forEach(field => clearError(field));
  
  const radios = elements.form.querySelectorAll('input[name="location"]');
  const radioGroupWrap = radios[0]?.closest(".formData");
  if (radioGroupWrap) {
    radioGroupWrap.removeAttribute("data-error");
    radioGroupWrap.removeAttribute("data-error-visible");
  }
  
  const cgu = document.getElementById("checkbox1");
  if (cgu) clearError(cgu);
  
  return true;
}

// Fonction de validation universelle
function validate(type, field, options = {}) {
  const {
    minLength = config.minLength,
    errorMessage = '',
    form = null,
    radioGroupWrap = null
  } = options;

  switch (type) {
    case 'text':
      if (!field?.value || field.value.trim().length < minLength) {
        setError(field, errorMessage || `Veuillez saisir au moins ${minLength} caractères.`);
        return false;
      }
      return true;

    case 'email':
      if (!field?.value || !config.emailRegex.test(field.value.trim())) {
        setError(field, errorMessage || "Veuillez saisir une adresse e-mail valide.");
        return false;
      }
      return true;

    case 'required':
      if (!field?.value) {
        setError(field, errorMessage || "Ce champ est requis.");
        return false;
      }
      return true;

    case 'numeric':
      const value = field?.value?.trim() ?? "";
      if (value === "" || isNaN(Number(value))) {
        setError(field, errorMessage || "Veuillez saisir un nombre.");
        return false;
      }
      return true;

    case 'radio':
      const selectedRadio = form?.querySelector('input[name="location"]:checked');
      if (!selectedRadio) {
        if (radioGroupWrap) {
          radioGroupWrap.setAttribute("data-error", errorMessage || "Veuillez faire un choix.");
          radioGroupWrap.setAttribute("data-error-visible", "true");
        }
        return false;
      }
      return true;

    case 'checkbox':
      if (!field?.checked) {
        setError(field, errorMessage || "Vous devez accepter les conditions.");
        return false;
      }
      return true;

    default:
      console.warn(`Type de validation '${type}' non reconnu`);
      return false;
  }
}

// Fonction helper pour obtenir les champs du formulaire
function getFormFields(form) {
  return {
    first: form.first,
    last: form.last,
    email: form.email,
    quantity: form.quantity,
    birthdate: form.birthdate,
    radios: form.querySelectorAll('input[name="location"]'),
    cgu: document.getElementById("checkbox1")
  };
}

function setupDynamicErrorClearing(elements) {
  if (!elements.form) return;
  
  // Event listeners pour les champs de texte
  config.fieldNames.forEach(name => {
    const element = elements.form[name];
    if (element) {
      element.addEventListener("input", () => clearError(element));
    }
  });
  
  // Event listeners pour les boutons radio
  const radios = elements.form.querySelectorAll('input[name="location"]');
  const radioGroupWrap = radios[0]?.closest(".formData");
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radioGroupWrap) {
        radioGroupWrap.removeAttribute("data-error");
        radioGroupWrap.removeAttribute("data-error-visible");
      }
    });
  });
  
  // Event listener pour la checkbox
  const cguBox = document.getElementById("checkbox1");
  if (cguBox) {
    cguBox.addEventListener("change", (e) => clearError(e.target));
  }
}

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  handleModal('init');
});

// Si le DOM est déjà chargé
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => handleModal('init'));
} else {
  handleModal('init');
}