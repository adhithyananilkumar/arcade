import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeAndEventsSection } from './ResumeAndEventsSection';
import type { CourseSummaryResponse } from '@/shared/types/api.types';

// Mock review service
vi.mock('@/domains/learning/delivery/api/reviews', () => ({
  courseReviewService: {
    statsFor: vi.fn().mockResolvedValue({}),
  },
}));

describe('ResumeAndEventsSection - Organization Course Card Avatars', () => {
  const baseOrgCourse: CourseSummaryResponse = {
    id: 'course-123',
    title: 'Advanced AI Systems',
    description: 'Learn scalable artificial intelligence workflows.',
    coverImageUrl: 'https://example.com/cover.jpg',
    duration: '10h',
    categoryId: 'cat-1',
    pricingModel: 'FREE',
    priceAmount: 0,
    currency: 'USD',
    authorId: 'user-1',
    authorName: 'Alex Doe',
    authorUsername: 'alexdoe',
    authorAvatarUrl: '/api/v1/users/avatars/alex.jpg',
    channel: {
      id: 'chan-1',
      name: 'Tech In',
      iconUrl: 'https://example.com/tech-in.png',
      isPersonal: false,
    },
    collaborators: [
      {
        id: 'collab-1',
        name: 'Alex Doe',
        avatarUrl: '/api/v1/users/avatars/alex.jpg',
        role: 'Author',
      },
    ],
    moduleCount: 4,
    hasExam: false,
    enrollmentCount: 150,
  };

  it('renders organization name and instructor avatar on the right with resolved URL', () => {
    render(<ResumeAndEventsSection resumeCourse={null} recommendedCourses={[baseOrgCourse]} />);

    expect(screen.getByText('Tech In')).toBeInTheDocument();
    expect(screen.queryByText('Organization')).not.toBeInTheDocument();

    const instructorImg = screen.getByAltText('Alex Doe');
    expect(instructorImg).toBeInTheDocument();
    expect(instructorImg).toHaveAttribute('src', expect.stringContaining('/users/avatars/alex.jpg'));
  });

  it('falls back gracefully to initials when instructor has no avatar image', () => {
    const noAvatarCourse: CourseSummaryResponse = {
      ...baseOrgCourse,
      collaborators: [
        {
          id: 'collab-2',
          name: 'Sarah Connor',
          avatarUrl: null,
          role: 'Instructor',
        },
      ],
    };

    render(<ResumeAndEventsSection resumeCourse={null} recommendedCourses={[noAvatarCourse]} />);

    expect(screen.getByText('SC')).toBeInTheDocument();
  });

  it('falls back gracefully to initials when instructor image produces onError', () => {
    render(<ResumeAndEventsSection resumeCourse={null} recommendedCourses={[baseOrgCourse]} />);

    const img = screen.getByAltText('Alex Doe');
    fireEvent.error(img);

    // After error, image is replaced by initials fallback
    expect(screen.getByText('AD')).toBeInTheDocument();
  });

  it('renders multiple instructors with overlapping avatars and +N badge when > 3', () => {
    const multiInstructorCourse: CourseSummaryResponse = {
      ...baseOrgCourse,
      collaborators: [
        { id: '1', name: 'Alice Smith', avatarUrl: null, role: 'Instructor' },
        { id: '2', name: 'Bob Jones', avatarUrl: null, role: 'Instructor' },
        { id: '3', name: 'Charlie Brown', avatarUrl: null, role: 'Instructor' },
        { id: '4', name: 'David White', avatarUrl: null, role: 'Instructor' },
        { id: '5', name: 'Eve Davis', avatarUrl: null, role: 'Instructor' },
      ],
    };

    render(<ResumeAndEventsSection resumeCourse={null} recommendedCourses={[multiInstructorCourse]} />);

    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByText('BJ')).toBeInTheDocument();
    expect(screen.getByText('CB')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
