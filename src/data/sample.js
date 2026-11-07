// Sample data so the pages can be looked at before the shared database is connected (step 2).
// Everything here gets replaced by live data from Supabase.

export const PHASES = [
  { id: 'idea', name: 'Idea', color: 'var(--ph-idea)' },
  { id: 'script', name: 'Script', color: 'var(--ph-script)' },
  { id: 'storyboard', name: 'Storyboard', color: 'var(--ph-storyboard)' },
  { id: 'video', name: 'Video', color: 'var(--ph-video)' },
  { id: 'audio', name: 'Audio', color: 'var(--ph-audio)' },
  { id: 'edit', name: 'Edit', color: 'var(--ph-edit)' },
  { id: 'submit', name: 'Submit', color: 'var(--ph-submit)' },
]

export const competition = {
  name: 'AI Short Film Competition 2027',
  deadline: '2027-03-26',
  totalBudget: 600,
}

export const team = [
  { id: 'maya', name: 'Maya', roles: ['Director'], skills: ['Storyboarding', 'Midjourney'], contact: 'maya@example.com' },
  { id: 'tom', name: 'Tom', roles: ['Budget Manager', 'Sound'], skills: ['Suno', 'Audacity'], contact: 'tom@example.com' },
  { id: 'aria', name: 'Aria', roles: ['Writer'], skills: ['Scripts', 'Dialogue'], contact: 'aria@example.com' },
  { id: 'sam', name: 'Sam', roles: ['Prompt Engineer', 'Editor'], skills: ['Runway', 'Premiere Pro'], contact: 'sam@example.com' },
]

export const tasks = [
  { id: 1, phase: 'idea', title: 'Pick the film idea', owner: 'maya', due: '2027-01-20', status: 'Done', done: true },
  { id: 2, phase: 'idea', title: 'Read the competition rules together', owner: 'tom', due: '2027-01-22', status: 'Done', done: true, lesson: true },
  { id: 3, phase: 'script', title: 'Write the logline', owner: 'aria', due: '2027-01-28', status: 'Done', done: true },
  { id: 4, phase: 'script', title: 'Script draft v2', owner: 'aria', due: '2027-02-05', status: 'In progress', done: false },
  { id: 5, phase: 'storyboard', title: 'Lock character look sheets', owner: 'maya', due: '2027-02-10', status: 'Not started', done: false, lesson: true },
  { id: 6, phase: 'audio', title: 'Record voiceover', owner: 'tom', due: '2027-03-01', status: 'Not started', done: false },
  { id: 7, phase: 'submit', title: 'Export a test file in the required format', owner: 'sam', due: '2027-03-20', status: 'Not started', done: false, lesson: true },
]

export const categories = [
  { id: 'ai', name: 'AI tool subscriptions', planned: 250 },
  { id: 'music', name: 'Music', planned: 40 },
  { id: 'voice', name: 'Voiceover', planned: 60 },
  { id: 'software', name: 'Software', planned: 80 },
  { id: 'equipment', name: 'Equipment', planned: 70 },
  { id: 'fees', name: 'Prizes / entry fees', planned: 50 },
  { id: 'other', name: 'Other', planned: 50 },
]

export const expenses = [
  { id: 1, item: 'Runway Standard (1 month)', amount: 22.0, category: 'ai', date: '2027-01-25', paidBy: 'sam' },
  { id: 2, item: 'Midjourney Basic', amount: 16.5, category: 'ai', date: '2027-01-26', paidBy: 'maya' },
  { id: 3, item: 'Suno Pro', amount: 49.0, category: 'music', date: '2027-02-02', paidBy: 'tom' },
  { id: 4, item: 'Competition entry fee', amount: 25.0, category: 'fees', date: '2027-02-03', paidBy: 'tom' },
]

export const activity = [
  { id: 1, who: 'maya', text: "ticked 'Pick the film idea'", section: 'Checklist', ago: '2 min ago' },
  { id: 2, who: 'tom', text: 'added $49.00 · Suno Pro · Music', section: 'Budget', ago: '1 hr ago' },
  { id: 3, who: 'aria', text: "changed 'Script draft v2' to In progress", section: 'Checklist', ago: '3 hr ago' },
  { id: 4, who: 'sam', text: 'joined the team as Prompt Engineer', section: 'Team', ago: 'yesterday' },
]

export const me = 'maya'

export const nzd = (n) => n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' })
export const person = (id) => team.find((p) => p.id === id)
export const initials = (name) => name.slice(0, 2).toUpperCase()
