'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { api } from '@/infrastructure/http/api';
import { Play, Pause, Library, Search, Tag, Plus, Pencil } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { toast } from 'sonner';

interface ConsoleCourse {
  id: string;
  title: string;
  authorName: string;
  status: string;
  enrollments: number;
}

type CategoryType = 'COURSES' | 'EVENTS' | 'ARTICLES';

const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: 'COURSES', label: 'Self-Paced Courses' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'ARTICLES', label: 'Articles' },
];

const CATEGORY_TYPE_LABELS: Record<string, string> = {
  COURSES: 'Self-Paced Courses',
  EVENTS: 'Events',
  ARTICLES: 'Articles',
};

interface ConsoleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  type: CategoryType;
  displayOrder: number;
  active: boolean;
}

export default function ContentManagePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canManageCategories = AuthorizationService.canManageCategories(user);
  const [activeTab, setActiveTab] = useState<'PUBLISHED' | 'SUSPENDED' | 'CATEGORIES'>('PUBLISHED');
  const [courses, setCourses] = useState<ConsoleCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<ConsoleCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{ name: string; description: string; type: CategoryType }>({
    name: '',
    description: '',
    type: 'COURSES',
  });
  const [savingCategory, setSavingCategory] = useState(false);

  if (!AuthorizationService.canReviewPlatformContent(user)) {
    notFound();
  }

  const loadCourses = () => {
    setLoading(true);
    api
      .get<ConsoleCourse[]>('/api/v1/console/content/courses')
      .then(setCourses)
      .catch((e) => setError(e.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCategories = () => {
    setCategoriesLoading(true);
    api
      .get<ConsoleCategory[]>('/api/v1/console/categories')
      .then(setCategories)
      .catch((e) => toast.error(e.message || 'Failed to load categories'))
      .finally(() => setCategoriesLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'CATEGORIES' && canManageCategories) {
      loadCategories();
    }
  }, [activeTab, canManageCategories]);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '', type: 'COURSES' });
  };

  const startEditCategory = (category: ConsoleCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      type: category.type || 'COURSES',
    });
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSavingCategory(true);
    try {
      if (editingCategoryId) {
        await api.patch(`/api/v1/console/categories/${editingCategoryId}`, {
          name: categoryForm.name,
          description: categoryForm.description,
          type: categoryForm.type,
        });
        toast.success('Category updated');
      } else {
        await api.post('/api/v1/console/categories', {
          name: categoryForm.name,
          description: categoryForm.description,
          type: categoryForm.type,
        });
        toast.success('Category created');
      }
      resetCategoryForm();
      loadCategories();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const toggleCategoryActive = async (category: ConsoleCategory) => {
    try {
      await api.patch(`/api/v1/console/categories/${category.id}`, { active: !category.active });
      loadCategories();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update category');
    }
  };

  const filteredCourses = courses.filter(c => {
    if (c.status !== activeTab) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(query) || 
           c.authorName.toLowerCase().includes(query);
  });

  return (
    <div className="flex w-full flex-col h-full space-y-5 pb-6">
      <div className="flex-none sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200/80 bg-white/80 p-1 pr-4 shadow-[0_4px_14px_rgba(20,20,43,0.04)] backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('PUBLISHED')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all",
              activeTab === 'PUBLISHED' 
                ? "bg-[#14142b] text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-[#14142b]"
            )}
          >
            <Library size={14} />
            Content Manage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUSPENDED')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all",
              activeTab === 'SUSPENDED' 
                ? "bg-rose-600 text-white shadow-sm" 
                : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            )}
          >
            <Pause size={14} />
            Suspended courses
          </button>
          {canManageCategories && (
            <button
              type="button"
              onClick={() => setActiveTab('CATEGORIES')}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all",
                activeTab === 'CATEGORIES'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              )}
            >
              <Tag size={14} />
              Categories
            </button>
          )}
        </div>

        {activeTab !== 'CATEGORIES' && (
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        )}
      </div>

      {activeTab === 'CATEGORIES' && canManageCategories ? (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 relative space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              {editingCategoryId ? 'Edit category' : 'New category'}
            </h3>
            <div className="flex flex-wrap gap-3 items-start">
              <input
                type="text"
                placeholder="Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))}
                className="h-9 flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={categoryForm.type}
                onChange={(e) => setCategoryForm((f) => ({ ...f, type: e.target.value as CategoryType }))}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={saveCategory}
                disabled={savingCategory}
                className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Plus size={14} />
                {editingCategoryId ? 'Save' : 'Create'}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="h-9 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="tracking-wider border-b border-slate-200 bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Type</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Description</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {categoriesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading categories...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No categories yet.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                          {CATEGORY_TYPE_LABELS[category.type] || category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-[320px] truncate whitespace-normal">
                        {category.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          category.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditCategory(category)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCategoryActive(category)}
                            className={cn(
                              "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                              category.active ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            {category.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 relative">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border-b border-red-100 rounded-t-2xl">
              {error}
            </div>
          )}
          
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="tracking-wider border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Course</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Author</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Enrollments</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Status</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading courses...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No courses found.</td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="transition-colors hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => router.push(`/console/content-manage/${course.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{course.title}</td>
                    <td className="px-6 py-4 text-slate-600">{course.authorName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{course.enrollments.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        course.status === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" :
                        course.status === 'SUSPENDED' ? "bg-rose-100 text-rose-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {course.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
