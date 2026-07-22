"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/infrastructure/http/api"
import { Button } from "@/shared/design-system/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/design-system/ui/card"
import { Calendar, Play } from "lucide-react"

interface ExamDto {
  courseId: string
  title: string
  coverImageUrl?: string
  examSchedule?: string
}

export default function ExamDashboard() {
  const router = useRouter()
  const [exams, setExams] = useState<ExamDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.get<ExamDto[]>("/api/v1/learning/enrollments/exams/today")
        setExams(data)
      } catch (err: any) {
        setError(err.message || "Failed to load exams.")
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
        <p className="font-semibold text-lg">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Today's Exams</h1>
        <p className="text-slate-500 mt-2">
          Your scheduled exams for today from your enrolled courses.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Calendar className="mx-auto size-12 text-slate-400 mb-4" />
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Exams Today</h2>
          <p className="text-slate-500">You don't have any exams scheduled for today in your enrolled courses.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.courseId} className="flex flex-col overflow-hidden group">
              <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {exam.coverImageUrl ? (
                  <img
                    src={exam.coverImageUrl}
                    alt={exam.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-4xl font-serif text-white opacity-50">
                      {exam.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{exam.title}</CardTitle>
                <CardDescription>Scheduled for Today</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500">
                  This exam is available only for today. Once started, you must complete it in a single sitting.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => router.push(`/learn/${exam.courseId}/exam`)}
                >
                  <Play size={16} />
                  Start Exam
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
