const tabList = document.querySelector('.tour-tabs');
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  function select(index, focus = false) {
    tabs.forEach((tab, position) => {
      const active = index === position;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      const changed = panel.hidden !== !active;
      panel.hidden = !active;
      panel.classList.toggle('revealed', active && changed);
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    document.getElementById(tab.getAttribute('aria-controls')).setAttribute('role', 'tabpanel');
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!Object.hasOwn(keys, event.key)) return;
      event.preventDefault();
      select(keys[event.key], true);
    });
  });
  tabList.hidden = false;
}

for (const button of document.querySelectorAll('[data-copy]')) {
  if (!navigator.clipboard?.writeText) continue;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const feedback = button.parentElement.querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      feedback.textContent = 'Copied';
    } catch {
      feedback.textContent = 'Select the example text to copy it.';
    }
  });
}
