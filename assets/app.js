(() => {
  'use strict';

  // ---- Theme toggle (remembers choice when storage is available) ----
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = () => root.dataset.theme || (prefersDark() ? 'dark' : 'light');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme still applies this visit */ }
    });
  }

  // ---- Research severity filter ----
  const chips = document.querySelectorAll('[data-filter]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    document.querySelectorAll('.vuln').forEach((v) => { v.hidden = f !== 'all' && v.dataset.sev !== f; });
  }));

  // ---- CLI console ----
  const cli = document.getElementById('cli');
  const out = document.getElementById('cli-out');
  const form = document.getElementById('cli-form');
  const input = document.getElementById('cli-input');
  if (!cli || !out || !form || !input) return;

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${esc(text || href)}</a>`;

  const COMMANDS = {
    help: () => [
      'Available commands:',
      '  whoami        short bio',
      '  experience    roles and dates',
      '  tools         open-source projects',
      '  stack         core technologies',
      '  certs         certifications & education',
      '  research      bug bounty highlights',
      '  contact       how to reach me',
      '  github        open github.com/CadGoose',
      '  theme         toggle light / dark',
      '  clear         clear the screen',
      '  exit          close the console',
    ].join('\n'),
    whoami: () => 'George Mkahail. Cyber Security & Cloud Infrastructure Specialist, Toronto.\n' +
      'Microsoft cloud security, multi-tenant SOC, IT/OT hardening, bug bounty since 2019.',
    experience: () => [
      'Present      Cyber Security Specialist          Coca-Cola Canada Bottling',
      '2026         IT Specialist III (MSP security)   IDS Integrated Digital Solutions',
      '2024-2026    IT Systems Analyst, SecOps         Viking Cives Ltd.',
      '2022-2023    Information Security Specialist    EMCO Corporation',
      '2019-now     Bug bounty researcher              YesWeHack / HackerOne / Intigriti',
      '3 years      Founder & lead technician          North Shield Technology',
    ].join('\n'),
    tools: () => [
      ['kql-detection-library', '25 Sentinel / Defender XDR detections'],
      ['M365PostureAudit', 'Microsoft 365 security posture report'],
      ['ConditionalAccessDrift', 'Conditional Access snapshots & drift'],
      ['MailboxThreatHunter', 'BEC triage for Exchange Online'],
      ['entra-signin-analyzer', 'spray / travel / legacy-auth in sign-in logs'],
      ['purview-dlp-tester', 'test DLP sensitive info types locally'],
      ['fortigate-config-auditor', 'FortiGate policy & IT/OT audit'],
    ].map(([n, d]) => `${link('https://github.com/CadGoose/' + n, n)}${' '.repeat(Math.max(2, 26 - n.length))}${esc(d)}`).join('\n'),
    stack: () => 'Detection:  Defender XDR, Sentinel, KQL, SentinelOne, CrowdStrike, Huntress\n' +
      'Identity:   Entra ID, Conditional Access, PIM, Intune, Purview DLP\n' +
      'Network:    FortiGate, Palo Alto, segmentation, VPN, OT monitoring\n' +
      'VulnMgmt:   Nessus, ServiceNow SecOps, Burp Suite, Nuclei\n' +
      'Code:       PowerShell, Python, Microsoft Graph',
    certs: () => 'CompTIA Security+\nCisco CCNA\nISC2 Certified in Cybersecurity (CC)\nAdvanced Diploma, Cyber Security - Fanshawe College',
    research: () => 'YesWeHack global Top 1000 · Top 10 on two programs\n2020 Yahoo Paranoids Hack of Fame\n' +
      'Highlights: unauthenticated RCE (CVSS 9.8), AEM repository exposure (8.2),\n' +
      'token-in-URL account takeover (7.6), GraphQL authorization bypass (7.2)',
    contact: () => `email     ${link('mailto:gmkahail@gmail.com', 'gmkahail@gmail.com')}\n` +
      `linkedin  ${link('https://www.linkedin.com/in/cyber-op-george-mkahail', 'in/cyber-op-george-mkahail')}\n` +
      `github    ${link('https://github.com/CadGoose', 'github.com/CadGoose')}`,
    github: () => { window.open('https://github.com/CadGoose', '_blank', 'noopener'); return 'Opening github.com/CadGoose ...'; },
    theme: () => { toggle && toggle.click(); return `Theme: ${current()}`; },
    sudo: () => 'Nice try. This incident has been logged. ;)',
  };
  const ALIASES = { ls: 'tools', '?': 'help', about: 'whoami', jobs: 'experience', email: 'contact' };

  const print = (html) => { out.insertAdjacentHTML('beforeend', html + '\n'); out.scrollTop = out.scrollHeight; };
  const history = [];
  let hIdx = 0;
  let lastFocus = null;

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    print(`<span class="cmd">$ ${esc(raw)}</span>`);
    if (!cmd) return;
    history.push(raw); hIdx = history.length;
    const name = ALIASES[cmd] || cmd.split(/\s+/)[0];
    if (name === 'clear') { out.innerHTML = ''; return; }
    if (name === 'exit') { close(); return; }
    const fn = COMMANDS[name];
    if (!fn) { print(`<span class="dim">command not found: ${esc(cmd)}. Type 'help'.</span>`); return; }
    const result = fn();
    // Commands return pre-escaped HTML when they include links; plain text otherwise.
    print(/<a /.test(result) ? result : esc(result));
  };

  const open = () => {
    lastFocus = document.activeElement;
    cli.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!out.childElementCount && !out.textContent) {
      print('<span class="dim">Welcome. Type \'help\' to see commands.</span>');
    }
    input.focus();
  };
  function close() {
    cli.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-open-cli]').forEach((b) => b.addEventListener('click', open));
  cli.querySelectorAll('[data-close-cli]').forEach((b) => b.addEventListener('click', close));
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) { hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ''; e.preventDefault(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const match = Object.keys(COMMANDS).concat('clear', 'exit').find((c) => c.startsWith(input.value.trim().toLowerCase()));
      if (match) input.value = match;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !cli.hidden) close();
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '`' && cli.hidden && !typing) { e.preventDefault(); open(); }
  });
})();
