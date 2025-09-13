import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  Star,
  Check,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Landing = () => {
  const features = [
    {
      icon: Users,
      title: "Global Alumni Network",
      description: "Connect with thousands of alumni from top universities worldwide"
    },
    {
      icon: MessageCircle,
      title: "Mentorship Program",
      description: "Get guidance from experienced professionals in your field"
    },
    {
      icon: Calendar,
      title: "Exclusive Events",
      description: "Attend networking events, workshops, and reunion gatherings"
    },
    {
      icon: TrendingUp,
      title: "Career Opportunities",
      description: "Discover job openings and business partnerships"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      batch: "MIT Class of 2018",
      content: "AlumniNet helped me find an amazing mentor who guided my career transition into tech. The connections I made here are invaluable.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Entrepreneur",
      batch: "Stanford Class of 2015", 
      content: "Through the platform, I found co-founders for my startup and investors from our alumni network. Game-changing!",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Data Scientist at Netflix",
      batch: "UC Berkeley Class of 2019",
      content: "The mentorship program connected me with industry leaders. I got my dream job thanks to the referrals I received here.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AlumniNet
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Alumni networking" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero/90" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
            🎓 Trusted by 50,000+ Alumni Worldwide
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect with Your
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Alumni Community
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join the premier professional network for university graduates. Find mentors, 
            discover opportunities, and build lasting connections that advance your career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                Join Your Alumni Network
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="glass" className="h-14 px-8 text-lg">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose AlumniNet?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive platform for alumni networking and professional growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-200">
                  <CardContent className="pt-8 pb-6">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Alumni Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from professionals who transformed their careers through our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.batch}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Expand Your Network?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful alumni who are already leveraging their connections 
            for career growth and meaningful relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                Start Networking Today
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-white/80">Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-white/80">Universities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">AlumniNet</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
              <Link to="/contact" className="hover:text-primary">Contact Us</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 AlumniNet. All rights reserved. Connecting alumni worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
};