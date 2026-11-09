const fullDemo = document.querySelector('#demo');
const assets = fullDemo.dataset.assets;
const docs = new URL('../docs/', new URL(assets, location.href));
const template = document.querySelector('#demo-app-template');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const screens = [
  ['compose', 'New post', 'plus'], ['team', 'Team', 'team'],
  ['calendar', 'Calendar', 'calendar'], ['queue', 'Queue', 'queue'],
  ['drafts', 'Drafts', 'drafts'], ['channels', 'Channels', 'channels'],
  ['media', 'Media', 'media'], ['reports', 'Reports', 'reports'],
  ['settings', 'Settings', 'settings'],
];
const platformNames = { instagram: 'Instagram', linkedin: 'LinkedIn', threads: 'Threads', facebook: 'Facebook', x: 'X' };
const candidates = [
  { name: 'Avery', mark: 'fold', specialty: 'Community copy', sample: 'I’d lead with what people can do together, then give them one clear way to join.' },
  { name: 'Jordan', mark: 'folio', specialty: 'Founder stories', sample: 'I’d ask for one moment from your day that explains why you’re doing this.' },
  { name: 'Quinn', mark: 'spark', specialty: 'Short hooks', sample: 'I’d write three first lines and keep the one you’d actually say out loud.' },
  { name: 'Mika', mark: 'grid', specialty: 'Content planning', sample: 'I’d plan the announcement and reminder together so each post has a purpose.' },
  { name: 'Sol', mark: 'lens', specialty: 'Visual direction', sample: 'I’d choose one photo that shows the work, then write a caption that adds context.' },
  { name: 'Remy', mark: 'reply', specialty: 'Community replies', sample: 'I’d turn the questions people keep asking into short, useful replies in your voice.' },
];
const campaigns = {
  coffee: {
    name: 'Morrow Coffee', idea: 'Invite people to Saturday’s coffee tasting', job: 'Tasting campaign',
    scope: 'Write a tasting invite for Instagram, LinkedIn, and Threads. Give locals one clear way to reserve a seat.',
    shortlist: ['Avery', 'Jordan', 'Sol'],
    media: { name: 'Tasting table', file: 'tasting-table.webp', alt: 'Coffee tasting bowls beside bags of roasted beans' },
    reminder: 'Tasting reminder', channels: ['instagram', 'linkedin', 'threads'],
    captions: [
      'Three roasts. One table. Join us at Morrow this Saturday at 10 a.m. to taste them side by side. DM us for a seat.',
      'What changes when you taste three coffees side by side? This Saturday at 10 a.m., we’re opening our tasting table so you can find out with our roaster.',
      'We’re pouring three coffees at 10 a.m. Saturday. What are you reaching for first: bright and fruity, or rich and chocolatey?',
    ],
  },
  personal: {
    name: 'Ari Reyes', idea: 'Share why I sketch the flow before I design the screens', job: 'Designer field notes',
    scope: 'Turn a sketchbook habit into a short story. Use my own words and examples from the notebook.',
    shortlist: ['Quinn', 'Jordan', 'Remy'],
    media: { name: 'Notebook sketch', file: 'design-notebook.webp', alt: 'Hands sketching a user flow on paper next to a keyboard' },
    reminder: 'Follow up on sketching', channels: ['linkedin', 'instagram', 'threads'],
    captions: [
      'I sketch the path before I design the screen. On paper, it takes five seconds to cross out a step. That’s where I catch the steps I’d otherwise spend hours polishing.',
      'Today’s desk: paper, pencil, and a few arrows. I’m sketching how someone gets from A to B before I touch the layout.',
      'My first design tool is usually a pencil. If I can’t explain the flow in a few boxes, I’m probably adding too many steps.',
    ],
  },
  update: {
    name: 'GenePost', idea: 'Show how the weekly calendar helps you plan posts', job: 'Calendar update',
    scope: 'Show the week view and how to open a post preview. Draft an announcement and a follow-up.',
    shortlist: ['Mika', 'Jordan', 'Quinn'],
    media: { name: 'Week view', file: 'calendar.webp', alt: 'GenePost’s weekly calendar with planned posts by channel' },
    reminder: 'Week view follow-up', channels: ['linkedin', 'x', 'threads'],
    captions: [
      'GenePost opens to your week. See which posts are planned, filter by channel, and click a post to review its caption and media in Queue.',
      'A quick GenePost update: your week now opens first. See what’s planned across channels and open any post right from the calendar.',
      'I wanted one place to see what goes out this week. GenePost’s calendar opens there now, and each post takes you straight to its preview.',
    ],
  },
};

const dateLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const dayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const timeLabel = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateKey = date => [date.getFullYear(), date.getMonth() + 1, date.getDate()]
  .map(part => String(part).padStart(2, '0')).join('-');
function offsetDay(date, offset) {
  const day = new Date(date);
  day.setDate(day.getDate() + offset);
  return day;
}
function monday(date) {
  return offsetDay(date, -(date.getDay() + 6) % 7);
}

