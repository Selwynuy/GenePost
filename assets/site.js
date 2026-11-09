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
  { name: 'Freya', specialty: 'Community copy', sample: 'Lead with warmth', portrait: 'freya.webp' },
  { name: 'Tessa', specialty: 'Founder stories', sample: 'Find the story', portrait: 'tessa.webp' },
  { name: 'Mira', specialty: 'Short hooks', sample: 'Open with curiosity' },
];
const campaigns = {
  coffee: {
    name: 'Morrow Coffee', idea: 'Saturday coffee tasting', job: 'Tasting campaign',
    artwork: 'Saturday tasting', reminder: 'Tasting reminder', channels: ['instagram', 'linkedin', 'threads'],
    captions: ['Saturday, sip slowly.', 'Meet our roaster.', 'Which roast first?'],
  },
  florist: {
    name: 'Stem Studio', idea: 'Friday flower pickup', job: 'Florist campaign',
    artwork: 'Friday flowers', reminder: 'Pickup reminder', channels: ['instagram', 'facebook', 'threads'],
    captions: ['Friday flowers await.', 'Reserve your bouquet.', 'What’s your favorite?'],
  },
  studio: {
    name: 'Northline Studio', idea: 'Launch version two', job: 'Product launch',
    artwork: 'Release day', reminder: 'Launch reminder', channels: ['linkedin', 'x', 'threads'],
    captions: ['Meet version two.', 'Version two landed.', 'What’s your wishlist?'],
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
    jobTitle: campaign.job, hireStep: '', candidate: 'Freya', interview: false, team: [],
    channels, platform: channels[0], captions: null,
    media: [
      { id: 'cover', name: campaign.artwork, src: assets + 'demo-' + campaignID + '.svg' },
      { id: 'menu', name: 'Tasting menu', src: assets + 'demo-menu.svg' },
    ].slice(0, campaignID === 'coffee' ? 2 : 1),
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
  : asset ? '<img src="' + escapeHTML(asset.src) + '" alt="' + escapeHTML(asset.name) + '"' + (eager ? '' : ' loading="lazy"') + '>' : '';
function action(name, label, { value = '', kind = '', glyph = '', pressed, title } = {}) {
  return '<button type="button" class="app-button ' + kind + '" data-action="' + name +
    '" data-value="' + escapeHTML(value) + '"' + (pressed === undefined ? '' : ' aria-pressed="' + pressed + '"') +
    (title ? ' aria-label="' + title + '" title="' + title + '"' : '') + '>' +
    (glyph ? icon(glyph) : '') + label + '</button>';
}
const avatar = candidate => candidate.portrait
  ? '<img class="avatar" src="' + assets + candidate.portrait + '" width="60" height="60" alt="">'
  : '<span class="avatar monogram" aria-hidden="true">' + candidate.name[0] + '</span>';

const walkthrough = [
  ['Open Team', '.demo-sidebar [data-value="team"]'],
  ['Post a job', '[data-action="post-job"]'],
  ['See applicants', '[data-submit="applicants"] button'],
  ['Hire Freya', '[data-action="hire"]'],
  ['Start a post', '.demo-sidebar [data-value="compose"]'],
  ['Add media', '[data-action="choose-media"]'],
  ['Attach artwork', '[data-action="attach"][data-value="cover"]'],
  ['Draft captions', '[data-action="generate"]'],
  ['Save draft', '[data-action="save-draft"]'],
  ['Review post', '[data-action="review"]'],
  ['Schedule posts', '[data-submit="schedule"] button'],
  ['Open a post', '[data-action="open-job"]'],
  ['Mark published', '[data-action="publish"]'],
  ['Check reports', '.demo-sidebar [data-value="reports"]'],
];

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
  state.team = ['Freya'];
  return state;
}

function mountDemo(root, preview = false) {
  const host = root.querySelector('[data-demo-host]');
  const app = host.appendChild(template.content.firstElementChild.cloneNode(true));
  const appWindow = app.querySelector('.demo-window');
  const sidebar = app.querySelector('.demo-sidebar');
  const workspace = app.querySelector('.demo-workspace');
  const controls = root.querySelector('#demo-controls');
  const playButton = root.querySelector('[data-action="play"]');
  const stopButton = root.querySelector('[data-action="stop"]');
  const cue = root.querySelector('[data-demo-cue]');
  const pointer = app.querySelector('.demo-pointer');
  const progress = root.querySelector('.demo-progress');
  const nativeScreen = root.querySelector('#native-screen');
  const steps = preview ? previewWalkthrough : walkthrough;
  const workspaces = new Map();
  let state = preview ? previewState() : newState('coffee');
  if (!preview) workspaces.set('coffee', state);
  let playback = preview ? { index: 0, playing: false } : undefined;
  let previewVisible = !('IntersectionObserver' in window);
  let previewPaused = false;
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
        ? '<textarea class="caption-field" data-field="caption" aria-label="Edit caption" maxlength="1200" rows="2">' + escapeHTML(caption) + '</textarea>'
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
    const teammate = candidates.find(candidate => candidate.name === state.team.at(-1));
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
        (preview ? 'Caption preview' : state.campaign.captions[state.campaign.channels.indexOf(platform)]), asset, Boolean(state.captions)) :
        empty('channels', 'Select a channel', action('screen', 'Open channels', { value: 'channels' }))) +
      '</div></div>';
  }

  function team() {
    if (state.hireStep === 'job') {
      return heading('Post a job', brand()) + '<form class="app-stack job-form" data-submit="applicants">' +
        '<label class="app-field">Job title<input data-field="jobTitle" required maxlength="64" value="' + escapeHTML(state.jobTitle) + '"></label>' +
        '<div class="app-row">' + state.channels.map(platformName).map(label => '<span class="agent-chip">' + label + '</span>').join('') + '</div>' +
        '<div class="app-row"><button class="app-button app-primary" type="submit">See applicants</button>' +
        action('team-home', 'Back') + '</div></form>';
    }
    if (state.hireStep === 'applicants') {
      const candidate = candidates.find(person => person.name === state.candidate);
      return heading('Choose a teammate', brand()) + '<p class="job-context">' +
        escapeHTML(state.jobTitle) + '</p><div class="applicants">' +
        candidates.map(person => action('candidate',
          avatar(person) + '<strong>' + person.name + '</strong><span>' + person.specialty + '</span>',
          { value: person.name, pressed: person.name === candidate.name, kind: 'candidate' })).join('') +
        '</div><div class="app-row candidate-actions">' +
        action('hire', 'Hire ' + candidate.name, { glyph: 'check', kind: 'app-primary' }) +
        action('interview', 'Interview', { pressed: state.interview }) +
        action('post-job', 'Back') +
        '</div>' + (state.interview ? '<p class="interview-result">' + candidate.sample + '</p>' : '');
    }
    return heading('Team', action('post-job', 'Post a job', { glyph: 'plus', kind: 'app-primary' })) +
      (state.team.length
        ? '<div class="team-list">' + candidates.filter(person => state.team.includes(person.name)).map(person =>
          '<div class="app-list-row">' + avatar(person) + '<span><strong>' + person.name + '</strong><small>' +
          person.specialty + '</small></span></div>'
        ).join('') + '</div>' + action('screen', 'Brief teammate', { value: 'compose', glyph: 'right' })
        : empty('team', 'Build your team')) + '<div class="team-brand">' + brand() + '</div>';
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
          dateLabel.format(new Date(job.date)) + '</small>', {
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
    const published = jobs.filter(job => job.status === 'published').length;
    const totalByChannel = state.campaign.channels.map(key => {
      const count = jobs.filter(job => job.platform === key && job.status === 'published').length;
      return '<div class="report-channel">' + platformName(key) +
        '<div class="report-bar" aria-hidden="true"><i style="width:' + (published ? count / published * 100 : 0) + '%"></i></div><strong>' +
        count + '</strong></div>';
    }).join('');
    return heading('Reports', '<select aria-label="Filter channels" data-field="reportFilter">' +
      '<option value="">All channels</option>' +
      state.campaign.channels.map(key => '<option value="' + key + '"' + (state.reportFilter === key ? ' selected' : '') + '>' +
        platformNames[key] + '</option>').join('') + '</select>') +
      '<dl class="report-counts"><div><dt>Published</dt><dd data-count="published">' + published +
      '</dd></div><div><dt>Scheduled</dt><dd data-count="scheduled">' + (jobs.length - published) +
      '</dd></div><div><dt>Drafts</dt><dd>' + state.drafts.length + '</dd></div></dl>' +
      '<h3>Published by channel</h3><div class="report-channels">' + totalByChannel + '</div>';
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
    draw({ reveal: preview ? '.caption-field' : '.demo-feed' });
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
    attach: id => { state.asset = id; state.choosingMedia = false; draw({ reveal: preview ? '.caption-field' : '.demo-feed' }); },
    'remove-media': () => { state.asset = null; draw({ reveal: preview ? '.caption-field' : '.demo-feed' }); },
    'use-media': id => { state.asset = id; screen('compose'); },
    platform: key => {
      if (state.platform === key) return;
      state.platform = key;
      draw({ reveal: preview ? '.caption-field' : '.demo-feed' });
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
    applicants: () => { state.hireStep = 'applicants'; state.interview = false; draw({ reveal: '.applicants' }); },
    'team-home': () => { state.hireStep = ''; draw(); },
    candidate: name => { state.candidate = name; state.interview = false; draw(); },
    interview: () => { state.interview = !state.interview; draw({ reveal: '.interview-result' }); },
    hire: () => {
      if (!state.team.includes(state.candidate)) state.team.push(state.candidate);
      state.hireStep = '';
      state.notice = state.candidate + ' joined';
      draw();
    },
    week: offset => { state.week = offsetDay(state.week, Number(offset)); draw({ reveal: '.demo-week' }); },
    'open-job': id => {
      state.jobID = id;
      state.queueFilter = state.jobs.find(job => job.id === id).status;
      screen('queue');
    },
    'select-job': id => { state.jobID = id; draw({ reveal: preview ? '.caption-field' : '.demo-feed' }); },
    'queue-filter': filter => { state.queueFilter = filter; draw(); },
    publish: id => {
      state.jobs.find(job => job.id === id).status = 'published';
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
    const label = playback ? (playing ? 'Pause' : playback.done ? 'Replay demo' : 'Resume') : 'Play demo';
    playButton.querySelector('span').textContent = label;
    playButton.querySelector('use').setAttribute('href', playing ? '#icon-pause' : '#icon-play');
    stopButton.hidden = !playback;
    controls.querySelector('[data-action="reset"]').hidden = Boolean(playback);
    appWindow.inert = Boolean(playback);
    progress.hidden = !playback;
    progress.firstElementChild.style.transform = 'scaleX(' + (playback ? playback.index / steps.length : 0) + ')';
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
      run.playing = false;
      run.done = true;
      cue.textContent = 'Demo complete';
      pointer.hidden = true;
      showControls();
      return;
    }
    const [label, selector, { hold = 980, typing = false, restart = false } = {}] = next;
    const target = app.querySelector(selector);
    if (!target) {
      if (preview) {
        previewPaused = true;
        cue.textContent = 'Preview paused';
      }
      return pause();
    }
    cue.textContent = label;
    pointAt(target);
    const advance = () => {
      run.index = restart ? 0 : run.index + 1;
      if (preview && state.view === 'calendar') cue.textContent = state.notice;
      showControls();
      waitForStep(step, hold);
    };
    const activate = () => {
      if (restart) state = previewState();
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
    showControls();
    if (playback.pending) waitForStep(playback.pending, 95);
    else waitForStep(step, preview ? 550 : 0);
  }

  function syncPreview() {
    const shouldPlay = previewVisible && !previewPaused && !document.hidden && !reducedMotion.matches;
    if (shouldPlay && !playback.playing) resume();
    else if (!shouldPlay && playback.playing) pause();
    else showControls();
  }

  function play() {
    if (preview) {
      previewPaused = !previewPaused;
      return syncPreview();
    }
    if (playback?.playing) return pause();
    if (!playback || playback.done) {
      const previous = playback?.previous ?? state;
      state = newState(previous.campaignID, false);
      state.asset = null;
      state.theme = previous.theme;
      playback = { previous, index: 0, playing: false, done: false };
      draw();
    }
    resume();
  }

  function stop() {
    if (!playback) return;
    clearTimeout(playback.timer);
    state = playback.previous;
    playback = undefined;
    pointer.hidden = true;
    cue.textContent = 'Try it yourself';
    showControls();
    draw();
    playButton.focus({ preventScroll: true });
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
        previewVisible = entry.intersectionRatio >= .15;
        syncPreview();
      }, { threshold: .15 }).observe(root);
    }
    reducedMotion.addEventListener('change', syncPreview);
    document.addEventListener('visibilitychange', syncPreview);
    syncPreview();
  } else {
    controls.hidden = false;
    root.querySelector('.demo-under').hidden = false;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playback?.playing) pause();
    });
    document.querySelectorAll('[data-case]').forEach(link => {
      link.addEventListener('click', () => {
        stop();
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
