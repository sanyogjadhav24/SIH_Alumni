import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Global Alumni Network",
      description:
        "Connect with thousands of alumni from top universities worldwide",
    },
    {
      icon: MessageCircle,
      title: "Mentorship Program",
      description: "Get guidance from experienced professionals in your field",
    },
    {
      icon: Calendar,
      title: "Exclusive Events",
      description:
        "Attend networking events, workshops, and reunion gatherings",
    },
    {
      icon: TrendingUp,
      title: "Career Opportunities",
      description: "Discover job openings and business partnerships",
    },
  ];

  const testimonials = [
    {
      name: "  Chen",
      role: "Software Engineer at Google",
      batch: "MIT Class of 2018",
      content:
        "AlumniConnect helped me find an amazing mentor who guided my career transition into tech.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Entrepreneur",
      batch: "Stanford Class of 2015",
      content:
        "Through the platform, I found co-founders for my startup and investors from our alumni network.",
      rating: 5,
    },
    {
      name: "EmilySakshi Sonawane",
      role: "Data Scientist at Netflix",
      batch: "UC Berkeley Class of 2019",
      content:
        "The mentorship program connected me with industry leaders. I got my dream job thanks to referrals.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                AlmaConnect
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              >
                About
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
              </Button>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border-0">
              🎓 Trusted by 50,000+ Alumni Worldwide
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Connect with Your
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Alumni Community
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the premier professional network for university graduates.
              Find mentors, discover opportunities, and build lasting
              connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg"
                >
                  Join Your Alumni Network
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-gray-300 dark:border-gray-600"
                >
                  Sign In to Your Account
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  50K+
                </div>
                <div className="text-gray-600 dark:text-gray-400">Alumni</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  1000+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Universities
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  95%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AlmaConnect?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The most comprehensive platform for alumni networking and
              professional growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="pt-8 pb-6">
                    <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary dark:text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Alumni Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real stories from professionals who transformed their careers
              through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.batch}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Expand Your Network?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful alumni who are already leveraging their
            connections for career growth and meaningful relationships.
          </p>

          <Link href="/auth/signup">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
            >
              Start Networking Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">AlmaConnect</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2024 AlmaConnect. All rights reserved. Connecting alumni
            worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
}