function newState(campaignID, seed = true) {
  const campaign = campaigns[campaignID];
  const day = offsetDay(new Date(), 1);
  const channels = [...campaign.channels];
  const captions = Object.fromEntries(channels.map((key, index) => [key, campaign.captions[index]]));
  const drafts = [{ id: 'sample-draft', idea: campaign.reminder, channels, asset: 'cover', captions }];
  const jobs = channels.map((platform, index) => ({
    id: 'sample-' + platform, platform, caption: captions[platform], asset: 'cover',
    date: dateKey(offsetDay(day, index ? -3 : 0)) + 'T10:00:00',
    status: index ? 'published' : 'scheduled',
  }));
  return {
    campaignID, campaign, view: 'compose', theme: 'dark', idea: campaign.idea,
    jobTitle: campaign.job, jobDescription: campaign.scope, hireStep: '', hiring: null, team: [],
    channels, platform: channels[0], captions: null,
    media: [
      { id: 'cover', name: campaign.media.name, src: assets + campaign.media.file, alt: campaign.media.alt },
      ...(campaignID === 'coffee' ? [{ id: 'menu', name: 'Tasting menu', src: assets + 'demo-menu.svg' }] : []),
    ],
    asset: 'cover', choosingMedia: false, draftID: null, drafts: seed ? drafts : [], jobs: seed ? jobs : [],
    day: dateKey(day), time: '10:00', week: monday(day), jobID: null,
    nextID: 1, queueFilter: 'scheduled', reportFilter: '', notice: '', error: '',
  };
}

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const icon = name => '<svg class="symbol" aria-hidden="true"><use href="#icon-' + name + '"></use></svg>';
const platformIcon = key => '<img class="platform-icon" src="' + assets + key + '.png" width="16" height="16" alt="">';
const platformName = key => platformIcon(key) + platformNames[key];
const picture = (asset, eager = false) => asset?.video
  ? '<video src="' + escapeHTML(asset.src) + '" controls muted playsinline preload="metadata" aria-label="' + escapeHTML(asset.name) + '"></video>'
  : asset ? '<img src="' + escapeHTML(asset.src) + '" alt="' + escapeHTML(asset.alt ?? asset.name) + '"' + (eager ? '' : ' loading="lazy"') + '>' : '';
function action(name, label, { value = '', kind = '', glyph = '', pressed, title } = {}) {
  return '<button type="button" class="app-button ' + kind + '" data-action="' + name +
    '" data-value="' + escapeHTML(value) + '"' + (pressed === undefined ? '' : ' aria-pressed="' + pressed + '"') +
    (title ? ' aria-label="' + title + '" title="' + title + '"' : '') + '>' +
    (glyph ? icon(glyph) : '') + label + '</button>';
}
const avatar = candidate => '<img class="agent-avatar" src="' + assets + 'team-marks/' + candidate.mark + '.svg" width="64" height="64" alt="">';

const walkthrough = [
  ['Choose channels', '.demo-sidebar [data-value="channels"]', { chapter: 'channels', hold: 1550 }],
  ['Open Team', '.demo-sidebar [data-value="team"]', { chapter: 'hire' }],
  ['Post a job', '[data-action="post-job"]'],
  ['Post the role', '[data-submit="post-role"] button[type="submit"]', { hold: 2050 }],
  ['Review applications', '[data-action="review-applications"]', { hold: 1150 }],
  ['Compare applicants', '[data-action="candidate"][data-value="Jordan"]', { hold: 1650 }],
  ['Start interview', '[data-action="interview"]', { hold: 1200 }],
  ['Give direction', '[data-action="sample-direction"]', { hold: 900 }],
  ['Send message', '[data-submit="interview-message"] button[type="submit"]', { hold: 1900 }],
  ['Hire Jordan', '[data-action="hire"]'],
  ['Start a post', '.demo-sidebar [data-value="compose"]', { chapter: 'media' }],
  ['Add media', '[data-action="choose-media"]'],
  ['Attach media', '[data-action="attach"][data-value="cover"]', { hold: 1300 }],
  ['Draft captions', '[data-action="generate"]', { chapter: 'draft', hold: 1700 }],
  ['Compare captions', '.platform-tabs [data-action="platform"]:nth-child(2)', { hold: 1950 }],
  ['Save draft', '[data-action="save-draft"]', { chapter: 'plan' }],
  ['Review post', '[data-action="review"]'],
  ['Schedule posts', '[data-submit="schedule"] button', { hold: 1900 }],
  ['Open a post', '[data-action="open-job"]', { chapter: 'queue', hold: 1650 }],
  ['Mark published', '[data-action="publish"]', { hold: 1450 }],
  ['Check reports', '.demo-sidebar [data-value="reports"]', { chapter: 'reports', hold: 4200 }],
];
const chaptersByView = {
  channels: 'channels', team: 'hire', media: 'media', compose: 'draft',
  drafts: 'plan', review: 'plan', calendar: 'plan', queue: 'queue', reports: 'reports',
};

const previewWalkthrough = [
  ['Write an idea', '[data-field="idea"]', { typing: true, hold: 560 }],
  ['Draft captions', '[data-action="generate"]', { hold: 1180 }],
  ['Review LinkedIn', '[data-action="platform"][data-value="linkedin"]'],
  ['Review Threads', '[data-action="platform"][data-value="threads"]'],
  ['Review post', '[data-action="review"]', { hold: 1350 }],
  ['Schedule posts', '[data-submit="schedule"] button', { hold: 2460 }],
  ['Start a post', '.demo-sidebar [data-value="compose"]', { restart: true, hold: 850 }],
];

function previewState() {
  const state = newState('coffee', false);
  state.idea = '';
  state.team = [candidates[0].name];
  return state;
}

