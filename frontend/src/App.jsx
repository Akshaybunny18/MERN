import { useEffect, useMemo, useState } from 'react';
import './index.css';
import Navbar from './components/Navbar.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/graphql';
const STORAGE_KEY = 'campuspulse-session';

const demoOrganizerAccount = {
  email: 'organizer@campus.dev',
  password: 'Organizer@123',
  name: 'Tech Council',
};

const fallbackClubs = [
  { id: 'club-ai', name: '0x1337: The Hacking Club', category: 'Club', description: 'Hack nights, systems, and security projects.' },
  { id: 'club-design', name: 'Decore-The Design Club', category: 'Club', description: 'Visual storytelling, UI systems, and posters.' },
  { id: 'club-sports', name: 'Sports Council', category: 'Council', description: 'Trials, leagues, and competitive sports.' },
  { id: 'club-arts', name: 'The Art Society', category: 'Club', description: 'Illustration, painting, and gallery showcases.' },
  { id: 'club-music', name: 'The Music Club', category: 'Club', description: 'Live sets, rehearsals, and music jams.' },
];

const fallbackEvents = [
  {
    id: 'EVT-1001',
    organizerId: 'club-ai',
    organizerName: '0x1337: The Hacking Club',
    name: 'Neural Nexus Workshop',
    description: 'Hands-on intro to agentic workflows, prompt design, and local inference patterns.',
    eventType: 'normal',
    status: 'published',
    eligibility: 'IIIT students only',
    registrationDeadline: '2026-07-17T18:00:00',
    startDate: '2026-07-20T10:00:00',
    endDate: '2026-07-20T13:00:00',
    registrationLimit: 120,
    registrationFee: 0,
    tags: ['ai', 'workshop', 'hands-on'],
    registrations: 84,
    sales: 0,
    revenue: 0,
    attendance: 68,
    teamCompletion: 22,
    stockQuantity: null,
    purchaseLimitPerParticipant: null,
    registrationFields: ['Team name', 'Participant count', 'Experience level'],
    sizeOptions: [],
    colorOptions: [],
    variants: [],
  },
  {
    id: 'EVT-2001',
    organizerId: 'club-design',
    organizerName: 'Decore-The Design Club',
    name: 'Merch Drop: Skyline Hoodie',
    description: 'Limited-run hoodies with size, color, and variant choices.',
    eventType: 'merchandise',
    status: 'published',
    eligibility: 'Participants only',
    registrationDeadline: '2026-07-18T12:00:00',
    startDate: '2026-07-23T11:00:00',
    endDate: '2026-07-23T19:00:00',
    registrationLimit: 50,
    registrationFee: 999,
    tags: ['merch', 'hoodie', 'drop'],
    registrations: 32,
    sales: 32,
    revenue: 31968,
    attendance: 0,
    teamCompletion: 0,
    stockQuantity: 18,
    purchaseLimitPerParticipant: 2,
    registrationFields: [],
    sizeOptions: ['S', 'M', 'L', 'XL'],
    colorOptions: ['Black', 'Sand', 'Bottle Green'],
    variants: ['Classic', 'Oversized'],
  },
  {
    id: 'EVT-3001',
    organizerId: 'club-sports',
    organizerName: 'Sports Council',
    name: 'Inter-Dept Football Trials',
    description: 'Trials for the semester league with team allocation on arrival.',
    eventType: 'normal',
    status: 'ongoing',
    eligibility: 'IIIT participants only',
    registrationDeadline: '2026-07-21T15:00:00',
    startDate: '2026-07-25T07:00:00',
    endDate: '2026-07-25T10:00:00',
    registrationLimit: 160,
    registrationFee: 50,
    tags: ['sports', 'trials', 'football'],
    registrations: 62,
    sales: 0,
    revenue: 0,
    attendance: 38,
    teamCompletion: 19,
    stockQuantity: null,
    purchaseLimitPerParticipant: null,
    registrationFields: ['Position', 'Team name'],
    sizeOptions: [],
    colorOptions: [],
    variants: [],
  },
];

const fallbackResetRequests = [
  {
    id: 'PR-001',
    organizerName: 'Tech Council',
    requestedByEmail: 'organizer@campus.dev',
    reason: 'Forgot administrator-issued password',
    status: 'pending',
  },
];

const initialParticipantHistory = [
  { ticketId: 'TKT-8A31KQ', eventName: 'Campus Clash', eventType: 'normal', organizer: 'Programming Club', status: 'registered', teamName: 'Byte Forge', happenedAt: '2026-07-01T10:00:00' },
  { ticketId: 'TKT-4M90VR', eventName: 'Skyline Hoodie', eventType: 'merchandise', organizer: 'Decore-The Design Club', status: 'completed', teamName: '-', happenedAt: '2026-06-25T11:30:00' },
  { ticketId: 'TKT-1Z72HL', eventName: 'Football Trials', eventType: 'normal', organizer: 'Sports Council', status: 'cancelled', teamName: '-', happenedAt: '2026-06-20T08:00:00' },
];

const defaultAuthForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  participantType: 'non_iiit',
  collegeOrgName: '',
  contactNumber: '',
  interests: [],
  followedClubs: [],
};

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  participantType: 'non_iiit',
  collegeOrgName: '',
  contactNumber: '',
  bio: '',
  interests: [],
  followedClubs: [],
};

const defaultEventDraft = {
  organizerId: 'club-ai',
  name: '',
  description: '',
  eventType: 'normal',
  status: 'draft',
  eligibility: '',
  registrationDeadline: '',
  startDate: '',
  endDate: '',
  registrationLimit: 50,
  registrationFee: 0,
  tags: '',
  registrationFields: '',
  sizeOptions: '',
  colorOptions: '',
  variants: '',
  stockQuantity: '',
  purchaseLimitPerParticipant: '',
};

const defaultClubDraft = {
  name: '',
  category: 'Club',
  description: '',
  contactEmail: '',
  contactNumber: '',
  loginEmail: '',
  discordWebhook: '',
};

