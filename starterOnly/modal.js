function editNav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}
//DOM Elements

const modalbg = document.querySelector(".bground");
const modalBtn = document.querySelectorAll(".modal-btn");
const closeBtn = document.querySelector(".close");

// launch modal event
modalBtn.forEach((btn) =>
  btn.addEventListener("click", launchModal)
);

// launch modal form
function launchModal() {
  modalbg.style.display = "block";
}


/**
 * Modale
 */

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modalbg.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalbg) {
    modalbg.style.display = "none";
  }
});

/**
 * Validation du formulaire
 */
const form = document.forms["reserve"];

if (form) {
  form.setAttribute("novalidate", "novalidate");

  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08]\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08]\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;

  function setError(el, message) {
    const wrap = el.closest(".formData") || el;
    wrap.setAttribute("data-error", message);
    wrap.setAttribute("data-error-visible", "true");
    if (el instanceof HTMLElement) el.setAttribute("aria-invalid", "true");
  }

  function clearError(el) {
    const wrap = el.closest(".formData") || el;
    wrap.removeAttribute("data-error");
    wrap.removeAttribute("data-error-visible");
    if (el instanceof HTMLElement) el.removeAttribute("aria-invalid");
  }

  function validate() {
    let isValid = true;

    const first = form.first;
    const last = form.last;
    const email = form.email;
    const quantity = form.quantity;
    const birthdate = form.birthdate; 
    const radios = form.querySelectorAll('input[name="location"]');
    const radioGroupWrap = radios[0]?.closest(".formData") || null;
    const cgu = document.getElementById("checkbox1");

    // reset 
    [first, last, email, quantity, birthdate].forEach((el) => el && clearError(el));
    if (radioGroupWrap) {
      radioGroupWrap.removeAttribute("data-error");
      radioGroupWrap.removeAttribute("data-error-visible");
    }
    if (cgu) clearError(cgu);

  
    /**
     * function checkInput(input)
    */

    // Prénom >= 2
    if (!first?.value || first.value.trim().length < 2) {
      setError(first, "Veuillez saisir au moins 2 caractères.");
      isValid = false;
    }

    // Nom >= 2
    if (!last?.value || last.value.trim().length < 2) {
      setError(last, "Veuillez saisir au moins 2 caractères.");
      isValid = false;
    }

    // Email conforme
    if (!email?.value || !emailRegex.test(email.value.trim())) {
      setError(email, "Veuillez saisir une adresse e-mail valide.");
      isValid = false;
    }

    // Date de naissance requise
    if (!birthdate?.value) {
      setError(birthdate, "Veuillez saisir votre date de naissance.");
      isValid = false;
    }

    // Nombre de tournois : numérique
    const qtyStr = quantity?.value?.trim() ?? "";
    if (qtyStr === "" || isNaN(Number(qtyStr))) {
      setError(quantity, "Veuillez saisir un nombre.");
      isValid = false;
    }

    // Radio sélectionné
    const selectedRadio = form.querySelector('input[name="location"]:checked');
    if (!selectedRadio) {
      if (radioGroupWrap) {
        radioGroupWrap.setAttribute("data-error", "Veuillez choisir un tournoi.");
        radioGroupWrap.setAttribute("data-error-visible", "true");
      }
      isValid = false;
    }

    // CGU cochée
    if (!cgu?.checked) {
      setError(cgu, "Vous devez accepter les conditions.");
      isValid = false;
    }

    return isValid;
  }

  /** 
   * Confirmation
   */
  const modalBody = document.querySelector(".modal-body");
  let confirmationBox = document.querySelector(".confirmation-message");

  if (!confirmationBox && modalBody) {
    confirmationBox = document.createElement("div");
    confirmationBox.className = "confirmation-message";
    confirmationBox.style.display = "none";
    confirmationBox.style.textAlign = "center";
    confirmationBox.style.padding = "20px";
    confirmationBox.innerHTML = `
      <h2>Merci ! Votre réservation a été reçue.</h2>
      <p>Nous vous contacterons bientôt avec plus de détails.</p>
      <div style="margin-top:20px;">
        <button id="confirm-close" class="btn-submit" >Fermer</button>
      </div>
    `;
    modalBody.appendChild(confirmationBox);
  }

  function closeModalAndReset() {
    modalbg.style.display = "none";
    form.reset();

    const fields = ["first", "last", "email", "quantity", "birthdate"]
      .map((n) => form[n])
      .filter(Boolean);
    fields.forEach(clearError);

    const radios = form.querySelectorAll('input[name="location"]');
    const radioGroupWrap = radios[0]?.closest(".formData");
    if (radioGroupWrap) {
      radioGroupWrap.removeAttribute("data-error");
      radioGroupWrap.removeAttribute("data-error-visible");
    }
    const cgu = document.getElementById("checkbox1");
    if (cgu) clearError(cgu);

    form.style.display = "block";
    if (confirmationBox) confirmationBox.style.display = "none";
  }

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalbg.style.display === "block") {
    closeModalAndReset();
  }
});

  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validate();

    if (!ok) return;

    // Confirmation
    form.style.display = "none";
    if (confirmationBox) {
      confirmationBox.style.display = "block";

      const btnClose = confirmationBox.querySelector("#confirm-close");

      if (btnClose && !btnClose._bound) {
        btnClose.addEventListener("click", (ev) => {
          ev.preventDefault();
          closeModalAndReset();
        });
        btnClose._bound = true;
      }
    }
  });

  /**
   * Effacement dynamique des erreurs
   */
  ["first", "last", "email", "quantity", "birthdate"].forEach((name) => {
    const el = form[name];
    if (el) el.addEventListener("input", () => clearError(el));
  });

  const radiosDyn = form.querySelectorAll('input[name="location"]');
  const radioGroupWrapDyn = radiosDyn[0]?.closest(".formData");
  radiosDyn.forEach((r) =>
    r.addEventListener("change", () => {
      if (radioGroupWrapDyn) {
        radioGroupWrapDyn.removeAttribute("data-error");
        radioGroupWrapDyn.removeAttribute("data-error-visible");
      }
    })
  );

  const cguBox = document.getElementById("checkbox1");
  if (cguBox) {
    cguBox.addEventListener("change", (e) => clearError(e.target));
  }
}