"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, BookOpen, TrendingUp, Calendar, Target, Clock } from "lucide-react"
import Link from "next/link"

interface StudySession {
  id: string
  set_id: string
  user_id: string
  cards_studied: number
  cards_correct: number
  session_date: string
}

interface FlashcardSet {
  id: string
  title: string
  description: string | null
}

interface StudyAnalyticsProps {
  flashcardSet: FlashcardSet
  sessions: StudySession[]
}

export function StudyAnalytics({ flashcardSet, sessions }: StudyAnalyticsProps) {
  // Calculate statistics
  const totalSessions = sessions.length
  const totalCardsStudied = sessions.reduce((sum, session) => sum + session.cards_studied, 0)
  const totalCardsCorrect = sessions.reduce((sum, session) => sum + session.cards_correct, 0)
  const averageAccuracy = totalCardsStudied > 0 ? Math.round((totalCardsCorrect / totalCardsStudied) * 100) : 0

  // Recent performance (last 5 sessions)
  const recentSessions = sessions.slice(0, 5)
  const recentAccuracy =
    recentSessions.length > 0
      ? Math.round(
          (recentSessions.reduce((sum, session) => sum + session.cards_correct, 0) /
            recentSessions.reduce((sum, session) => sum + session.cards_studied, 0)) *
            100,
        )
      : 0

  // Best session
  const bestSession = sessions.reduce(
    (best, session) => {
      const accuracy = session.cards_studied > 0 ? (session.cards_correct / session.cards_studied) * 100 : 0
      return accuracy > best.accuracy ? { session, accuracy } : best
    },
    { session: null as StudySession | null, accuracy: 0 },
  )

  // Study streak (consecutive days with sessions)
  const studyStreak = calculateStudyStreak(sessions)

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const equations = [
              "E=mc²",
              "a²+b²=c²",
              "∫f(x)dx",
              "∑n=1",
              "π≈3.14",
              "∞",
              "√x",
              "∆y/∆x",
              "sin²+cos²=1",
              "lim→∞",
              "∂f/∂x",
              "∇²φ",
            ]
            return (
              <div
                key={i}
                className="absolute text-primary/20 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <span className="text-lg font-mono">{equations[i % equations.length]}</span>
              </div>
            )
          })}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-balance bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Study Analytics
              </h1>
              <p className="text-muted-foreground text-pretty">{flashcardSet.title}</p>
            </div>
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <Link href={`/study/${flashcardSet.id}`} className="flex-1 sm:flex-none">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50 hover:border-primary w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Study Now</span>
                  <span className="sm:hidden">Study</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  className="border-2 border-secondary/50 hover:border-secondary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              </Link>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <span className="text-8xl animate-pulse">📊</span>
                <div className="absolute -top-2 -right-2">
                  <span className="text-2xl animate-bounce font-mono">∑</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">No study sessions yet</h2>
              <p className="text-muted-foreground mb-6">Start studying to see your progress and analytics</p>
              <Link href={`/study/${flashcardSet.id}`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/25 transition-all duration-300">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Studying
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-card border-2 border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{totalSessions}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-secondary/30 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Overall Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">{averageAccuracy}%</div>
                    <p className="text-xs text-muted-foreground">
                      {totalCardsCorrect} of {totalCardsStudied} cards
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Recent Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">{recentAccuracy}%</div>
                    <p className="text-xs text-muted-foreground">Last 5 sessions</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Study Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{studyStreak}</div>
                    <p className="text-xs text-muted-foreground">consecutive days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Best Session */}
              {bestSession.session && (
                <Card className="bg-card border-2 border-secondary/30 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300 mb-8">
                  <CardHeader>
                    <CardTitle className="text-foreground">Best Session</CardTitle>
                    <CardDescription className="text-muted-foreground">Your highest accuracy session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-secondary">{Math.round(bestSession.accuracy)}%</div>
                        <p className="text-sm text-muted-foreground">
                          {bestSession.session.cards_correct} of {bestSession.session.cards_studied} cards correct
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">
                          {new Date(bestSession.session.session_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bestSession.session.session_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Sessions */}
              <Card className="bg-card border-2 border-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Sessions</CardTitle>
                  <CardDescription className="text-muted-foreground">Your latest study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.slice(0, 10).map((session) => {
                      const accuracy =
                        session.cards_studied > 0
                          ? Math.round((session.cards_correct / session.cards_studied) * 100)
                          : 0
                      return (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="flex items-center gap-4">
                              <div className="text-lg font-semibold text-primary">{accuracy}%</div>
                              <div className="text-sm text-muted-foreground">
                                <span className="text-secondary font-medium">{session.cards_correct}</span> of{" "}
                                <span className="text-accent font-medium">{session.cards_studied}</span> cards correct
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-foreground">
                              {new Date(session.session_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(session.session_date).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function calculateStudyStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Group sessions by date
  const sessionsByDate = new Map<string, boolean>()
  sessions.forEach((session) => {
    const date = new Date(session.session_date)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.toISOString().split("T")[0]
    sessionsByDate.set(dateKey, true)
  })

  let streak = 0
  const currentDate = new Date(today)

  // Check if there's a session today, if not start from yesterday
  const todayKey = today.toISOString().split("T")[0]
  if (!sessionsByDate.has(todayKey)) {
    currentDate.setDate(currentDate.getDate() - 1)
  }

  // Count consecutive days with sessions
  while (true) {
    const dateKey = currentDate.toISOString().split("T")[0]
    if (sessionsByDate.has(dateKey)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
