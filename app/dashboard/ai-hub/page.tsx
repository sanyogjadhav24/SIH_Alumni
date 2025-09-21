import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Briefcase,
  BarChart3,
  Sparkles,
  Settings
} from 'lucide-react'

export default function AIHubPage() {
  const aiTools = [
    {
      id: 1,
      title: 'Career Path Advisor',
      description: 'Get personalized career guidance based on your background and alumni success stories.',
      status: 'Beta',
      icon: TrendingUp,
      action: 'Try Now'
    },
    {
      id: 2,
      title: 'Mentorship Matcher',
      description: 'AI matches you with the perfect mentor based on your goals and interests.',
      status: 'New',
      icon: Users,
      action: 'Try Now'
    },
    {
      id: 3,
      title: 'Resume Optimizer',
      description: 'Enhance your resume with AI suggestions based on industry trends.',
      status: 'Alpha',
      icon: Briefcase,
      action: 'Try Now'
    },
    {
      id: 4,
      title: 'Network Insights',
      description: 'Discover hidden connections and networking opportunities in your alumni network.',
      status: 'Beta',
      icon: BarChart3,
      action: 'Try Now'
    }
  ]

  const usageStats = [
    { label: 'Career Insights', value: 85, color: 'bg-primary' },
    { label: 'Network Analysis', value: 72, color: 'bg-green-500' },
    { label: 'Job Matching', value: 94, color: 'bg-purple-500' },
    { label: 'Skill Analysis', value: 68, color: 'bg-orange-500' }
  ]

  const insights = [
    {
      title: 'Alumni Success Patterns',
      value: '+34%',
      description: 'Career growth rate for alumni in tech industry',
      trend: 'up'
    },
    {
      title: 'Networking Opportunities',
      value: '7 New',
      description: 'Potential connections identified this week',
      trend: 'up'
    },
    {
      title: 'Skill Recommendations',
      value: '+18%',
      description: 'Increase job match rate by learning Python',
      trend: 'up'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Hub</h1>
          <p className="text-gray-500">Harness the power of AI to enhance your alumni experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2" size="sm">
            <Sparkles className="h-4 w-4" />
            Get AI Insights
          </Button>
        </div>
      </div>

      {/* AI Assistant */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-gray-600">Beta</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90" size="sm">
              Get AI Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Usage This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stat.label}</span>
                  <span className="font-medium">{stat.value}%</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge className="bg-green-100 text-green-700">{insight.value}</Badge>
                </div>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{tool.title}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tool.status}
                    </Badge>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-7 px-3">
                    {tool.action}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">{tool.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button variant="ghost" size="sm" className="bg-white shadow-sm text-xs">AI Features</Button>
          <Button variant="ghost" size="sm" className="text-xs">Recent Activity</Button>
          <Button variant="ghost" size="sm" className="text-xs">Analytics</Button>
        </div>
      </div>
    </div>
  )
}