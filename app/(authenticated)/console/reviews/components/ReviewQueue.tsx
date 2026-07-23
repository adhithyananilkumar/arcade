'use client';

import { useQuery } from '@tanstack/react-query';
import { ReviewApi } from '@/shared/api/review.api';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function ReviewQueue() {
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['platform-reviews'],
    queryFn: ReviewApi.listPendingReviews
  });

  const reviews = reviewsData ? [...reviewsData].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) : [];

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse">Loading review queue...</div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load reviews.</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900">No pending reviews</h3>
        <p className="mt-1 text-sm text-gray-500">The review queue is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Status</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Course</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Channel</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Version</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Review</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Submitted</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reviewer</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  Pending
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{review.title}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{review.channelName}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">v{review.versionNumber}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">#{review.reviewNumber}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.submittedAt), { addSuffix: true })}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                Unassigned
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link
                  href={`/console/reviews/${review.reviewRoundId}`}
                  className="text-indigo-600 hover:text-indigo-900 font-semibold"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