function mountDemo(root, preview = false) {
  const host = root.querySelector('[data-demo-host]');
  const app = host.appendChild(template.content.firstElementChild.cloneNode(true));
  const appWindow = app.querySelector('.demo-window');
  const sidebar = app.querySelector('.demo-sidebar');
  const workspace = app.querySelector('.demo-workspace');
  const announcements = app.appendChild(document.createElement('div'));
  announcements.className = 'sr-only';
  announcements.setAttribute('role', 'status');
  const controls = root.querySelector('#demo-controls');
  const playButton = root.querySelector('[data-action="play"]');
  const stopButton = root.querySelector('[data-action="stop"]');
  const cue = root.querySelector('[data-demo-cue]');
  const pointer = app.querySelector('.demo-pointer');
  const progress = root.querySelector('.demo-progress');
  const guide = root.querySelector('.demo-guide');
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const nativeScreen = root.querySelector('#native-screen');
  const steps = preview ? previewWalkthrough : walkthrough;
  const workspaces = new Map();
  let state = preview ? previewState() : newState('coffee');
  if (!preview) workspaces.set('coffee', state);
  let playback = preview ? { index: 0, playing: false } : undefined;
  let playerVisible = !('IntersectionObserver' in window);
  let previewPaused = false;
  let wantsGuide = true;
  let motionOptIn = false;
  let screenAnimation;
  let animateResponse = false;
  let pointerSubmit;
  let scriptedInput = false;

  const mediaByID = id => state.media.find(asset => asset.id === id);
  const heading = (title, extra = '') => '<div class="app-heading"><h2>' + title + '</h2>' + extra + '</div>';
  const brand = () => '<span class="app-brand">' + escapeHTML(state.campaign.name) + '</span>';
  const empty = (glyph, text, button = '') => '<div class="app-empty">' + icon(glyph) + '<p>' + text + '</p>' + button + '</div>';
  const upload = () => '<label class="app-button upload">' + icon('upload') +
    'Import media<input type="file" accept="image/*,video/*"></label>';

  function feed(platform, caption, asset, editable = false) {
    return '<article class="demo-feed">' +
      '<div class="feed-account">' + platformIcon(platform) + '<strong>' + escapeHTML(state.campaign.name) +
      '</strong><span>' + platformNames[platform] + '</span></div>' +
      (editable
        ? '<textarea class="caption-field" data-field="caption" aria-label="Edit caption" maxlength="1200" rows="3">' + escapeHTML(caption) + '</textarea>'
        : '<p>' + escapeHTML(caption) + '</p>') +
      (asset ? '<div class="feed-art">' + picture(asset, true) + '</div>' : '') +
      '</article>';
  }

  function mediaPicker() {
    return '<div class="media-picker">' + state.media.map(asset =>
      '<button type="button" class="media-option" data-action="attach" data-value="' + asset.id +
      '" aria-pressed="' + (asset.id === state.asset) + '">' +
      (asset.video ? icon('media') : picture(asset)) + '<span>' + escapeHTML(asset.name) + '</span></button>'
    ).join('') + upload() + '</div>';
  }

  function compose() {
    const asset = mediaByID(state.asset);
    const platform = state.platform;
    const tabs = state.channels.map(key => action('platform', platformName(key), {
      value: key, pressed: key === platform, kind: 'platform-tab',
    })).join('');
    const teammate = state.team.at(-1)?.person;
    return heading('New post', brand()) + '<div class="compose-layout">' +
      '<div class="app-stack">' +
      '<label class="app-field">Post idea<textarea data-field="idea" maxlength="280" rows="3" placeholder="Describe your idea">' +
      escapeHTML(state.idea) + '</textarea></label>' +
      '<div class="app-row">' +
      action('choose-media', asset ? 'Change media' : 'Add media', { glyph: 'media', pressed: state.choosingMedia }) +
      (asset ? action('remove-media', '', { glyph: 'close', title: 'Remove attachment', kind: 'app-icon' }) : '') +
      (teammate ? '<span class="agent-chip">' + avatar(teammate) + teammate.name + '</span>' : '') +
      '</div>' +
      (state.choosingMedia ? mediaPicker() : '') +
      '<div class="app-row">' + action('generate', 'Draft captions', { glyph: 'spark', kind: 'app-primary' }) + '</div>' +
      (state.captions ? '<div class="app-row draft-actions">' +
        action('save-draft', 'Save draft', { glyph: 'drafts' }) +
        action('review', 'Review post', { glyph: 'right' }) + '</div>' : '') +
      '</div>' +
      '<div class="app-stack preview-column"><div class="app-row platform-tabs" aria-label="Preview channel">' + tabs + '</div>' +
      (platform ? feed(platform, state.captions?.[platform] ??
        (preview ? 'Caption preview' : state.campaign.captions[state.campaign.channels.indexOf(platform)]), asset, Boolean(state.captions) && !playback) :
        empty('channels', 'Select a channel', action('screen', 'Open channels', { value: 'channels' }))) +
      '</div></div>';
  }

  function team() {
    const job = state.hiring;
    if (state.hireStep === 'job') {
      return heading('Post a job', brand()) + '<form class="app-stack job-form" data-submit="post-role">' +
        '<label class="app-field">Job title<input data-field="jobTitle" required maxlength="64" value="' + escapeHTML(state.jobTitle) + '"></label>' +
        '<label class="app-field">Job description<textarea data-field="jobDescription" required rows="3" maxlength="300">' +
        escapeHTML(state.jobDescription) + '</textarea></label>' +
        '<div class="app-row">' + state.channels.map(platformName).map(label => '<span class="agent-chip">' + label + '</span>').join('') + '</div>' +
        '<div class="app-row job-actions">' + action('team-home', 'Cancel', { kind: 'job-back' }) +
        '<button class="app-button app-primary" type="submit">' + icon('right') + 'Post job</button></div></form>';
    }
    if (state.hireStep === 'posted') {
      return heading('Job posted', brand()) + '<div class="job-receipt app-stack">' +
        '<div class="posted-role"><span>' + icon('check') + 'Role open</span><h3>' + escapeHTML(job.title) + '</h3>' +
        '<p>' + escapeHTML(job.description) + '</p></div>' +
        (job.ready
          ? '<div class="application-arrival"><div class="arrival-marks" aria-hidden="true">' + job.applicants.map(avatar).join('') + '</div>' +
            '<div><strong>' + job.applicants.length + ' applications received</strong><small>' + job.applicants.map(person => person.name).join(' · ') + '</small></div>' +
            action('review-applications', 'Review applications', { glyph: 'right', kind: 'app-primary' }) + '</div>'
          : '<p class="application-wait"><span class="application-spinner" aria-hidden="true"></span>Waiting for applications…</p>') +
        action('team-home', 'Back to Team', { glyph: 'left', kind: 'job-back' }) + '</div>';
    }
    if (state.hireStep === 'applicants') {
      const candidate = job.applicants.find(person => person.name === job.selected);
      return heading('Applications', brand()) +
        '<div class="job-context"><p>' + escapeHTML(job.title) + '</p>' +
        action('job-receipt', 'Job post', { glyph: 'left', kind: 'job-back' }) + '</div>' +
        '<div class="applicant-panel"><div class="applicants" role="group" aria-label="Applicants">' +
        job.applicants.map(person => action('candidate', avatar(person) + '<strong>' + person.name + '</strong>',
          { value: person.name, pressed: person.name === candidate.name, kind: 'candidate' })).join('') +
        '</div><section class="candidate-profile" aria-label="Applicant profile">' +
        '<div class="candidate-meta"><h3>' + candidate.name + '</h3><span>' + candidate.specialty + '</span></div>' +
        '<div class="candidate-sample"><span>How I’d start</span><p>' + candidate.sample + '</p></div>' +
        '<div class="app-row job-actions">' + action('hire', 'Hire ' + candidate.name) +
        action('interview', job.interviews[candidate.name]?.turns.length ? 'Open interview' : 'Start interview',
          { glyph: 'right', kind: 'app-primary' }) + '</div></section></div>';
    }
    if (state.hireStep === 'interview') {
      const candidate = job.applicants.find(person => person.name === job.selected);
      const { draft, turns } = job.interviews[candidate.name];
      const directions = turns.filter(turn => turn.direction);
      return heading('Interview ' + candidate.name, brand()) +
        '<div class="job-context"><p>' + escapeHTML(job.title) + '</p>' +
        action('review-applications', 'Applications', { glyph: 'left', kind: 'job-back' }) + '</div>' +
        '<div class="interview-thread app-stack" aria-label="Sample interview">' +
        '<div class="interview-line">' + avatar(candidate) + '<p>What voice should I use for this role?</p></div>' +
        turns.map((turn, index) => '<div class="interview-line interview-you"><p>' + escapeHTML(turn.message) + '</p></div>' +
          '<div class="interview-line"' + (index === turns.length - 1 ? ' data-latest-reply' : '') + '>' +
          avatar(candidate) + '<p>' + turn.reply + '</p></div>').join('') +
        (directions.length ? '<div class="interview-setup"><strong>' + icon('check') + 'Setup for this role</strong><ul>' +
          directions.map(turn => '<li>' + escapeHTML(turn.message) + '</li>').join('') + '</ul></div>' : '') + '</div>' +
        '<form class="app-stack interview-form" data-submit="interview-message">' +
        '<div class="interview-input"><input data-field="interviewMessage" aria-label="Interview message" placeholder="Ask a question or give direction…" required maxlength="180" value="' + escapeHTML(draft) + '">' +
        '<button class="app-button app-primary" type="submit">Send</button></div>' +
        '<div class="app-row interview-actions">' + action('sample-direction', 'Keep it conversational', { kind: 'job-back' }) +
        action('hire', 'Hire ' + candidate.name, { glyph: 'check' }) + '</div></form>';
    }
    const openJob = job ? '<div class="team-job">' + action('job-receipt',
      '<span><strong>' + escapeHTML(job.title) + '</strong><small>' +
      (job.ready ? (job.reviewed ? 'Applications' : job.applicants.length + ' new applications') : 'Waiting for applications') + '</small></span>',
      { glyph: 'team', kind: 'app-list-row' }) + '</div>' : '';
    return heading('Team', job || state.team.length === candidates.length ? brand() : action('post-job', 'Post a job', { glyph: 'plus', kind: 'app-primary' })) +
      openJob +
      (state.team.length
        ? '<div class="team-list">' + state.team.map(({ person, directions }) =>
          '<div class="app-list-row">' + avatar(person) + '<span><strong>' + person.name + '</strong><small>' +
          person.specialty + '</small>' + (directions.length ? '<small class="team-direction">' + icon('check') +
            escapeHTML(directions.join(' ')) + '</small>' : '') + '</span></div>'
        ).join('') + '</div>' + action('screen', 'Brief teammate', { value: 'compose', glyph: 'right' })
        : job ? '' : empty('team', 'Build your team'));
  }

  function review() {
    return heading('Review post', brand()) + '<div class="compose-layout">' +
      '<form class="app-stack" data-submit="schedule"><div class="app-row"><label class="app-field">Date<input type="date" data-field="day" required value="' + escapeHTML(state.day) +
      '"></label><label class="app-field">Time<input type="time" data-field="time" required value="' + escapeHTML(state.time) +
      '"></label></div><div class="app-row"><button class="app-button app-primary" type="submit">' + icon('calendar') +
      'Schedule posts</button>' + action('screen', 'Back', { value: 'compose' }) + '</div></form>' +
      feed(state.platform, state.captions[state.platform], mediaByID(state.asset)) + '</div>';
  }

  function calendar() {
    const days = Array.from({ length: 7 }, (_, index) => offsetDay(state.week, index));
    return heading('Calendar', '<div class="app-row week-controls">' +
      action('week', '', { value: '-7', glyph: 'left', title: 'Previous week', kind: 'app-icon' }) +
      '<span>' + dateLabel.formatRange(days[0], days[6]) + '</span>' +
      action('week', '', { value: '7', glyph: 'right', title: 'Next week', kind: 'app-icon' }) +
      '</div>') + '<div class="demo-week">' + days.map(day => {
        const planned = state.jobs.filter(job => dateKey(new Date(job.date)) === dateKey(day));
        return '<div class="demo-day' + (dateKey(day) === dateKey(new Date()) ? ' today' : '') + '"><span>' +
          dayLabel.format(day) + '</span><strong>' + day.getDate() + '</strong>' + planned.map(job =>
          action('open-job', platformIcon(job.platform) + '<span>' + timeLabel.format(new Date(job.date)) + '</span>',
            { value: job.id, kind: 'event', title: 'Open ' + platformNames[job.platform] + ' post' })
        ).join('') + '</div>';
      }).join('') + '</div>' + (state.jobs.length ? '' : '<p class="demo-muted">No posts planned</p>');
  }

  function queue() {
    const jobs = state.jobs.filter(job => job.status === state.queueFilter);
    const selected = jobs.find(job => job.id === state.jobID) ?? jobs[0];
    return heading('Queue', '<div class="app-row">' +
      action('queue-filter', 'Upcoming', { value: 'scheduled', pressed: state.queueFilter === 'scheduled' }) +
      action('queue-filter', 'History', { value: 'published', pressed: state.queueFilter === 'published' }) +
      '</div>') + (selected ? '<div class="compose-layout"><div class="app-stack">' +
        jobs.map(job => action('select-job', platformName(job.platform) + '<small>' +
          dateLabel.format(new Date(job.publishedAt ?? job.date)) + '</small>', {
          value: job.id, pressed: selected.id === job.id, kind: 'app-list-row',
        })).join('') + '</div><div class="app-stack">' +
        feed(selected.platform, selected.caption, mediaByID(selected.asset)) +
        (selected.status === 'scheduled'
          ? action('publish', 'Mark published', { value: selected.id, glyph: 'check', kind: 'app-primary' })
          : '<span class="published">' + icon('check') + 'Published</span>') +
        '</div></div>' : empty('queue', 'No posts here'));
  }

  function drafts() {
    return heading('Drafts', action('screen', 'New post', { value: 'compose', glyph: 'plus' })) +
      (state.drafts.length ? '<div class="app-stack">' + state.drafts.map(draft =>
        action('open-draft', icon('drafts') + '<span>' + escapeHTML(draft.idea) + '</span>' + icon('right'),
          { value: draft.id, kind: 'app-list-row' })
      ).join('') + '</div>' : empty('drafts', 'No drafts yet'));
  }

  function channels() {
    return heading('Channels', brand()) + '<div class="channel-options">' +
      state.campaign.channels.map(key => action('toggle-channel',
        platformName(key) + (state.channels.includes(key) ? icon('check') : icon('plus')),
        { value: key, pressed: state.channels.includes(key), kind: 'app-list-row' }
      )).join('') + '</div>' + action('screen', 'New post', { value: 'compose', glyph: 'plus', kind: 'app-primary' });
  }

  function media() {
    return heading('Media', upload()) + '<div class="library">' + state.media.map(asset =>
      '<figure><div class="library-art">' + picture(asset) + '</div><figcaption><strong>' + escapeHTML(asset.name) + '</strong>' +
      action('use-media', 'Use media', { value: asset.id, glyph: 'plus' }) + '</figcaption></figure>'
    ).join('') + '</div>';
  }

  function reports() {
    const jobs = state.jobs.filter(job => !state.reportFilter || job.platform === state.reportFilter);
    const published = jobs.filter(job => job.status === 'published')
      .sort((first, second) => new Date(second.publishedAt ?? second.date) - new Date(first.publishedAt ?? first.date));
    const upcoming = jobs.filter(job => job.status === 'scheduled')
      .sort((first, second) => new Date(first.date) - new Date(second.date));
    const postRow = job => {
      const asset = mediaByID(job.asset);
      const date = new Date(job.publishedAt ?? job.date);
      const thumb = asset && !asset.video
        ? '<img src="' + escapeHTML(asset.src) + '" alt="" loading="lazy">'
        : icon(asset?.video ? 'media' : 'drafts');
      return '<li>' + action('open-job',
        '<span class="report-thumb" aria-hidden="true">' + thumb + '</span>' +
        '<span class="report-copy"><strong>' + escapeHTML(job.caption) + '</strong><small>' + platformName(job.platform) + '</small></span>' +
        '<time datetime="' + date.toISOString() + '">' + dateLabel.format(date) + '</time>' + icon('right'),
        { value: job.id, kind: 'report-post' }) + '</li>';
    };
    const section = (title, entries, status, glyph, emptyText) => '<section class="report-section">' +
      '<h3>' + icon(glyph) + title + '<span data-count="' + status + '">' + entries.length + '</span></h3>' +
      (entries.length ? '<ul>' + entries.map(postRow).join('') + '</ul>' : '<p>' + emptyText + '</p>') + '</section>';
    return heading('Publishing report', '<select aria-label="Filter channels" data-field="reportFilter">' +
      '<option value="">All channels</option>' +
      state.campaign.channels.map(key => '<option value="' + key + '"' + (state.reportFilter === key ? ' selected' : '') + '>' +
        platformNames[key] + '</option>').join('') + '</select>') +
      '<div class="publishing-log">' +
      section('Published', published, 'published', 'check', 'No published posts yet') +
      section('Up next', upcoming, 'scheduled', 'calendar', 'Nothing scheduled') + '</div>';
  }

  function settings() {
    return heading('Settings', brand()) + '<div class="app-stack"><h3>Appearance</h3><div class="app-row">' +
      action('theme', 'Dark', { value: 'dark', pressed: state.theme === 'dark' }) +
      action('theme', 'Light', { value: 'light', pressed: state.theme === 'light' }) +
      '</div><a class="app-button" href="' + new URL('#integrations', docs) + '">Connection guide ' + icon('external') + '</a></div>';
  }

  const views = { compose, team, review, calendar, queue, drafts, channels, media, reports, settings };
  function draw({ moved = false, reveal = '.app-notice, .app-error' } = {}) {
    const view = state.view === 'review' ? 'compose' : state.view;
    const oldFocus = workspace.contains(document.activeElement) ? document.activeElement : null;
    const scroll = workspace.scrollTop;
    app.dataset.theme = state.theme;
    sidebar.querySelectorAll('button').forEach(button => {
      if (button.dataset.value === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      if (button.dataset.value === 'team') {
        const unread = Boolean(state.hiring?.ready && !state.hiring.reviewed);
        button.toggleAttribute('data-applications-unread', unread);
        button.setAttribute('aria-label', unread ? 'Team, new applications' : 'Team');
      }
    });
    workspace.innerHTML = views[state.view]() +
      (state.error ? '<p class="app-error" role="alert">' + state.error + '</p>' : '') +
      (state.notice ? '<p class="app-notice" role="status">' + icon('check') + state.notice + '</p>' : '');
    workspace.scrollTop = moved ? 0 : scroll;
    if (oldFocus) {
      const match = [...workspace.querySelectorAll('button, input, textarea, select')].find(element =>
        oldFocus.dataset.field ? element.dataset.field === oldFocus.dataset.field :
          oldFocus.dataset.action && element.dataset.action === oldFocus.dataset.action && element.dataset.value === oldFocus.dataset.value);
      (match ?? workspace).focus({ preventScroll: true });
    }
    const screenshot = state.view === 'team' && state.hireStep ? 'hiring' : view;
    if (nativeScreen) nativeScreen.href = assets + screenshot + '.webp';
    updateChapter();
    screenAnimation?.cancel();
    if (animateResponse && !reducedMotion.matches) {
      const changed = moved
        ? (preview ? workspace.querySelector('.demo-week') ?? workspace.querySelector('.app-heading') : workspace)
        : workspace.querySelector(reveal);
      screenAnimation = changed?.animate(
        [{ opacity: .78, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 210, easing: 'cubic-bezier(.16, 1, .3, 1)' }
      );
    }
  }

  function screen(view) {
    state.view = view;
    state.choosingMedia = false;
    if (view === 'team') state.hireStep = '';
    draw({ moved: true });
  }

  function generate() {
    const idea = state.idea.trim();
    if (!idea || !state.channels.length) {
      state.error = idea ? 'Select a channel' : 'Enter an idea';
      return draw();
    }
    const samples = [idea, 'From our team.\n' + idea, 'What would you try?\n' + idea];
    const matchingIdea = idea.toLowerCase() === state.campaign.idea.toLowerCase();
    state.captions = Object.fromEntries(state.campaign.channels.map((key, index) =>
      [key, (matchingIdea ? state.campaign.captions : samples)[index]]));
    state.notice = 'Sample captions ready';
    draw({ reveal: preview ? '.demo-feed > p' : '.demo-feed' });
  }

  function saveDraft() {
    const id = state.draftID ?? String(state.nextID++);
    const draft = { id, idea: state.idea, asset: state.asset, channels: [...state.channels], captions: { ...state.captions } };
    state.draftID = id;
    const index = state.drafts.findIndex(item => item.id === id);
    if (index < 0) state.drafts.unshift(draft);
    else state.drafts[index] = draft;
    state.notice = 'Draft saved';
    draw();
  }

  function schedule() {
    const date = new Date(state.day + 'T' + state.time);
    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      state.error = 'Choose future time';
      return draw();
    }
    if (!state.channels.length || state.channels.some(key => !state.captions[key]?.trim())) {
      state.error = 'Check every caption';
      return draw();
    }
    for (const platform of state.channels) {
      state.jobs.push({
        id: String(state.nextID++), platform, caption: state.captions[platform],
        asset: state.asset, date: date.toISOString(), status: 'scheduled',
      });
    }
    state.week = monday(date);
    state.drafts = state.drafts.filter(draft => draft.id !== state.draftID);
    state.draftID = null;
    state.notice = 'Posts scheduled';
    screen('calendar');
  }

  function importMedia(file) {
    if (!file) return;
    state.notice = '';
    state.error = '';
    if (!/^(image|video)\//.test(file.type) || file.size > 20 * 1024 * 1024) {
      state.error = file.size > 20 * 1024 * 1024 ? 'Maximum 20 MB' : 'Choose photo/video';
      return draw();
    }
    const asset = { id: 'local-' + state.nextID++, name: file.name, src: URL.createObjectURL(file), video: file.type.startsWith('video/') };
    state.media.push(asset);
    state.notice = 'Media added';
    if (state.view === 'compose') {
      state.asset = asset.id;
      state.choosingMedia = false;
    }
    draw();
  }

  const commands = {
    screen,
    'choose-media': () => { state.choosingMedia = !state.choosingMedia; draw({ reveal: '.media-picker' }); },
    attach: id => { state.asset = id; state.choosingMedia = false; draw({ reveal: '.demo-feed' }); },
    'remove-media': () => { state.asset = null; draw({ reveal: '.demo-feed' }); },
    'use-media': id => { state.asset = id; screen('compose'); },
    platform: key => {
      if (state.platform === key) return;
      state.platform = key;
      draw({ reveal: preview ? '.demo-feed > p' : '.demo-feed' });
    },
    generate,
    'save-draft': saveDraft,
    'open-draft': id => {
      const draft = state.drafts.find(item => item.id === id);
      state.draftID = id;
      state.idea = draft.idea;
      state.asset = draft.asset;
      state.channels = [...draft.channels];
      state.platform = draft.channels[0];
      state.captions = { ...draft.captions };
      screen('compose');
    },
    review: () => {
      if (!state.channels.length) {
        state.error = 'Select a channel';
        return draw();
      }
      screen('review');
    },
    schedule,
    'post-job': () => { state.hireStep = 'job'; draw({ reveal: '.job-form' }); },
    'post-role': () => {
      const title = state.jobTitle.trim();
      const description = state.jobDescription.trim();
      if (!title || !description) {
        state.error = 'Add a job title and description';
        return draw();
      }
      const ranked = [...new Set([...state.campaign.shortlist, ...candidates.map(person => person.name)])];
      const applicants = ranked.filter(name => !state.team.some(member => member.person.name === name))
        .slice(0, 3).map(name => candidates.find(person => person.name === name));
      const job = { title, description, applicants, selected: applicants[0].name, ready: false, reviewed: false, interviews: {} };
      const postedWorkspace = state;
      postedWorkspace.hiring = job;
      postedWorkspace.hireStep = 'posted';
      draw({ moved: true });
      setTimeout(() => {
        if (postedWorkspace.hiring !== job) return;
        job.ready = true;
        if (state !== postedWorkspace) return;
        announcements.textContent = job.applicants.length + ' applications received for ' + job.title;
        if (state.view !== 'team') {
          const teamButton = sidebar.querySelector('[data-value="team"]');
          teamButton.setAttribute('data-applications-unread', '');
          teamButton.setAttribute('aria-label', 'Team, new applications');
          return;
        }
        const arrival = state.hireStep === 'posted' ? '.application-arrival' : '.team-job';
        animateResponse = true;
        draw({ reveal: arrival });
        animateResponse = false;
      }, reducedMotion.matches ? 0 : 950);
    },
    'job-receipt': () => { state.hireStep = 'posted'; draw({ moved: true }); },
    'review-applications': () => {
      state.hiring.reviewed = true;
      state.hireStep = 'applicants';
      draw({ moved: true });
    },
    'team-home': () => { state.hireStep = ''; draw(); },
    candidate: name => {
      if (state.hiring.selected === name) return;
      state.hiring.selected = name;
      draw({ reveal: '.candidate-profile' });
    },
    interview: () => {
      const job = state.hiring;
      job.interviews[job.selected] ??= { draft: '', turns: [] };
      state.hireStep = 'interview';
      draw({ moved: true });
    },
    'sample-direction': () => {
      const field = workspace.querySelector('[data-field="interviewMessage"]');
      if (field.value.trim()) return field.focus();
      field.value = 'Keep it conversational.';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      if (!playback) field.focus();
    },
    'interview-message': () => {
      const job = state.hiring;
      const interview = job.interviews[job.selected];
      const message = interview.draft.trim();
      if (!message) return;
      const candidate = job.applicants.find(person => person.name === job.selected);
      const direction = !message.endsWith('?') && !/^(how|what|where|why|when|can|could|would|will|do|does|is|are)\b/i.test(message);
      const reply = direction ? 'I’ll carry that direction into the role.' : candidate.sample;
      interview.turns.push({ message, direction, reply });
      interview.draft = '';
      draw({ reveal: '[data-latest-reply]' });
      const thread = workspace.querySelector('.interview-thread');
      thread.scrollTop = thread.scrollHeight;
      if (!playback) workspace.querySelector('[data-field="interviewMessage"]').focus({ preventScroll: true });
    },
    hire: () => {
      const job = state.hiring;
      const person = job.applicants.find(candidate => candidate.name === job.selected);
      const directions = (job.interviews[person.name]?.turns ?? []).filter(turn => turn.direction).map(turn => turn.message);
      state.team.push({ person, directions });
      state.hiring = null;
      state.hireStep = '';
      state.notice = person.name + ' joined the team';
      draw({ moved: true });
    },
    week: offset => { state.week = offsetDay(state.week, Number(offset)); draw({ reveal: '.demo-week' }); },
    'open-job': id => {
      state.jobID = id;
      state.queueFilter = state.jobs.find(job => job.id === id).status;
      screen('queue');
    },
    'select-job': id => { state.jobID = id; draw({ reveal: '.demo-feed' }); },
    'queue-filter': filter => { state.queueFilter = filter; draw(); },
    publish: id => {
      const job = state.jobs.find(job => job.id === id);
      job.status = 'published';
      job.publishedAt = new Date().toISOString();
      state.jobID = id;
      state.queueFilter = 'published';
      state.notice = 'Marked published';
      draw();
    },
    'toggle-channel': key => {
      state.channels = state.channels.includes(key) ? state.channels.filter(channel => channel !== key) : [...state.channels, key];
      if (!state.channels.includes(state.platform)) state.platform = state.channels[0];
      draw();
    },
    theme: theme => { state.theme = theme; draw(); },
  };

  function perform(name, value, animate = false) {
    state.notice = '';
    state.error = '';
    animateResponse = animate;
    try {
      commands[name](value);
    } finally {
      animateResponse = false;
    }
  }

  function showControls() {
    const playing = playback?.playing;
    if (preview) {
      playButton.hidden = reducedMotion.matches;
      const label = previewPaused ? 'Resume preview' : 'Pause preview';
      playButton.setAttribute('aria-label', label);
      playButton.title = label;
      root.dataset.reel = playing ? 'playing' : 'paused';
      playButton.querySelector('use').setAttribute('href', previewPaused ? '#icon-play' : '#icon-pause');
      return;
    }
    const label = playback ? (playing ? 'Pause' : 'Resume') : 'Play demo';
    playButton.querySelector('span').textContent = label;
    playButton.querySelector('use').setAttribute('href', playing ? '#icon-pause' : '#icon-play');
    stopButton.hidden = !playback;
    controls.querySelector('[data-action="reset"]').hidden = Boolean(playback);
    appWindow.inert = Boolean(playback);
    progress.hidden = !playback;
    progress.firstElementChild.style.transform = 'scaleX(' + (playback ? playback.index / steps.length : 0) + ')';
    updateChapter();
  }

  function updateChapter() {
    const current = playback?.chapter ?? chaptersByView[state.view];
    chapters.forEach(item => {
      if (item.dataset.chapter === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  function pointAt(target) {
    const bounds = target.getBoundingClientRect();
    const frame = app.getBoundingClientRect();
    if (reducedMotion.matches || bounds.bottom > frame.bottom || bounds.top < frame.top) {
      pointer.hidden = true;
      return;
    }
    const scale = frame.width / app.offsetWidth;
    pointer.hidden = false;
    pointer.style.transform = 'translate3d(' + (bounds.left + bounds.width * .63 - frame.left) / scale +
      'px,' + (bounds.top + bounds.height * .56 - frame.top) / scale + 'px,0)';
  }

  function guidePress(target) {
    if (!pointer.hidden) {
      pointer.querySelector('i').animate([
        { opacity: .9, transform: 'scale(.55)' },
        { opacity: 0, transform: 'scale(1.45)' },
      ], { duration: 340, easing: 'ease-out' });
    }
    target.animate([
      { transform: 'scale(1)' }, { transform: 'scale(.965)', offset: .52 }, { transform: 'scale(1)' },
    ], { duration: 150, easing: 'ease-out' });
  }

  function waitForStep(action, delay) {
    const run = playback;
    run.pending = action;
    run.timer = setTimeout(() => {
      if (playback !== run || !run.playing) return;
      run.pending = undefined;
      action();
    }, delay);
  }

  function typeIdea(field, done) {
    const idea = state.campaign.idea;
    let length = 0;
    field.dataset.demoTyping = '';
    const type = () => {
      field.value = idea.slice(0, ++length);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      if (length < idea.length) {
        waitForStep(type, 65 + length % 3 * 17 + (idea[length - 1] === ' ' ? 72 : 0));
      } else {
        delete field.dataset.demoTyping;
        done();
      }
    };
    waitForStep(type, 175);
  }

  function step() {
    const run = playback;
    if (!run?.playing) return;
    const next = steps[run.index];
    if (!next) {
      startGuide();
      return resume();
    }
    const [label, selector, { hold = 980, typing = false, restart = false, chapter } = {}] = next;
    const target = app.querySelector(selector);
    if (!target) {
      if (preview) {
        previewPaused = true;
        cue.textContent = 'Preview paused';
      } else wantsGuide = false;
      return pause();
    }
    cue.textContent = run.label = label;
    pointAt(target);
    const advance = () => {
      run.index = restart ? 0 : run.index + 1;
      if (preview && state.view === 'calendar') cue.textContent = state.notice;
      showControls();
      waitForStep(step, hold);
    };
    const activate = () => {
      if (restart) state = previewState();
      if (chapter) run.chapter = chapter;
      scriptedInput = true;
      try {
        target.click();
      } finally {
        scriptedInput = false;
      }
      if (typing) typeIdea(target, advance);
      else advance();
    };
    if (reducedMotion.matches) {
      waitForStep(activate, 40);
    } else {
      waitForStep(() => {
        guidePress(target);
        waitForStep(activate, 105);
      }, preview ? 375 : 305);
    }
  }

  function pause() {
    clearTimeout(playback.timer);
    playback.playing = false;
    if (!preview) {
      pointer.hidden = true;
      cue.textContent = 'Paused';
    }
    showControls();
  }

  function resume() {
    playback.playing = true;
    if (!preview && playback.label) cue.textContent = playback.label;
    showControls();
    if (playback.pending) waitForStep(playback.pending, 95);
    else waitForStep(step, 500);
  }

  function syncPreview() {
    const shouldPlay = playerVisible && !previewPaused && !document.hidden && !reducedMotion.matches;
    if (shouldPlay && !playback.playing) resume();
    else if (!shouldPlay && playback.playing) pause();
    else showControls();
  }

  function startGuide() {
    const previous = playback?.previous ?? state;
    state = newState(previous.campaignID, false);
    state.asset = null;
    state.theme = previous.theme;
    playback = { previous, index: 0, playing: false };
    pointer.hidden = true;
    draw({ moved: true });
  }

  function syncGuide() {
    const shouldPlay = wantsGuide && playerVisible && !document.hidden && (motionOptIn || !reducedMotion.matches);
    if (shouldPlay) {
      if (!playback) startGuide();
      if (!playback.playing) resume();
    } else if (playback?.playing) pause();
  }

  function play() {
    if (preview) {
      previewPaused = !previewPaused;
      return syncPreview();
    }
    wantsGuide = !playback?.playing;
    motionOptIn = wantsGuide && reducedMotion.matches;
    if (wantsGuide && !document.hidden) {
      if (!playback) startGuide();
      resume();
    } else syncGuide();
  }

  function stop(focus = true) {
    wantsGuide = false;
    if (!playback) return;
    clearTimeout(playback.timer);
    state = playback.previous;
    playback = undefined;
    pointer.hidden = true;
    cue.textContent = 'Try it yourself';
    showControls();
    draw();
    if (focus) playButton.focus({ preventScroll: true });
  }

  function reset() {
    state.media.filter(asset => asset.src.startsWith('blob:')).forEach(asset => URL.revokeObjectURL(asset.src));
    state = newState(state.campaignID);
    workspaces.set(state.campaignID, state);
    cue.textContent = 'Demo reset';
    draw({ moved: true });
  }

  sidebar.innerHTML = screens.map(([value, label, glyph]) => action('screen', label, { value, glyph })).join('');
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.type === 'submit') pointerSubmit = event.detail > 0 ? button : undefined;
    if (!button?.dataset.action) return;
    const { action: name, value } = button.dataset;
    if (name === 'play') play();
    else if (name === 'stop') stop();
    else if (name === 'reset') reset();
    else if (!playback || scriptedInput) perform(name, value, scriptedInput || event.detail > 0);
  });

  workspace.addEventListener('submit', event => {
    event.preventDefault();
    const animate = scriptedInput || Boolean(pointerSubmit && pointerSubmit === event.submitter);
    pointerSubmit = undefined;
    if (!playback || scriptedInput) perform(event.target.dataset.submit, undefined, animate);
  });
  workspace.addEventListener('input', event => {
    const { field } = event.target.dataset;
    if (field === 'caption') state.captions[state.platform] = event.target.value;
    else if (field === 'interviewMessage') state.hiring.interviews[state.hiring.selected].draft = event.target.value;
    else if (field) state[field] = event.target.value;
  });
  workspace.addEventListener('change', event => {
    if (event.target.type === 'file') importMedia(event.target.files[0]);
    if (event.target.dataset.field === 'reportFilter') draw();
  });
  draw();
  host.hidden = false;
  root.querySelector('[data-demo-fallback]').hidden = true;

  if (preview) {
    appWindow.inert = true;
    const fit = () => host.style.setProperty('--demo-scale', host.clientWidth / app.offsetWidth);
    fit();
    new ResizeObserver(fit).observe(host);
    pointer.style.transform = 'translate3d(' + (app.offsetWidth - 55) + 'px,' + (app.offsetHeight - 43) + 'px,0)';
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        playerVisible = entry.intersectionRatio >= .15;
        syncPreview();
      }, { threshold: .15 }).observe(root);
    }
    reducedMotion.addEventListener('change', syncPreview);
    document.addEventListener('visibilitychange', syncPreview);
    syncPreview();
  } else {
    controls.hidden = false;
    guide.hidden = false;
    root.querySelector('.demo-under').hidden = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        playerVisible = entry.isIntersecting;
        syncGuide();
      }).observe(root.querySelector('.mac-screen'));
    }
    reducedMotion.addEventListener('change', () => {
      motionOptIn = false;
      syncGuide();
    });
    document.addEventListener('visibilitychange', syncGuide);
    syncGuide();
    document.querySelectorAll('[data-case]').forEach(link => {
      link.addEventListener('click', () => {
        stop(false);
        const key = link.dataset.case;
        if (!workspaces.has(key)) workspaces.set(key, newState(key));
        state = workspaces.get(key);
        cue.textContent = state.campaign.name;
        state.notice = '';
        state.error = '';
        screen('compose');
        root.focus({ preventScroll: true });
      });
    });
  }
}

mountDemo(fullDemo);
mountDemo(document.querySelector('[data-workspace-preview]'), true);
