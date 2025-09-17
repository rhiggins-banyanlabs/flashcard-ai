import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl font-mono text-muted-foreground/20 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {["E=mc²", "a²+b²=c²", "∫f(x)dx", "π≈3.14", "Σx²", "∇²φ=0", "e^(iπ)+1=0", "F=ma"][i]}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-8 mt-8 relative z-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Thank you for signing up!</CardTitle>
                <CardDescription className="text-muted-foreground">Check your email to confirm</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  You've successfully signed up. Please check your email to confirm your account before signing in.
                </p>
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Return to Sign In
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
