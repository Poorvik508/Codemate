import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Brain, Users, MessageSquare, Zap, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-24 px-4">
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Find Your Perfect
              <span className="block gradient-text">Coding Partner</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            AI-powered matching connects developers based on skills, availability, and project goals. 
            Code together, learn together, build amazing things together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link to="/ai-chat">
              <Button size="lg" variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-100 hover:text-blue-900 text-lg px-8 py-3">
                Try AI Matching
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Code Elements */}
        <div className="absolute top-20 left-10 text-blue-300 text-6xl opacity-20 animate-float">&lt;/&gt;</div>
        <div className="absolute bottom-20 right-10 text-purple-300 text-4xl opacity-20 animate-float" style={{animationDelay: '1s'}}>{ }</div>
        <div className="absolute top-1/2 right-20 text-cyan-300 text-5xl opacity-20 animate-float" style={{animationDelay: '2s'}}>( )</div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Codemate?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligent matching, seamless collaboration, and a community of passionate developers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes your skills, preferences, and goals to find the perfect coding partners.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Skill-Based Pairing</h3>
                <p className="text-muted-foreground">
                  Match with developers who complement your skills or share your expertise level.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50 hover:border-success/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-success/10 w-fit mb-4 group-hover:bg-success/20 transition-colors">
                  <MessageSquare className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Built-in messaging system to discuss projects, share ideas, and coordinate collaboration.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50 hover:border-warning/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-warning/10 w-fit mb-4 group-hover:bg-warning/20 transition-colors">
                  <Zap className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quick Setup</h3>
                <p className="text-muted-foreground">
                  Create your profile in minutes and start finding coding partners immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">All Skill Levels</h3>
                <p className="text-muted-foreground">
                  From beginners to experts, find partners who match your experience and learning goals.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  Verified profiles and secure messaging ensure a safe environment for collaboration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Find Your Coding Partner?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have found their perfect coding companions through Codemate.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-lg px-8 py-3 animate-glow">
              Start Matching Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;