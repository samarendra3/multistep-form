const plans = {
  arcade:   { name: 'Arcade',   monthly: 9,  yearly: 90 },
  advanced: { name: 'Advanced', monthly: 12, yearly: 120 },
  pro:      { name: 'Pro',      monthly: 15, yearly: 150 },
};
const addons = {
  online:  { name: 'Online service',       monthly: 1, yearly: 10 },
  storage: { name: 'Larger storage',       monthly: 2, yearly: 20 },
  profile: { name: 'Customizable profile', monthly: 2, yearly: 20 },
};
const state = { step: 1, plan: null, yearly: false, addons: new Set() };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const nextBtn = $('#next-button');
const backBtn = $('#back-button');
const container = $('.container');
const unit = () => (state.yearly ? 'yr' : 'mo');
const price = (item) => (state.yearly ? item.yearly : item.monthly);

function showStep(n) {
  state.step = n;
  $$('.step-content').forEach((el) => { el.hidden = Number(el.dataset.content) !== n; });
  $$('.step').forEach((el) => { el.classList.toggle('active', Number(el.dataset.step) === Math.min(n, 4)); });
  backBtn.classList.toggle('invisible', n === 1);
  nextBtn.textContent = n === 4 ? 'Confirm' : 'Next Step';
  nextBtn.classList.toggle('confirm', n === 4);
  $('.nav').classList.toggle('hidden-nav', n === 5);
  if (n === 4) renderSummary();
}

function validateField(input) {
  const error = input.closest('.field').querySelector('.error-msg');
  if (input.name === 'phone') {
    const ok = !input.value || /^\+?[\d\s()-]{7,20}$/.test(input.value.trim());
    input.setCustomValidity(ok ? '' : 'Enter a valid phone number');
  }
  let msg = '';
  if (input.validity.valueMissing) msg = 'This field is required';
  else if (!input.validity.valid) msg = input.name === 'email' ? 'Enter a valid email' : 'Enter a valid phone number';
  error.textContent = msg;
  input.classList.toggle('invalid', Boolean(msg));
  return !msg;
}

const infoInputs = $$('#info-form input');
infoInputs.forEach((input) => {
  input.addEventListener('input', () => { if (input.classList.contains('invalid')) validateField(input); });
});
$('#info-form').addEventListener('submit', (e) => e.preventDefault());

function renderPrices() {
  $$('.plan_card').forEach((card) => {
    card.querySelector('.price').textContent = `$${price(plans[card.dataset.plan])}/${unit()}`;
  });
  $$('.addon_card').forEach((card) => {
    card.querySelector('.addon-price').textContent = `+$${price(addons[card.dataset.addon])}/${unit()}`;
  });
  container.classList.toggle('yearly-mode', state.yearly);
  $('.bill-label.monthly').classList.toggle('active', !state.yearly);
  $('.bill-label.yearly').classList.toggle('active', state.yearly);
}

function selectPlan(card) {
  $$('.plan_card').forEach((c) => c.classList.remove('selected'));
  card.classList.add('selected');
  state.plan = card.dataset.plan;
  $('.plan-error').textContent = '';
}
$$('.plan_card').forEach((card) => {
  card.addEventListener('click', () => selectPlan(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPlan(card); }
  });
});
$('#billing-toggle').addEventListener('click', () => { state.yearly = !state.yearly; renderPrices(); });

$$('.addon_card input').forEach((box) => {
  box.addEventListener('change', () => {
    box.closest('.addon_card').classList.toggle('selected', box.checked);
    if (box.checked) state.addons.add(box.value); else state.addons.delete(box.value);
  });
});

function renderSummary() {
  const plan = plans[state.plan];
  $('#sum-plan-name').textContent = `${plan.name} (${state.yearly ? 'Yearly' : 'Monthly'})`;
  $('#sum-plan-price').textContent = `$${price(plan)}/${unit()}`;
  let total = price(plan);
  const list = $('#sum-addons');
  list.innerHTML = '';
  state.addons.forEach((key) => {
    const addon = addons[key];
    total += price(addon);
    const row = document.createElement('div');
    row.className = 'sum-addon';
    row.innerHTML = `<span>${addon.name}</span><span>+$${price(addon)}/${unit()}</span>`;
    list.appendChild(row);
  });
  $('#total-label').textContent = `Total (per ${state.yearly ? 'year' : 'month'})`;
  $('#total-price').textContent = `+$${total}/${unit()}`;
}
$('#change-plan').addEventListener('click', (e) => { e.preventDefault(); showStep(2); });

nextBtn.addEventListener('click', () => {
  if (state.step === 1) {
    let allValid = true;
    infoInputs.forEach((input) => { if (!validateField(input)) allValid = false; });
    if (allValid) showStep(2);
  } else if (state.step === 2) {
    if (!state.plan) { $('.plan-error').textContent = 'Please select a plan'; return; }
    showStep(3);
  } else if (state.step === 3) {
    showStep(4);
  } else if (state.step === 4) {
    showStep(5);
  }
});
backBtn.addEventListener('click', () => { if (state.step > 1 && state.step < 5) showStep(state.step - 1); });

renderPrices();
showStep(1);
