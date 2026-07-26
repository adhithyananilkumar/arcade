import initialContent from '../data/content.json';
import type { ContentSummary } from '../types';
import { listResponse, maybeError, type MockRequest, type MockResult } from './shared';

let itemsStore: ContentSummary[] = [...(initialContent as ContentSummary[])];

export function listContent(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;

  const typeParam = req.searchParams.get('type');
  const qParam = req.searchParams.get('q');

  let filtered = [...itemsStore];

  if (typeParam && typeParam !== 'ALL') {
    filtered = filtered.filter((item) => item.type.toUpperCase() === typeParam.toUpperCase());
  }

  if (qParam && qParam.trim()) {
    const query = qParam.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
  }

  return listResponse(filtered, req, (i) => ({
    id: `generated-content-${i}`,
    type: i % 2 === 0 ? 'COURSE' : 'ROADMAP',
    title: `Generated Studio Content ${i + 1}`,
    description: `Auto-generated mock item ${i + 1} for long list testing in dev mode.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    status: i % 3 === 0 ? 'PUBLISHED' : i % 3 === 1 ? 'DRAFT' : 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function createCourse(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;

  const body = (req.body || {}) as { title?: string; description?: string };
  const newCourse: ContentSummary = {
    id: `course-${Date.now()}`,
    type: 'COURSE',
    title: body.title || 'Untitled Course',
    description: body.description || null,
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  itemsStore.unshift(newCourse);
  return { status: 201, body: newCourse };
}

export function listCourses(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;
  const courses = itemsStore.filter((i) => i.type === 'COURSE');
  return listResponse(courses, req, (i) => ({
    id: `course-long-${i}`,
    type: 'COURSE',
    title: `Generated Course ${i + 1}`,
    description: `Auto-generated course ${i + 1} for dev mode testing.`,
    coverImageUrl: null,
    status: i % 2 === 0 ? 'SUBMITTED' : 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function createWorkshop(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;

  const body = (req.body || {}) as { title?: string; description?: string };
  const newWorkshop: ContentSummary = {
    id: `workshop-${Date.now()}`,
    type: 'WORKSHOP',
    title: body.title || 'Untitled Workshop',
    description: body.description || null,
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  itemsStore.unshift(newWorkshop);
  return { status: 201, body: newWorkshop };
}

export function createRoadmap(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;

  const body = (req.body || {}) as { title?: string; description?: string; graphJson?: unknown };
  const newRoadmap: ContentSummary = {
    id: `roadmap-${Date.now()}`,
    type: 'ROADMAP',
    title: body.title || 'Untitled Roadmap',
    description: body.description || null,
    coverImageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&q=80',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  itemsStore.unshift(newRoadmap);
  return { status: 201, body: newRoadmap };
}