function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

function normalize(value) {
  return (value || '').trim().toLowerCase();
}

function formatDateTime(value) {
  if (!value) return 'TBD';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function fuzzyMatch(query, text) {
  const needle = normalize(query);
  const haystack = normalize(text);
  if (!needle) return true;
  if (haystack.includes(needle)) return true;
  let pointer = 0;
  for (const character of haystack) {
    if (character === needle[pointer]) {
      pointer += 1;
      if (pointer === needle.length) return true;
    }
  }
  return false;
}

function ticketId(prefix = 'TKT') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function graphqlRequest(query, variables = {}, token) {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  }).then(async (response) => {
    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }
    return payload.data;
  });
}

function toList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function App() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('participant');
  const [authForm, setAuthForm] = useState(defaultAuthForm);
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [profile, setProfile] = useState(defaultProfile);
  const [profileDraft, setProfileDraft] = useState(defaultProfile);
  const [clubs, setClubs] = useState(fallbackClubs);
  const [events, setEvents] = useState(fallbackEvents);
  const [resetRequests, setResetRequests] = useState(fallbackResetRequests);
  const [participantHistory, setParticipantHistory] = useState(initialParticipantHistory);
  const [selectedEventId, setSelectedEventId] = useState(fallbackEvents[0].id);
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseType, setBrowseType] = useState('all');
  const [browseClub, setBrowseClub] = useState('all');
  const [eventDraft, setEventDraft] = useState(defaultEventDraft);
  const [clubDraft, setClubDraft] = useState(defaultClubDraft);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.session) setSession(parsed.session);
        if (parsed.profile) {
          setProfile(parsed.profile);
          setProfileDraft(parsed.profile);
        }
        if (parsed.history) setParticipantHistory(parsed.history);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ session, profile, history: participantHistory }),
    );
  }, [ready, session, profile, participantHistory]);

  useEffect(() => {
    let cancelled = false;
    graphqlRequest(
      `query Catalog {
        getClubs {
          id
          name
          category
          description
          contactEmail
          contactNumber
          active
        }
        getEvents {
          id
          organizerId
          organizerName
          name
          description
          eventType
          status
          eligibility
          registrationDeadline
          startDate
          endDate
          registrationLimit
          registrationFee
          tags
          registrations
          sales
          revenue
          attendance
          teamCompletion
          stockQuantity
          purchaseLimitPerParticipant
          registrationFields {
            label
            fieldType
            required
            options
          }
          sizeOptions
          colorOptions
          variants
        }
        passwordResetRequests {
          id
          organizerName
          requestedByEmail
          reason
          status
        }
      }`,
    )
      .then((data) => {
        if (cancelled || !data) return;
        if (data.getClubs?.length) setClubs(data.getClubs);
        if (data.getEvents?.length) setEvents(data.getEvents);
        if (data.passwordResetRequests?.length) setResetRequests(data.passwordResetRequests);
      })
      .catch(() => {
        // Keep the local fallback arrays.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.token || session?.role !== 'participant') return;

    let cancelled = false;
    graphqlRequest(
      `query Me {
        me {
          id
          firstName
          lastName
          name
          email
          participantType
          collegeOrgName
          contactNumber
          role
          interests
          followedClubs
          bio
        }
      }`,
      {},
      session.token,
    )
      .then((data) => {
        if (cancelled || !data?.me) return;
        const user = data.me;
        const nextProfile = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          participantType: user.participantType || 'non_iiit',
          collegeOrgName: user.collegeOrgName || '',
          contactNumber: user.contactNumber || '',
          bio: user.bio || '',
          interests: user.interests || [],
          followedClubs: user.followedClubs || [],
        };
        setProfile(nextProfile);
        setProfileDraft(nextProfile);
        setSession((current) => ({ ...current, user }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session?.token, session?.role]);

  const role = session?.role || null;

  const navItems = role === 'participant'
    ? [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'browse', label: 'Browse Events' },
        { key: 'clubs', label: 'Clubs / Organizers' },
        { key: 'profile', label: 'Profile' },
      ]
    : role === 'organizer'
      ? [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'create', label: 'Create Event' },
          { key: 'ongoing', label: 'Ongoing Events' },
          { key: 'profile', label: 'Profile' },
        ]
      : role === 'admin'
        ? [
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'manage-clubs', label: 'Manage Clubs / Organizers' },
            { key: 'password-resets', label: 'Password Reset Requests' },
            { key: 'profile', label: 'Profile' },
          ]
        : [];

  const combinedEvents = useMemo(() => [...events].sort((left, right) => new Date(right.startDate || 0) - new Date(left.startDate || 0)), [events]);

  const featuredEvents = useMemo(() => [...combinedEvents].sort((left, right) => (right.registrations || 0) - (left.registrations || 0)).slice(0, 5), [combinedEvents]);

  const filteredEvents = useMemo(() => combinedEvents.filter((event) => {
    const matchesQuery = fuzzyMatch(browseQuery, event.name) || fuzzyMatch(browseQuery, event.organizerName);
    const matchesType = browseType === 'all' || normalize(event.eventType) === browseType;
    const matchesClub = browseClub === 'all' || event.organizerId === browseClub;
    return matchesQuery && matchesType && matchesClub;
  }), [combinedEvents, browseQuery, browseType, browseClub]);

  const participantUpcoming = useMemo(() => participantHistory.filter((item) => item.status === 'registered' || item.status === 'purchased'), [participantHistory]);

  const stats = useMemo(() => {
    const totalRegistrations = participantHistory.length;
    const totalRevenue = combinedEvents.reduce((sum, event) => sum + (event.revenue || 0), 0);
    const ongoing = combinedEvents.filter((event) => normalize(event.status) === 'ongoing').length;
    return { totalRegistrations, totalRevenue, ongoing };
  }, [participantHistory, combinedEvents]);

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function handleLogout() {
    setSession(null);
    setProfile(defaultProfile);
    setProfileDraft(defaultProfile);
    setAuthForm(defaultAuthForm);
    setAuthMode('login');
    setAuthRole('participant');
    setPage('dashboard');
    setMessage('');
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      if (authRole === 'participant') {
        const email = normalize(authForm.email);
        const password = authForm.password;

        if (authMode === 'signup' && password !== authForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (authMode === 'signup') {
          await graphqlRequest(
            `mutation Register($input: RegisterInput!) {
              register(input: $input) {
                id
                firstName
                lastName
                name
                email
                participantType
                collegeOrgName
                contactNumber
                role
                interests
                followedClubs
                bio
              }
            }`,
            {
              input: {
                firstName: authForm.firstName.trim(),
                lastName: authForm.lastName.trim(),
                email,
                password,
                participantType: authForm.participantType,
                collegeOrgName: authForm.collegeOrgName.trim(),
                contactNumber: authForm.contactNumber.trim(),
                interests: authForm.interests,
                followedClubs: authForm.followedClubs,
                provider: 'local',
              },
            },
          );
        }

        const loginData = await graphqlRequest(
          `mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
            }
          }`,
          { input: { email, password } },
        );

        const token = loginData.login.token;
        const meData = await graphqlRequest(
          `query Me {
            me {
              id
              firstName
              lastName
              name
              email
              participantType
              collegeOrgName
              contactNumber
              role
              interests
              followedClubs
              bio
            }
          }`,
          {},
          token,
        );

        const user = meData.me;
        const participantProfile = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          participantType: user.participantType || 'non_iiit',
          collegeOrgName: user.collegeOrgName || '',
          contactNumber: user.contactNumber || '',
          bio: user.bio || '',
          interests: user.interests || [],
          followedClubs: user.followedClubs || [],
        };

        setSession({ token, role: 'participant', user });
        setProfile(participantProfile);
        setProfileDraft(participantProfile);
        setMessage('Participant session active.');
        setPage('dashboard');
      } else {
        const email = normalize(authForm.email);
        if (email !== demoOrganizerAccount.email || authForm.password !== demoOrganizerAccount.password) {
          throw new Error('Invalid organizer credentials');
        }
        const organizerUser = {
          id: 'organizer-demo',
          email,
          name: demoOrganizerAccount.name,
          role: 'organizer',
        };
        setSession({ role: 'organizer', user: organizerUser });
        setMessage('Organizer session active.');
        setPage('dashboard');
      }
    } catch (error) {
      setMessage(error.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  function toggleInList(list, value) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function handleRegisterEvent(eventItem) {
    const ticket = ticketId(eventItem.eventType === 'merchandise' ? 'MRCH' : 'NORM');
    const record = {
      ticketId: ticket,
      eventName: eventItem.name,
      eventType: eventItem.eventType,
      organizer: eventItem.organizerName,
      status: eventItem.eventType === 'merchandise' ? 'purchased' : 'registered',
      teamName: eventItem.eventType === 'normal' && eventItem.tags?.includes('competition') ? 'Campus Crew' : '-',
      happenedAt: new Date().toISOString(),
    };

    setParticipantHistory((current) => [record, ...current]);
    setEvents((current) => current.map((candidate) => {
      if (candidate.id !== eventItem.id) return candidate;
      if (eventItem.eventType === 'merchandise') {
        return {
          ...candidate,
          registrations: (candidate.registrations || 0) + 1,
          sales: (candidate.sales || 0) + 1,
          revenue: (candidate.revenue || 0) + (candidate.registrationFee || 0),
          stockQuantity: Math.max(0, (candidate.stockQuantity || 0) - 1),
        };
      }
      return {
        ...candidate,
        registrations: (candidate.registrations || 0) + 1,
      };
    }));
    setMessage(`Ticket ${ticket} generated and saved to your history.`);
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    const nextProfile = { ...profileDraft };
    setProfile(nextProfile);

    if (session?.role === 'participant' && session?.token) {
      graphqlRequest(
        `mutation UpdateProfile($input: ProfileUpdateInput!) {
          updateProfile(input: $input) {
            id
          }
        }`,
        {
          input: {
            firstName: nextProfile.firstName,
            lastName: nextProfile.lastName,
            contactNumber: nextProfile.contactNumber,
            collegeOrgName: nextProfile.collegeOrgName,
            bio: nextProfile.bio,
            interests: nextProfile.interests,
            followedClubs: nextProfile.followedClubs,
          },
        },
        session.token,
      ).catch(() => {});
    }

    setMessage('Profile saved.');
  }

  function handleCreateEvent(event) {
    event.preventDefault();
    const createdEvent = {
      id: `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      organizerId: eventDraft.organizerId,
      organizerName: clubs.find((club) => club.id === eventDraft.organizerId)?.name || 'Organizer',
      name: eventDraft.name,
      description: eventDraft.description,
      eventType: eventDraft.eventType,
      status: eventDraft.status,
      eligibility: eventDraft.eligibility,
      registrationDeadline: eventDraft.registrationDeadline,
      startDate: eventDraft.startDate,
      endDate: eventDraft.endDate,
      registrationLimit: Number(eventDraft.registrationLimit || 0),
      registrationFee: Number(eventDraft.registrationFee || 0),
      tags: toList(eventDraft.tags),
      registrations: 0,
      sales: 0,
      revenue: 0,
      attendance: 0,
      teamCompletion: 0,
      stockQuantity: eventDraft.eventType === 'merchandise' ? Number(eventDraft.stockQuantity || 0) : null,
      purchaseLimitPerParticipant: eventDraft.eventType === 'merchandise' ? Number(eventDraft.purchaseLimitPerParticipant || 0) : null,
      registrationFields: toList(eventDraft.registrationFields),
      sizeOptions: toList(eventDraft.sizeOptions),
      colorOptions: toList(eventDraft.colorOptions),
      variants: toList(eventDraft.variants),
    };

    setEvents((current) => [createdEvent, ...current]);
    setSelectedEventId(createdEvent.id);
    setMessage('Event card created locally and added to the dashboard.');
    setEventDraft(defaultEventDraft);
  }

  function handleSaveClub(event) {
    event.preventDefault();
    const createdClub = {
      id: `club-${Math.random().toString(36).slice(2, 8)}`,
      name: clubDraft.name,
      category: clubDraft.category,
      description: clubDraft.description,
      contactEmail: clubDraft.contactEmail,
      contactNumber: clubDraft.contactNumber,
      loginEmail: clubDraft.loginEmail,
      active: true,
    };

    setClubs((current) => [createdClub, ...current]);
    setClubDraft(defaultClubDraft);
    setMessage('Club / organizer card created locally.');
  }

  function handleDisableClub(clubId) {
    setClubs((current) => current.map((club) => (club.id === clubId ? { ...club, active: false } : club)));
    setMessage('Club / organizer disabled.');
  }

  function handleResolveReset(requestId) {
    setResetRequests((current) => current.map((request) => (request.id === requestId ? { ...request, status: 'resolved' } : request)));
    setMessage('Password reset request resolved.');
  }

  function handleFollowClub(clubId) {
    if (role !== 'participant') return;
    const nextFollowed = toggleInList(profile.followedClubs, clubId);
    const nextProfile = { ...profile, followedClubs: nextFollowed };
    setProfile(nextProfile);
    setProfileDraft(nextProfile);
    setMessage(nextFollowed.includes(clubId) ? 'Club followed.' : 'Club unfollowed.');
  }

  if (!ready) {
    return <div className="min-h-screen grid place-items-center text-slate-300">Loading CampusPulse…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen px-4 py-8 text-slate-100">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-glow backdrop-blur-xl sm:p-8">
            <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              CampusPulse
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              A card-first campus event portal for participants, organizers, and server-rooted admins.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Use IIIT email validation, participant onboarding, organizer dashboards, event cards, clubs, tickets, and root-only admin provisioning from the backend.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Participant auth', 'bcrypt + JWT + domain validation'],
                ['Organizer tools', 'Create event cards and manage status'],
                ['Admin root', 'Server-provisioned only, no admin login screen'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-sm text-slate-300">{copy}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className={cn('rounded-full px-4 py-2 text-sm font-semibold', authRole === 'participant' ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-white')} onClick={() => setAuthRole('participant')}>
                Participant
              </button>
              <button type="button" className={cn('rounded-full px-4 py-2 text-sm font-semibold', authRole === 'organizer' ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-white')} onClick={() => setAuthRole('organizer')}>
                Organizer
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Root admin is created by the server at startup. There is no admin self-registration or admin login form.
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleAuthSubmit}>
              {authRole === 'participant' && authMode === 'signup' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name">
                      <input className={inputClass} value={authForm.firstName} onChange={(e) => updateAuthField('firstName', e.target.value)} required />
                    </Field>
                    <Field label="Last name">
                      <input className={inputClass} value={authForm.lastName} onChange={(e) => updateAuthField('lastName', e.target.value)} required />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Participant type">
                      <select className={inputClass} value={authForm.participantType} onChange={(e) => updateAuthField('participantType', e.target.value)}>
                        <option value="iiit">IIIT student</option>
                        <option value="non_iiit">Non-IIIT participant</option>
                      </select>
                    </Field>
                    <Field label="College / org name">
                      <input className={inputClass} value={authForm.collegeOrgName} onChange={(e) => updateAuthField('collegeOrgName', e.target.value)} required />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Contact number">
                      <input className={inputClass} value={authForm.contactNumber} onChange={(e) => updateAuthField('contactNumber', e.target.value)} required />
                    </Field>
                    <Field label="Email">
                      <input className={inputClass} type="email" value={authForm.email} onChange={(e) => updateAuthField('email', e.target.value)} required />
                    </Field>
                  </div>
                  <Field label="Password">
                    <input className={inputClass} type="password" value={authForm.password} onChange={(e) => updateAuthField('password', e.target.value)} required />
                  </Field>
                  <Field label="Confirm password">
                    <input className={inputClass} type="password" value={authForm.confirmPassword} onChange={(e) => updateAuthField('confirmPassword', e.target.value)} required />
                  </Field>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-300">Interests</div>
                    <div className="flex flex-wrap gap-2">
                      {['AI/ML', 'Hackathons', 'Cultural', 'Sports', 'Coding', 'Design'].map((interest) => (
                        <button key={interest} type="button" className={chipClass(authForm.interests.includes(interest))} onClick={() => setAuthForm((current) => ({ ...current, interests: toggleInList(current.interests, interest) }))}>
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-300">Follow clubs now</div>
                    <div className="flex flex-wrap gap-2">
                      {clubs.slice(0, 8).map((club) => (
                        <button key={club.id} type="button" className={chipClass(authForm.followedClubs.includes(club.id))} onClick={() => setAuthForm((current) => ({ ...current, followedClubs: toggleInList(current.followedClubs, club.id) }))}>
                          {club.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {authRole === 'participant' && authMode === 'login' && (
                <>
                  <Field label="Email">
                    <input className={inputClass} type="email" value={authForm.email} onChange={(e) => updateAuthField('email', e.target.value)} required />
                  </Field>
                  <Field label="Password">
                    <input className={inputClass} type="password" value={authForm.password} onChange={(e) => updateAuthField('password', e.target.value)} required />
                  </Field>
                </>
              )}

              {authRole === 'organizer' && (
                <>
                  <Field label="Provisioned email">
                    <input className={inputClass} type="email" placeholder={demoOrganizerAccount.email} value={authForm.email} onChange={(e) => updateAuthField('email', e.target.value)} required />
                  </Field>
                  <Field label="Provisioned password">
                    <input className={inputClass} type="password" placeholder="Admin shared password" value={authForm.password} onChange={(e) => updateAuthField('password', e.target.value)} required />
                  </Field>
                </>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300" disabled={busy}>
                  {busy ? 'Working…' : authRole === 'participant' && authMode === 'signup' ? 'Create participant account' : 'Enter workspace'}
                </button>
                {authRole === 'participant' && (
                  <button type="button" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" onClick={() => setAuthMode((current) => (current === 'login' ? 'signup' : 'login'))}>
                    {authMode === 'login' ? 'Need an account?' : 'Already signed up?'}
                  </button>
                )}
              </div>
            </form>

            {message && <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{message}</div>}
          </section>

          <aside className="grid gap-4">
            <InfoCard title="IIIT email rule" copy="IIIT participants must use an email ending in iiit.ac.in. The backend rejects invalid addresses and duplicate signups with a login hint." />
            <InfoCard title="Tailwind CSS" copy="This UI is now styled with Tailwind CDN utilities instead of the previous custom stylesheet approach." />
            <InfoCard title="Seeded clubs" copy="The backend now seeds the IIIT club / student body list into the clubs collection and exposes it through GraphQL." />
          </aside>
        </div>
      </div>
    );
  }

  const activeEvent = combinedEvents.find((event) => event.id === selectedEventId) || combinedEvents[0];
  const participantStats = [
    { label: 'Registered', value: participantHistory.length.toString() },
    { label: 'Upcoming', value: participantUpcoming.length.toString() },
    { label: 'Followed clubs', value: profile.followedClubs.length.toString() },
    { label: 'Ongoing', value: stats.ongoing.toString() },
  ];

  return (
    <div className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Navbar
          title={role === 'participant' ? 'Participant dashboard' : role === 'organizer' ? 'Organizer dashboard' : 'Admin dashboard'}
          subtitle="Cards for dashboards, event creation, organizer management, and password resets."
          navItems={navItems}
          activePage={page}
          onNavigate={setPage}
          onLogout={handleLogout}
        />

        {message && <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{message}</div>}

        {page === 'dashboard' && role === 'participant' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Role based and session aware</div>
                  <h3 className="mt-2 text-4xl font-bold tracking-tight text-white">Everything a campus event portal needs in one card stack.</h3>
                  <p className="mt-3 max-w-2xl text-slate-300">Browse events, follow clubs, keep tickets, and edit profile preferences. The IIIT club list and organizer cards are loaded from the backend collections.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" className={buttonClass(true)} onClick={() => setPage('browse')}>Browse events</button>
                    <button type="button" className={buttonClass(false)} onClick={() => setPage('profile')}>Edit profile</button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {participantStats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
                </div>
              </div>
            </section>

            <CardGrid title="Upcoming events" subtitle="Quick cards with ticket IDs and status">
              {participantUpcoming.slice(0, 4).map((record) => (
                <TicketCard key={record.ticketId} record={record} />
              ))}
              {!participantUpcoming.length && <EmptyState message="No upcoming events yet. Register from Browse Events." />}
            </CardGrid>

            <CardGrid title="Participation history" subtitle="Normal, merchandise, completed, cancelled">
              {participantHistory.map((record) => (
                <HistoryRow key={record.ticketId} record={record} />
              ))}
            </CardGrid>

            <CardGrid title="Trending / 24h" subtitle="Top 5 events by registrations">
              {featuredEvents.slice(0, 5).map((event, index) => (
                <TrendRow key={event.id} event={event} index={index} onClick={() => setSelectedEventId(event.id)} />
              ))}
            </CardGrid>
          </main>
        )}

        {page === 'browse' && role === 'participant' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Search">
                  <input className={inputClass} value={browseQuery} onChange={(e) => setBrowseQuery(e.target.value)} placeholder="Event or organizer" />
                </Field>
                <Field label="Event type">
                  <select className={inputClass} value={browseType} onChange={(e) => setBrowseType(e.target.value)}>
                    <option value="all">All</option>
                    <option value="normal">Normal</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                </Field>
                <Field label="Followed clubs">
                  <select className={inputClass} value={browseClub} onChange={(e) => setBrowseClub(e.target.value)}>
                    <option value="all">All clubs</option>
                    {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            <CardGrid title={`Results (${filteredEvents.length})`} subtitle="Search, filters, and event cards">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} active={event.id === activeEvent?.id} onSelect={() => setSelectedEventId(event.id)} onRegister={() => handleRegisterEvent(event)} />
              ))}
            </CardGrid>

            <section className="xl:col-span-5 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Event details" title={activeEvent?.name || 'Select an event'} subtitle="Validation, limits, and ticket generation" />
              {activeEvent && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">{activeEvent.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Type', activeEvent.eventType],
                      ['Status', activeEvent.status],
                      ['Deadline', formatDateTime(activeEvent.registrationDeadline)],
                      ['Start', formatDateTime(activeEvent.startDate)],
                      ['End', formatDateTime(activeEvent.endDate)],
                      ['Fee', formatCurrency(activeEvent.registrationFee)],
                    ].map(([label, value]) => (
                      <MiniStat key={label} label={label} value={value} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeEvent.tags?.map((tag) => <Pill key={tag}>#{tag}</Pill>)}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    {activeEvent.eventType === 'normal' ? (
                      <div>
                        <div className="mb-2 font-semibold text-white">Custom registration form</div>
                        <ul className="list-disc space-y-1 pl-5">{(activeEvent.registrationFields || []).map((field) => <li key={field}>{field}</li>)}</ul>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-semibold text-white">Merchandise configuration</div>
                        <div>Sizes: {(activeEvent.sizeOptions || []).join(', ')}</div>
                        <div>Colours: {(activeEvent.colorOptions || []).join(', ')}</div>
                        <div>Variants: {(activeEvent.variants || []).join(', ')}</div>
                      </div>
                    )}
                  </div>
                  <button type="button" className={buttonClass(true)} onClick={() => handleRegisterEvent(activeEvent)}>
                    {activeEvent.eventType === 'merchandise' ? 'Purchase ticket' : 'Register now'}
                  </button>
                </div>
              )}
            </section>

            <section className="xl:col-span-7 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Clubs / organizers" title="Approved IIIT clubs and student bodies" subtitle="Follow / unfollow cards backed by the clubs collection" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {clubs.map((club) => (
                  <button key={club.id} type="button" onClick={() => handleFollowClub(club.id)} className={cn('rounded-2xl border p-4 text-left transition hover:-translate-y-0.5', profile.followedClubs.includes(club.id) ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-white/5')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-amber-200">{club.category}</div>
                        <div className="mt-1 font-semibold text-white">{club.name}</div>
                      </div>
                      <Pill>{club.active ? 'active' : 'disabled'}</Pill>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{club.description}</p>
                    <div className="mt-4 text-xs text-cyan-100">{profile.followedClubs.includes(club.id) ? 'Following' : 'Tap to follow'}</div>
                  </button>
                ))}
              </div>
            </section>
          </main>
        )}

        {page === 'clubs' && role === 'participant' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <CardGrid title="Clubs / organizers" subtitle="The IIIT list in card form">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} followed={profile.followedClubs.includes(club.id)} onToggle={() => handleFollowClub(club.id)} />
              ))}
            </CardGrid>
            <CardGrid title="Followed clubs" subtitle="Used by recommendations and ordering">
              {profile.followedClubs.length ? profile.followedClubs.map((clubId) => {
                const club = clubs.find((item) => item.id === clubId);
                return club ? <SimpleRow key={clubId} title={club.name} subtitle={club.category} /> : null;
              }) : <EmptyState message="No followed clubs yet." />}
            </CardGrid>
          </main>
        )}

        {page === 'profile' && role === 'participant' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Profile" title="Editable participant details" subtitle="First name, last name, contact, organization, interests, followed clubs" />
              <form className="grid gap-4" onSubmit={handleSaveProfile}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name"><input className={inputClass} value={profileDraft.firstName} onChange={(e) => setProfileDraft((current) => ({ ...current, firstName: e.target.value }))} /></Field>
                  <Field label="Last name"><input className={inputClass} value={profileDraft.lastName} onChange={(e) => setProfileDraft((current) => ({ ...current, lastName: e.target.value }))} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact number"><input className={inputClass} value={profileDraft.contactNumber} onChange={(e) => setProfileDraft((current) => ({ ...current, contactNumber: e.target.value }))} /></Field>
                  <Field label="College / organization"><input className={inputClass} value={profileDraft.collegeOrgName} onChange={(e) => setProfileDraft((current) => ({ ...current, collegeOrgName: e.target.value }))} /></Field>
                </div>
                <Field label="Bio"><textarea className={cn(inputClass, 'min-h-28')} value={profileDraft.bio} onChange={(e) => setProfileDraft((current) => ({ ...current, bio: e.target.value }))} /></Field>
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-300">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {['AI/ML', 'Hackathons', 'Cultural', 'Sports', 'Coding', 'Design'].map((interest) => (
                      <button key={interest} type="button" className={chipClass(profileDraft.interests.includes(interest))} onClick={() => setProfileDraft((current) => ({ ...current, interests: toggleInList(current.interests, interest) }))}>
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className={buttonClass(true)}>Save profile</button>
              </form>
            </section>

            <section className="xl:col-span-4 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Security" title="Password reset / change" subtitle="Password change flow is scaffolded in the UI" />
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Email: <span className="text-white">{profile.email || session?.user?.email}</span></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Participant type: <span className="text-white">{profile.participantType === 'iiit' ? 'IIIT student' : 'Non-IIIT participant'}</span></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Root admin: <span className="text-white">server provisioned only</span></div>
              </div>
            </section>
          </main>
        )}

        {page === 'create' && role === 'organizer' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-7 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Create event" title="Create (Draft) → Publish" subtitle="Create cards for normal or merchandise events" />
              <form className="grid gap-4" onSubmit={handleCreateEvent}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Organizer card">
                    <select className={inputClass} value={eventDraft.organizerId} onChange={(e) => setEventDraft((current) => ({ ...current, organizerId: e.target.value }))}>
                      {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className={inputClass} value={eventDraft.status} onChange={(e) => setEventDraft((current) => ({ ...current, status: e.target.value }))}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="closed">Closed</option>
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Event name"><input className={inputClass} value={eventDraft.name} onChange={(e) => setEventDraft((current) => ({ ...current, name: e.target.value }))} /></Field>
                  <Field label="Event type">
                    <select className={inputClass} value={eventDraft.eventType} onChange={(e) => setEventDraft((current) => ({ ...current, eventType: e.target.value }))}>
                      <option value="normal">Normal</option>
                      <option value="merchandise">Merchandise</option>
                    </select>
                  </Field>
                </div>
                <Field label="Description"><textarea className={cn(inputClass, 'min-h-28')} value={eventDraft.description} onChange={(e) => setEventDraft((current) => ({ ...current, description: e.target.value }))} /></Field>
                <Field label="Eligibility"><input className={inputClass} value={eventDraft.eligibility} onChange={(e) => setEventDraft((current) => ({ ...current, eligibility: e.target.value }))} /></Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Registration deadline"><input className={inputClass} type="datetime-local" value={eventDraft.registrationDeadline} onChange={(e) => setEventDraft((current) => ({ ...current, registrationDeadline: e.target.value }))} /></Field>
                  <Field label="Start date"><input className={inputClass} type="datetime-local" value={eventDraft.startDate} onChange={(e) => setEventDraft((current) => ({ ...current, startDate: e.target.value }))} /></Field>
                  <Field label="End date"><input className={inputClass} type="datetime-local" value={eventDraft.endDate} onChange={(e) => setEventDraft((current) => ({ ...current, endDate: e.target.value }))} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Registration limit"><input className={inputClass} type="number" value={eventDraft.registrationLimit} onChange={(e) => setEventDraft((current) => ({ ...current, registrationLimit: e.target.value }))} /></Field>
                  <Field label="Registration fee"><input className={inputClass} type="number" value={eventDraft.registrationFee} onChange={(e) => setEventDraft((current) => ({ ...current, registrationFee: e.target.value }))} /></Field>
                  <Field label="Tags"><input className={inputClass} placeholder="ai, workshop, hands-on" value={eventDraft.tags} onChange={(e) => setEventDraft((current) => ({ ...current, tags: e.target.value }))} /></Field>
                </div>
                {eventDraft.eventType === 'merchandise' && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Stock quantity"><input className={inputClass} type="number" value={eventDraft.stockQuantity} onChange={(e) => setEventDraft((current) => ({ ...current, stockQuantity: e.target.value }))} /></Field>
                    <Field label="Purchase limit / participant"><input className={inputClass} type="number" value={eventDraft.purchaseLimitPerParticipant} onChange={(e) => setEventDraft((current) => ({ ...current, purchaseLimitPerParticipant: e.target.value }))} /></Field>
                    <Field label="Sizes"><input className={inputClass} placeholder="S, M, L" value={eventDraft.sizeOptions} onChange={(e) => setEventDraft((current) => ({ ...current, sizeOptions: e.target.value }))} /></Field>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Custom form fields"><input className={inputClass} placeholder="Team name, Experience level" value={eventDraft.registrationFields} onChange={(e) => setEventDraft((current) => ({ ...current, registrationFields: e.target.value }))} /></Field>
                  <Field label="Colours / variants"><input className={inputClass} placeholder="Black, Sand | Classic, Oversized" value={eventDraft.colorOptions + (eventDraft.variants ? ` | ${eventDraft.variants}` : '')} onChange={(e) => {
                    const [colors = '', variants = ''] = e.target.value.split('|');
                    setEventDraft((current) => ({ ...current, colorOptions: colors.trim(), variants: variants.trim() }));
                  }} /></Field>
                </div>
                <button type="submit" className={buttonClass(true)}>Create event card</button>
              </form>
            </section>

            <CardGrid title="Event carousel" subtitle="Your event cards with status and quick actions">
              {combinedEvents.slice(0, 6).map((event) => (
                <OrganizerEventCard key={event.id} event={event} onPublish={() => setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'published' } : item)))} onClose={() => setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'closed' } : item)))} />
              ))}
            </CardGrid>

            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Analytics" title="Registrations / sales / revenue / attendance" subtitle="Completed events only" />
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ['Registrations', combinedEvents.reduce((sum, event) => sum + (event.registrations || 0), 0)],
                  ['Sales', combinedEvents.reduce((sum, event) => sum + (event.sales || 0), 0)],
                  ['Revenue', formatCurrency(combinedEvents.reduce((sum, event) => sum + (event.revenue || 0), 0))],
                  ['Attendance', combinedEvents.reduce((sum, event) => sum + (event.attendance || 0), 0)],
                ].map(([label, value]) => <StatCard key={label} label={label} value={String(value)} />)}
              </div>
            </section>

            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Profile" title="Organizer profile page" subtitle="Name, category, description, contact, Discord webhook" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {['name', 'category', 'description', 'contactEmail', 'contactNumber', 'loginEmail', 'discordWebhook'].map((field) => (
                  <Field key={field} label={field}>
                    <input className={inputClass} value={profileDraft[field] || ''} onChange={(e) => setProfileDraft((current) => ({ ...current, [field]: e.target.value }))} />
                  </Field>
                ))}
              </div>
              <button type="button" className={buttonClass(false)} onClick={() => setMessage('Organizer profile saved locally. Discord webhook card is ready.')}>Save organizer profile</button>
            </section>
          </main>
        )}

        {page === 'ongoing' && role === 'organizer' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <CardGrid title="Ongoing events" subtitle="Cards for Draft / Published / Ongoing / Closed">
              {combinedEvents.map((event) => (
                <OrganizerEventCard key={event.id} event={event} onPublish={() => setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'published' } : item)))} onClose={() => setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'closed' } : item)))} />
              ))}
            </CardGrid>
          </main>
        )}

        {page === 'manage-clubs' && role === 'admin' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-7 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Admin" title="Add new club / organizer" subtitle="System auto-generates login email and password in the backend" />
              <form className="grid gap-4" onSubmit={handleSaveClub}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name"><input className={inputClass} value={clubDraft.name} onChange={(e) => setClubDraft((current) => ({ ...current, name: e.target.value }))} /></Field>
                  <Field label="Category"><input className={inputClass} value={clubDraft.category} onChange={(e) => setClubDraft((current) => ({ ...current, category: e.target.value }))} /></Field>
                </div>
                <Field label="Description"><textarea className={cn(inputClass, 'min-h-28')} value={clubDraft.description} onChange={(e) => setClubDraft((current) => ({ ...current, description: e.target.value }))} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact email"><input className={inputClass} value={clubDraft.contactEmail} onChange={(e) => setClubDraft((current) => ({ ...current, contactEmail: e.target.value }))} /></Field>
                  <Field label="Contact number"><input className={inputClass} value={clubDraft.contactNumber} onChange={(e) => setClubDraft((current) => ({ ...current, contactNumber: e.target.value }))} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Login email"><input className={inputClass} value={clubDraft.loginEmail} onChange={(e) => setClubDraft((current) => ({ ...current, loginEmail: e.target.value }))} /></Field>
                  <Field label="Discord webhook"><input className={inputClass} value={clubDraft.discordWebhook} onChange={(e) => setClubDraft((current) => ({ ...current, discordWebhook: e.target.value }))} /></Field>
                </div>
                <button type="submit" className={buttonClass(true)}>Create club / organizer</button>
              </form>
            </section>

            <CardGrid title="Club / organizer list" subtitle="Disable or archive accounts">
              {clubs.map((club) => (
                <div key={club.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-amber-200">{club.category}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{club.name}</div>
                    </div>
                    <Pill>{club.active ? 'active' : 'disabled'}</Pill>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{club.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" className={buttonClass(false)} onClick={() => handleDisableClub(club.id)}>Disable</button>
                  </div>
                </div>
              ))}
            </CardGrid>
          </main>
        )}

        {page === 'password-resets' && role === 'admin' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <CardGrid title="Password reset requests" subtitle="Requested by organizers and resolved by admin">
              {resetRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{request.organizerName}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{request.requestedByEmail}</div>
                    </div>
                    <Pill>{request.status}</Pill>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{request.reason}</p>
                  <button type="button" className={buttonClass(false)} onClick={() => handleResolveReset(request.id)}>Resolve</button>
                </div>
              ))}
            </CardGrid>
          </main>
        )}

        {page === 'profile' && role === 'organizer' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Organizer profile" title="Editable organizer settings" subtitle="Name, category, description, contact email / number, Discord webhook" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {['name', 'category', 'description', 'contactEmail', 'contactNumber', 'loginEmail', 'discordWebhook'].map((field) => (
                  <Field key={field} label={field}>
                    <input className={inputClass} value={profileDraft[field] || ''} onChange={(e) => setProfileDraft((current) => ({ ...current, [field]: e.target.value }))} />
                  </Field>
                ))}
              </div>
              <button type="button" className={buttonClass(false)} onClick={() => setMessage('Organizer profile saved locally.')}>Save profile</button>
            </section>
          </main>
        )}

        {page === 'profile' && role === 'admin' && (
          <main className="grid gap-5 xl:grid-cols-12">
            <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
              <SectionTitle eyebrow="Root admin" title="Server-provisioned account" subtitle="No admin login screen. The backend creates this user on startup." />
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Admin access is true root-only. Use the backend-provisioned account and management mutations.
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-300">
      <div className="mb-2">{label}</div>
      {children}
    </label>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{eyebrow}</div>
      <h3 className="mt-2 text-2xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
    </div>
  );
}

function CardGrid({ title, subtitle, children }) {
  return (
    <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <SectionTitle eyebrow="Cards" title={title} subtitle={subtitle} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300">{message}</div>;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Pill({ children }) {
  return <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">{children}</span>;
}

function buttonClass(primary) {
  return cn('rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5', primary ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10');
}

function navButtonClass(active) {
  return cn('rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5', active ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10');
}

function inputClass() {
  return 'w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20';
}

function chipClass(active) {
  return cn('rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5', active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10');
}

function InfoCard({ title, copy }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
    </div>
  );
}

function EventCard({ event, active, onSelect, onRegister }) {
  return (
    <button type="button" onClick={onSelect} className={cn('rounded-2xl border p-4 text-left transition hover:-translate-y-0.5', active ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-white/5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200">{event.eventType}</div>
          <div className="mt-1 text-lg font-semibold text-white">{event.name}</div>
          <div className="mt-1 text-sm text-slate-300">{event.organizerName}</div>
        </div>
        <Pill>{event.status}</Pill>
      </div>
      <p className="mt-3 text-sm text-slate-300">{event.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <MiniStat label="Limit" value={String(event.registrationLimit || 0)} />
        <MiniStat label="Fee" value={formatCurrency(event.registrationFee)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(event.tags || []).slice(0, 3).map((tag) => <Pill key={tag}>#{tag}</Pill>)}
      </div>
      <div className="mt-4">
        <span className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={onRegister}>Register / Buy ticket</button>
        </span>
      </div>
    </button>
  );
}

function OrganizerEventCard({ event, onPublish, onClose }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200">{event.eventType}</div>
          <div className="mt-1 text-lg font-semibold text-white">{event.name}</div>
          <div className="mt-1 text-sm text-slate-300">{event.organizerName}</div>
        </div>
        <Pill>{event.status}</Pill>
      </div>
      <p className="mt-3 text-sm text-slate-300">{event.description}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" className={buttonClass(false)} onClick={onPublish}>Publish</button>
        <button type="button" className={buttonClass(false)} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function ClubCard({ club, followed, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={cn('rounded-2xl border p-4 text-left transition hover:-translate-y-0.5', followed ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-white/5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200">{club.category}</div>
          <div className="mt-1 text-lg font-semibold text-white">{club.name}</div>
        </div>
        <Pill>{club.active ? 'active' : 'disabled'}</Pill>
      </div>
      <p className="mt-3 text-sm text-slate-300">{club.description}</p>
      <div className="mt-4 text-xs text-cyan-100">{followed ? 'Following' : 'Follow / unfollow'}</div>
    </button>
  );
}

function SimpleRow({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
    </div>
  );
}

function TicketCard({ record }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200">{record.eventType}</div>
          <div className="mt-1 text-lg font-semibold text-white">{record.eventName}</div>
          <div className="mt-1 text-sm text-slate-300">{record.organizer}</div>
        </div>
        <Pill>{record.status}</Pill>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>Ticket {record.ticketId}</span>
        <span>{record.teamName}</span>
      </div>
    </div>
  );
}

function HistoryRow({ record }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-white">{record.eventName}</div>
          <div className="mt-1 text-sm text-slate-300">{record.organizer}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-200">{record.ticketId}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{record.status}</div>
        </div>
      </div>
    </div>
  );
}

function TrendRow({ event, index, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200">#{index + 1}</div>
          <div className="mt-1 font-semibold text-white">{event.name}</div>
          <div className="mt-1 text-sm text-slate-300">{event.organizerName}</div>
        </div>
        <div className="text-sm font-semibold text-cyan-100">{event.registrations || 0} regs</div>
      </div>
    </button>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoCard({ title, copy }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
    </div>
  );
}

function CardGrid({ title, subtitle, children }) {
  return (
    <section className="xl:col-span-12 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <SectionTitle eyebrow="Cards" title={title} subtitle={subtitle} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{eyebrow}</div>
      <h3 className="mt-2 text-2xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
    </div>
  );
}

function Pill({ children }) {
  return <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">{children}</span>;
}

const inputClass = 'w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20';

function buttonClass(primary) {
  return cn('rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5', primary ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10');
}

function chipClass(active) {
  return cn('rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5', active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10');
}

function navButtonClass(active) {
  return cn('rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5', active ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10');
}

export default App;